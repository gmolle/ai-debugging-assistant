package com.aiddebuggingassistant.exception;

import com.aiddebuggingassistant.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

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
        String detail =
                ex.getBindingResult().getAllErrors().stream()
                        .map(ObjectError::getDefaultMessage)
                        .filter(m -> m != null && !m.isBlank())
                        .collect(Collectors.joining(" "));
        if (detail.isBlank()) {
            detail = GENERIC_MESSAGE;
        }
        log.warn("Validation failed: {}", detail);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(detail));
    }

    @ExceptionHandler(AnalysisFailedException.class)
    public ResponseEntity<ErrorResponse> handleAnalysisFailed(AnalysisFailedException ex) {
        log.warn("Analysis failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponse(GENERIC_MESSAGE));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(ResponseStatusException ex) {
        HttpStatusCode status = ex.getStatusCode();
        String reason = ex.getReason();
        if (status.is4xxClientError()) {
            if (reason != null && !reason.isBlank()) {
                log.debug("Client error {}: {}", status.value(), reason);
                return ResponseEntity.status(status).body(new ErrorResponse(reason));
            }
            log.debug("Client error {} (no message)", status.value());
            return ResponseEntity.status(status).build();
        }
        log.warn("Status {}: {}", status.value(), reason);
        return ResponseEntity.status(status).build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        log.error("Unhandled error", ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponse(GENERIC_MESSAGE));
    }
}
