package com.aiddebuggingassistant.dto;

import java.util.List;

public record AnalysisResponse(
        String rootCause,
        String explanation,
        List<FixSuggestion> fixes
) {}
