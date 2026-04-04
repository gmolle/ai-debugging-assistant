package com.aiddebuggingassistant.exception;

/**
 * Analysis could not be completed; clients receive a generic error message.
 */
public class AnalysisFailedException extends RuntimeException {

    public AnalysisFailedException(String message) {
        super(message);
    }

    public AnalysisFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
