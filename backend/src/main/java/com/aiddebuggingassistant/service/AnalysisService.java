package com.aiddebuggingassistant.service;

import com.aiddebuggingassistant.config.AnalysisProperties;
import com.aiddebuggingassistant.config.OpenAiAnalysisProperties;
import com.aiddebuggingassistant.domain.AnalysisEntity;
import com.aiddebuggingassistant.dto.AnalysisResponse;
import com.aiddebuggingassistant.dto.AnalyzeRequest;
import com.aiddebuggingassistant.dto.FixSuggestion;
import com.aiddebuggingassistant.exception.AnalysisFailedException;
import com.aiddebuggingassistant.repository.AnalysisRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalysisService {

    private static final int MAX_STACK_CHARS = 2000;
    private static final int MAX_CODE_CHARS = 4000;
    private static final int MAX_SUGGESTED_CODE_CHARS = 12000;

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);

    private final WebClient openAiWebClient;
    private final ObjectMapper objectMapper;
    private final OpenAiAnalysisProperties openAiProperties;
    private final AnalysisProperties analysisProperties;
    private final AnalysisRepository analysisRepository;

    public AnalysisService(
            WebClient openAiWebClient,
            ObjectMapper objectMapper,
            OpenAiAnalysisProperties openAiProperties,
            AnalysisProperties analysisProperties,
            AnalysisRepository analysisRepository) {
        this.openAiWebClient = openAiWebClient;
        this.objectMapper = objectMapper;
        this.openAiProperties = openAiProperties;
        this.analysisProperties = analysisProperties;
        this.analysisRepository = analysisRepository;
    }

    @Transactional
    public AnalysisResponse analyze(AnalyzeRequest request) {
        if (openAiProperties.getApiKey() == null || openAiProperties.getApiKey().isBlank()) {
            throw new AnalysisFailedException("OpenAI API key is not configured");
        }

        String stack = truncate(request.stackTrace(), MAX_STACK_CHARS);
        String code = truncate(request.code(), MAX_CODE_CHARS);
        String language = request.language();

        log.info(
                "Analyze request language={} stackChars={} codeChars={}",
                language,
                stack.length(),
                code.length());

        String systemPrompt = buildSystemPrompt();
        List<String> repairHints = new ArrayList<>();

        int max = Math.max(1, openAiProperties.getMaxAttempts());

        for (int attempt = 1; attempt <= max; attempt++) {
            String userPrompt = buildUserPrompt(stack, code, language, repairHints);
            String content;
            try {
                content = callChatCompletions(systemPrompt, userPrompt);
            } catch (WebClientResponseException e) {
                log.error(
                        "OpenAI HTTP error status={} bodySnippet={}",
                        e.getStatusCode().value(),
                        abbreviate(e.getResponseBodyAsString(), 500));
                throw new AnalysisFailedException("OpenAI request failed", e);
            } catch (AnalysisFailedException e) {
                throw e;
            } catch (Exception e) {
                log.error("OpenAI request failed: {}", e.toString());
                throw new AnalysisFailedException("OpenAI request failed", e);
            }

            AnalysisResponse parsed;
            try {
                parsed = objectMapper.readValue(content, AnalysisResponse.class);
            } catch (JsonProcessingException e) {
                if (attempt < max) {
                    log.warn(
                            "Analyze attempt {}/{} JSON parse failed: {}",
                            attempt,
                            max,
                            e.getOriginalMessage());
                    repairHints.add("Invalid JSON: " + abbreviate(e.getOriginalMessage(), 200));
                    continue;
                }
                log.warn("Analyze gave up after {} attempts (parse)", max);
                throw new AnalysisFailedException("Model returned invalid JSON", e);
            }

            String validationError = validate(parsed);
            if (validationError != null) {
                if (attempt < max) {
                    log.warn(
                            "Analyze attempt {}/{} validation failed: {}",
                            attempt,
                            max,
                            validationError);
                    repairHints.add(validationError);
                    continue;
                }
                log.warn("Analyze gave up after {} attempts (validation: {})", max, validationError);
                throw new AnalysisFailedException("Model response failed validation");
            }

            AnalysisResponse result = clampConfidences(parsed);
            persistIfEnabled(stack, code, language, result);
            log.info("Analyze succeeded after {} attempt(s)", attempt);
            return result;
        }

        throw new AnalysisFailedException("Analyze exhausted attempts");
    }

    private void persistIfEnabled(String stack, String code, String language, AnalysisResponse result) {
        if (!analysisProperties.isPersistResults()) {
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(result);
            AnalysisEntity entity = new AnalysisEntity();
            entity.setLanguage(language);
            entity.setStackTrace(stack);
            entity.setCode(code);
            entity.setResultJson(json);
            analysisRepository.save(entity);
        } catch (Exception e) {
            log.warn("Failed to persist analysis (response still returned): {}", e.getMessage());
        }
    }

    private static String truncate(String s, int max) {
        if (s == null || s.isEmpty()) {
            return "";
        }
        if (s.length() <= max) {
            return s;
        }
        return s.substring(0, max);
    }

    private static String abbreviate(String s, int max) {
        if (s == null) {
            return "";
        }
        String t = s.replace("\n", " ").trim();
        return t.length() <= max ? t : t.substring(0, max) + "...";
    }

    private String buildSystemPrompt() {
        return """
                You are a senior software engineer. You analyze stack traces and code.

                You MUST return ONLY a single valid JSON object (no markdown fences, no commentary) with exactly this structure:
                {
                  "rootCause": "short cause",
                  "explanation": "clear explanation of why it happens",
                  "fixes": [
                    { "description": "first suggested fix", "suggestedCode": "concrete code", "confidence": 0.0 },
                    { "description": "second suggested fix", "suggestedCode": "concrete code", "confidence": 0.0 },
                    { "description": "optional third fix", "suggestedCode": "concrete code", "confidence": 0.0 }
                  ]
                }

                Rules:
                - fixes must contain exactly 2 or 3 objects
                - each description must be non-empty
                - each suggestedCode must be non-empty: actual source code in the SAME language as the user's "Language" field, grounded in their stack trace and code snippet. Prefer the smallest copy-pasteable change (e.g. corrected method, block, or file excerpt). Do not wrap the string in markdown code fences; escape any double quotes inside the JSON string.
                - each suggestedCode should stay under about 8000 characters; omit unrelated boilerplate
                - confidence must be a number between 0.0 and 1.0 (inclusive) indicating likelihood the fix addresses the root cause
                - rank fixes: highest confidence first
                """;
    }

    private String buildUserPrompt(String stack, String code, String language, List<String> repairHints) {
        StringBuilder sb = new StringBuilder();
        sb.append("Language: ").append(language).append("\n\n");
        sb.append("Stack trace:\n").append(stack).append("\n\n");
        sb.append("Code:\n").append(code);
        if (!repairHints.isEmpty()) {
            sb.append("\n\n");
            sb.append("Your previous answer was rejected. Fix it. Problems:\n");
            for (String hint : repairHints) {
                sb.append("- ").append(hint).append("\n");
            }
            sb.append("\nReturn ONLY the JSON object as specified.");
        }
        return sb.toString();
    }

    private String callChatCompletions(String systemPrompt, String userPrompt) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", openAiProperties.getModel());
        body.put("temperature", 0.2);
        body.put("response_format", Map.of("type", "json_object"));
        body.put(
                "messages",
                List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)));

        String responseJson = openAiWebClient
                .post()
                .uri("/v1/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + openAiProperties.getApiKey().trim())
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block(openAiProperties.getResponseTimeout().plusSeconds(5));

        if (responseJson == null || responseJson.isBlank()) {
            throw new AnalysisFailedException("Empty OpenAI response");
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(responseJson);
        } catch (JsonProcessingException e) {
            throw new AnalysisFailedException("Could not parse OpenAI response envelope", e);
        }
        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new AnalysisFailedException("OpenAI response missing choices");
        }
        String content = choices.get(0).path("message").path("content").asText(null);
        if (content == null || content.isBlank()) {
            throw new AnalysisFailedException("OpenAI message content empty");
        }
        return content.trim();
    }

    private static String validate(AnalysisResponse r) {
        if (r == null) {
            return "null response";
        }
        if (r.rootCause() == null || r.rootCause().isBlank()) {
            return "rootCause missing or blank";
        }
        if (r.explanation() == null || r.explanation().isBlank()) {
            return "explanation missing or blank";
        }
        if (r.fixes() == null) {
            return "fixes is null";
        }
        int n = r.fixes().size();
        if (n < 2 || n > 3) {
            return "fixes must have 2-3 items, got " + n;
        }
        for (int i = 0; i < n; i++) {
            FixSuggestion f = r.fixes().get(i);
            if (f == null) {
                return "fix " + i + " is null";
            }
            if (f.description() == null || f.description().isBlank()) {
                return "fix " + i + " description empty";
            }
            if (f.suggestedCode() == null || f.suggestedCode().isBlank()) {
                return "fix " + i + " suggestedCode empty";
            }
            if (f.suggestedCode().length() > MAX_SUGGESTED_CODE_CHARS) {
                return "fix " + i + " suggestedCode too long (max " + MAX_SUGGESTED_CODE_CHARS + " chars)";
            }
            if (Double.isNaN(f.confidence()) || Double.isInfinite(f.confidence())) {
                return "fix " + i + " confidence not finite";
            }
        }
        return null;
    }

    private AnalysisResponse clampConfidences(AnalysisResponse parsed) {
        int clamped = 0;
        List<FixSuggestion> out = new ArrayList<>();
        for (FixSuggestion f : parsed.fixes()) {
            double c = f.confidence();
            double nc = Math.max(0.0, Math.min(1.0, c));
            if (Double.compare(nc, c) != 0) {
                clamped++;
            }
            out.add(new FixSuggestion(f.description(), f.suggestedCode(), nc));
        }
        if (clamped > 0) {
            log.warn("Clamped {} confidence value(s) into [0.0, 1.0]", clamped);
        }
        return new AnalysisResponse(parsed.rootCause(), parsed.explanation(), List.copyOf(out));
    }
}
