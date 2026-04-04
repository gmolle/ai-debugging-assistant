package com.aiddebuggingassistant.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(
                        ex ->
                                assertThat(((ResponseStatusException) ex).getStatusCode())
                                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void rejectsWhenStackTraceFileExtensionConflicts() {
        assertThatThrownBy(
                        () ->
                                checker.assertConsistentWithSelection(
                                        "at demo.Demo.main(Demo.java:12)", "x", "Ruby"))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void skipsCheckWhenSignalsAreWeak() {
        assertThatCode(() -> checker.assertConsistentWithSelection("", "x = 1", "Go"))
                .doesNotThrowAnyException();
    }
}
