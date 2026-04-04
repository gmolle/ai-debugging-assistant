package com.aiddebuggingassistant.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AnalysisResponseJsonTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void deserializesLegacyPayloadWithoutSuggestedCode() throws Exception {
        String json =
                """
                {"rootCause":"r","explanation":"e","fixes":[
                  {"description":"a","confidence":0.9},
                  {"description":"b","confidence":0.5}
                ]}""";
        AnalysisResponse r = objectMapper.readValue(json, AnalysisResponse.class);
        assertThat(r.fixes()).hasSize(2);
        assertThat(r.fixes().get(0).suggestedCode()).isNull();
        assertThat(r.fixes().get(1).suggestedCode()).isNull();
    }

    @Test
    void deserializesPayloadWithSuggestedCode() throws Exception {
        String json =
                """
                {"rootCause":"r","explanation":"e","fixes":[
                  {"description":"a","suggestedCode":"return x;","confidence":0.9},
                  {"description":"b","suggestedCode":"y++;","confidence":0.5}
                ]}""";
        AnalysisResponse r = objectMapper.readValue(json, AnalysisResponse.class);
        assertThat(r.fixes().get(0).suggestedCode()).isEqualTo("return x;");
    }
}
