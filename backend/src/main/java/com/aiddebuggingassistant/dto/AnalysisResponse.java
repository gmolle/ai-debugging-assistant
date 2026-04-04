package com.aiddebuggingassistant.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AnalysisResponse(
        String rootCause,
        String explanation,
        List<FixSuggestion> fixes
) {}
