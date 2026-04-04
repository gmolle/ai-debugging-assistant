package com.aiddebuggingassistant.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Heuristic check that the user-selected language matches stack trace / code signals.
 * Intentionally conservative: ambiguous snippets are not rejected.
 */
@Component
public class CodeLanguageConsistencyChecker {

    private static final int FILE_EXT_SCORE = 14;

    /** Need a clear winner before we complain. */
    private static final int MIN_DOMINANT_SCORE = 10;

    /** How much stronger the detected language must be than the user's choice. */
    private static final int MIN_LEAD_OVER_CLAIMED = 8;

    /** Avoid false positives when two languages score similarly (e.g. Java vs C# boilerplate). */
    private static final int MIN_LEAD_OVER_RUNNER_UP = 4;

    private static final Pattern FILE_EXT_LINE =
            Pattern.compile("\\.(java|cs|cpp|cc|cxx|go|rs|rb|py|js|mjs|cjs|ts|tsx|jsx)\\s*:\\d+", Pattern.CASE_INSENSITIVE);

    private record Signal(String language, Pattern pattern, int weight) {}

    private static final List<Signal> SIGNALS =
            List.of(
                    new Signal("Java", Pattern.compile("import\\s+java\\."), 12),
                    new Signal("Java", Pattern.compile("public\\s+static\\s+void\\s+main\\s*\\("), 8),
                    new Signal("Java", Pattern.compile("System\\.out\\."), 5),
                    new Signal("C#", Pattern.compile("using\\s+System\\s*;"), 10),
                    new Signal("C#", Pattern.compile("Console\\.(Write(Line)?|Read(Line)?)\\s*\\("), 6),
                    new Signal("C#", Pattern.compile("static\\s+void\\s+Main\\s*\\("), 7),
                    new Signal("C++", Pattern.compile("#\\s*include\\s*<"), 10),
                    new Signal("C++", Pattern.compile("\\bstd::"), 5),
                    new Signal("C++", Pattern.compile("\\bcout\\s*<<"), 4),
                    new Signal("Go", Pattern.compile("package\\s+main\\b"), 10),
                    new Signal("Go", Pattern.compile("\\bfunc\\s+main\\s*\\("), 8),
                    new Signal("Go", Pattern.compile("\\bfmt\\."), 5),
                    new Signal("Rust", Pattern.compile("\\bfn\\s+main\\s*\\("), 9),
                    new Signal("Rust", Pattern.compile("println!\\s*\\("), 7),
                    new Signal("Rust", Pattern.compile("\\buse\\s+std::"), 5),
                    new Signal("Rust", Pattern.compile("\\blet\\s+mut\\s+"), 3),
                    new Signal("Ruby", Pattern.compile("(?m)^\\s*def\\s+\\w+"), 7),
                    new Signal("Ruby", Pattern.compile("\\bputs\\s+"), 3),
                    new Signal("Ruby", Pattern.compile("require\\s+['\"]"), 4),
                    new Signal("Python", Pattern.compile("if\\s+__name__\\s*==\\s*['\"]__main__['\"]"), 10),
                    new Signal("Python", Pattern.compile("(?m)^\\s*def\\s+\\w+\\s*\\([^)]*\\)\\s*:"), 6),
                    new Signal("Python", Pattern.compile("\\bprint\\s*\\("), 3),
                    new Signal("JavaScript", Pattern.compile("\\brequire\\s*\\(\\s*['\"]"), 8),
                    new Signal("JavaScript", Pattern.compile("\\bmodule\\.exports\\b"), 8),
                    new Signal("TypeScript", Pattern.compile("(?m)^\\s*interface\\s+\\w+"), 8),
                    new Signal("TypeScript", Pattern.compile("(?m)^\\s*type\\s+\\w+\\s*="), 6),
                    new Signal("TypeScript", Pattern.compile("\\bas\\s+const\\b"), 3),
                    new Signal("TypeScript", Pattern.compile(":\\s*(string|number|boolean|void|unknown|never)\\b"), 4));

    public void assertConsistentWithSelection(String stackTrace, String code, String selectedLanguage) {
        Map<String, Integer> scores = score(stackTrace, code);
        Optional<String> topLang = dominantLanguage(scores);
        if (topLang.isEmpty()) {
            return;
        }
        String top = topLang.get();
        int topScore = scores.getOrDefault(top, 0);
        if (topScore < MIN_DOMINANT_SCORE) {
            return;
        }
        if (top.equals(selectedLanguage)) {
            return;
        }
        int runnerUp =
                scores.entrySet().stream()
                        .filter(e -> !e.getKey().equals(top))
                        .mapToInt(Map.Entry::getValue)
                        .max()
                        .orElse(0);
        if (topScore - runnerUp < MIN_LEAD_OVER_RUNNER_UP) {
            return;
        }
        int claimedScore = scores.getOrDefault(selectedLanguage, 0);
        if (topScore - claimedScore < MIN_LEAD_OVER_CLAIMED) {
            return;
        }
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "This input looks like "
                        + top
                        + ", but the language is set to "
                        + selectedLanguage
                        + ". Choose \""
                        + top
                        + "\" or change your stack trace / code.");
    }

    private static Map<String, Integer> score(String stackTrace, String code) {
        Map<String, Integer> scores = new HashMap<>();
        String combined = (stackTrace == null ? "" : stackTrace) + "\n" + (code == null ? "" : code);
        if (combined.isBlank()) {
            return scores;
        }
        applyFileExtensions(stackTrace, scores);
        applyFileExtensions(code, scores);
        for (Signal s : SIGNALS) {
            if (s.pattern.matcher(combined).find()) {
                scores.merge(s.language, s.weight, Integer::sum);
            }
        }
        return scores;
    }

    private static void applyFileExtensions(String text, Map<String, Integer> scores) {
        if (text == null || text.isBlank()) {
            return;
        }
        Matcher m = FILE_EXT_LINE.matcher(text);
        while (m.find()) {
            String ext = m.group(1).toLowerCase();
            switch (ext) {
                case "java" -> scores.merge("Java", FILE_EXT_SCORE, Integer::sum);
                case "cs" -> scores.merge("C#", FILE_EXT_SCORE, Integer::sum);
                case "cpp", "cc", "cxx" -> scores.merge("C++", FILE_EXT_SCORE, Integer::sum);
                case "go" -> scores.merge("Go", FILE_EXT_SCORE, Integer::sum);
                case "rs" -> scores.merge("Rust", FILE_EXT_SCORE, Integer::sum);
                case "rb" -> scores.merge("Ruby", FILE_EXT_SCORE, Integer::sum);
                case "py" -> scores.merge("Python", FILE_EXT_SCORE, Integer::sum);
                case "js", "mjs", "cjs" -> scores.merge("JavaScript", FILE_EXT_SCORE, Integer::sum);
                case "ts", "tsx" -> scores.merge("TypeScript", FILE_EXT_SCORE, Integer::sum);
                case "jsx" -> scores.merge("JavaScript", FILE_EXT_SCORE, Integer::sum);
                default -> {
                    // ignore
                }
            }
        }
    }

    private static Optional<String> dominantLanguage(Map<String, Integer> scores) {
        return scores.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .max(
                        Comparator.comparingInt(Map.Entry<String, Integer>::getValue)
                                .thenComparing(Map.Entry::getKey))
                .map(Map.Entry::getKey);
    }
}
