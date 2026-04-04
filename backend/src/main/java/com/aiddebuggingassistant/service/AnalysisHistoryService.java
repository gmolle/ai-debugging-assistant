package com.aiddebuggingassistant.service;

import com.aiddebuggingassistant.domain.AnalysisEntity;
import com.aiddebuggingassistant.dto.AnalysisDetailResponse;
import com.aiddebuggingassistant.dto.AnalysisResponse;
import com.aiddebuggingassistant.dto.AnalysisSummaryResponse;
import com.aiddebuggingassistant.repository.AnalysisRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AnalysisHistoryService {

    private static final int ROOT_CAUSE_PREVIEW_MAX = 160;
    private static final int STACK_HEADLINE_MAX = 100;

    private final AnalysisRepository analysisRepository;
    private final ObjectMapper objectMapper;

    public AnalysisHistoryService(AnalysisRepository analysisRepository, ObjectMapper objectMapper) {
        this.analysisRepository = analysisRepository;
        this.objectMapper = objectMapper;
    }

    public List<AnalysisSummaryResponse> listRecent(int limit) {
        var page = PageRequest.of(0, limit);
        return analysisRepository.findAllByOrderByCreatedAtDesc(page).stream()
                .map(this::toSummary)
                .toList();
    }

    public AnalysisDetailResponse getById(UUID id) {
        AnalysisEntity entity = analysisRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found"));
        return toDetail(entity);
    }

    private AnalysisSummaryResponse toSummary(AnalysisEntity e) {
        return new AnalysisSummaryResponse(
                e.getId(),
                e.getCreatedAt(),
                e.getLanguage(),
                extractRootCauseSummary(e.getResultJson()),
                stackHeadline(e.getStackTrace()));
    }

    private AnalysisDetailResponse toDetail(AnalysisEntity e) {
        AnalysisResponse analysis;
        try {
            analysis = objectMapper.readValue(e.getResultJson(), AnalysisResponse.class);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored analysis is invalid");
        }
        return new AnalysisDetailResponse(
                e.getId(), e.getCreatedAt(), e.getLanguage(), e.getStackTrace(), e.getCode(), analysis);
    }

    private String extractRootCauseSummary(String resultJson) {
        try {
            JsonNode n = objectMapper.readTree(resultJson);
            JsonNode rc = n.get("rootCause");
            if (rc != null && rc.isTextual()) {
                String s = rc.asText().trim();
                if (s.isEmpty()) {
                    return "Saved analysis";
                }
                return s.length() > ROOT_CAUSE_PREVIEW_MAX
                        ? s.substring(0, ROOT_CAUSE_PREVIEW_MAX) + "…"
                        : s;
            }
        } catch (Exception ignored) {
            // fall through
        }
        return "Saved analysis";
    }

    private static String stackHeadline(String stackTrace) {
        if (stackTrace == null || stackTrace.isBlank()) {
            return "";
        }
        String first = stackTrace.trim().split("\\R", 2)[0].trim();
        return first.length() > STACK_HEADLINE_MAX ? first.substring(0, STACK_HEADLINE_MAX) + "…" : first;
    }
}
