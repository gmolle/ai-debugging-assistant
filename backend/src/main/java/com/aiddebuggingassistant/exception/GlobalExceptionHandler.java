package com.aiddebuggingassistant.exception;

import com.aiddebuggingassistant.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final String GENERIC_MESSAGE =
            "Unable to analyze input at this time. Please try again.";

    /**
     * Browsers request /favicon.ico (and similar) on the API origin; we have no static files.
     * Do not treat as a server error or log at ERROR.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResource(NoResourceFoundException ex) {
        log.debug("No resource: {}", ex.getResourcePath());
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(GENERIC_MESSAGE));
    }

    @ExceptionHandler(AnalysisFailedException.class)
    public ResponseEntity<ErrorResponse> handleAnalysisFailed(AnalysisFailedException ex) {
        log.warn("Analysis failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponse(GENERIC_MESSAGE));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Void> handleResponseStatus(ResponseStatusException ex) {
        if (ex.getStatusCode().is4xxClientError()) {
            log.debug("Client error {}: {}", ex.getStatusCode().value(), ex.getReason());
        } else {
            log.warn("Status {}: {}", ex.getStatusCode().value(), ex.getReason());
        }
        return ResponseEntity.status(ex.getStatusCode()).build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        log.error("Unhandled error", ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponse(GENERIC_MESSAGE));
    }
}
