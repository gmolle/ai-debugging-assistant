package com.aiddebuggingassistant.service;

import com.aiddebuggingassistant.exception.LanguageMismatchException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CodeLanguageConsistencyCheckerTest {

    private final CodeLanguageConsistencyChecker checker = new CodeLanguageConsistencyChecker();

    @Test
    void allowsMatchingJava() {
        assertThatCode(
                        () ->
                                checker.assertConsistentWithSelection(
                                        "",
                                        "import java.util.List;\npublic class A { public static void main(String[] a) {} }",
                                        "Java"))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsJavaSnippetWhenLanguageIsCSharp() {
        assertThatThrownBy(
                        () ->
                                checker.assertConsistentWithSelection(
                                        "",
                                        "import java.util.List;\npublic class A { public static void main(String[] a) {} }",
                                        "C#"))
                .isInstanceOf(LanguageMismatchException.class)
                .satisfies(
                        ex ->
                                assertThat(((LanguageMismatchException) ex).getSuggestedLanguage())
                                        .isEqualTo("Java"));
    }

    @Test
    void rejectsWhenStackTraceFileExtensionConflicts() {
        assertThatThrownBy(
                        () ->
                                checker.assertConsistentWithSelection(
                                        "at demo.Demo.main(Demo.java:12)", "x", "Ruby"))
                .isInstanceOf(LanguageMismatchException.class);
    }

    @Test
    void skipsCheckWhenSignalsAreWeak() {
        assertThatCode(() -> checker.assertConsistentWithSelection("", "x = 1", "Go"))
                .doesNotThrowAnyException();
    }
}
