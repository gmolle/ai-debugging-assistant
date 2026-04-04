package com.aiddebuggingassistant.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FixSuggestion(
        String description,
        String suggestedCode,
        double confidence
) {}
