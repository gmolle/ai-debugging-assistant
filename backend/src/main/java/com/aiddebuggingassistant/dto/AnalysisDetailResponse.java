package com.aiddebuggingassistant.dto;

import java.time.Instant;
import java.util.UUID;

public record AnalysisDetailResponse(
        UUID id,
        Instant createdAt,
        String language,
        String stackTrace,
        String code,
        AnalysisResponse analysis
) {}
