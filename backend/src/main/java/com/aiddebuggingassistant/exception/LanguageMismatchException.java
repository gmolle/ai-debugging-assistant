package com.aiddebuggingassistant.exception;

/**
 * Input signals a different language than the user selected. Carries the detected name for API clients.
 */
public final class LanguageMismatchException extends RuntimeException {

    private final String suggestedLanguage;

    public LanguageMismatchException(String suggestedLanguage, String message) {
        super(message);
        this.suggestedLanguage = suggestedLanguage;
    }

    public String getSuggestedLanguage() {
        return suggestedLanguage;
    }
}
