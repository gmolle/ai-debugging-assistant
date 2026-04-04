package com.aiddebuggingassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AnalyzeRequest(
        @NotBlank String stackTrace,
        @NotBlank String code,
        @NotBlank
        @Pattern(
                regexp =
                        "C#|C\\+\\+|Go|Java|JavaScript|Python|Ruby|Rust|TypeScript",
                message =
                        "language must be one of: C#, C++, Go, Java, JavaScript, Python, Ruby, Rust, TypeScript")
        String language
) {}
