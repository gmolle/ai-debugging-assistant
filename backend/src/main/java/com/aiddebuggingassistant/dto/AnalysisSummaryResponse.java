package com.aiddebuggingassistant.dto;

import java.time.Instant;
import java.util.UUID;

public record AnalysisSummaryResponse(
        UUID id,
        Instant createdAt,
        String language,
        String rootCauseSummary,
        String stackHeadline
) {}
