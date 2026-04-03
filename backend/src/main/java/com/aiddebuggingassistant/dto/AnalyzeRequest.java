package com.aiddebuggingassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AnalyzeRequest(
        @NotBlank String stackTrace,
        @NotBlank String code,
        @NotBlank
        @Pattern(regexp = "JavaScript|Java|Python", message = "language must be Java, JavaScript, or Python")
        String language
) {}
