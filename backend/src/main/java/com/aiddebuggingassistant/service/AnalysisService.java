package com.aiddebuggingassistant.service;

import com.aiddebuggingassistant.dto.AnalysisResponse;
import com.aiddebuggingassistant.dto.AnalyzeRequest;
import org.springframework.stereotype.Service;

@Service
public class AnalysisService {

    /**
     * TODO: truncate inputs, call OpenAI (JSON mode), Jackson parse, validate, bounded retry, optional persist.
     */
    public AnalysisResponse analyze(AnalyzeRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
