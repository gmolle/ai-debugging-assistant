package com.aiddebuggingassistant.controller;

import com.aiddebuggingassistant.dto.AnalysisDetailResponse;
import com.aiddebuggingassistant.dto.AnalysisSummaryResponse;
import com.aiddebuggingassistant.service.AnalysisHistoryService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/analyses", produces = MediaType.APPLICATION_JSON_VALUE)
public class AnalysisHistoryController {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 50;

    private final AnalysisHistoryService analysisHistoryService;

    public AnalysisHistoryController(AnalysisHistoryService analysisHistoryService) {
        this.analysisHistoryService = analysisHistoryService;
    }

    @GetMapping("/recent")
    public List<AnalysisSummaryResponse> recent(
            @RequestParam(name = "limit", required = false, defaultValue = "20") int limit) {
        int n = limit < 1 ? DEFAULT_LIMIT : Math.min(limit, MAX_LIMIT);
        return analysisHistoryService.listRecent(n);
    }

    @GetMapping("/{id}")
    public AnalysisDetailResponse byId(@PathVariable UUID id) {
        return analysisHistoryService.getById(id);
    }
}
