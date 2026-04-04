package com.aiddebuggingassistant.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.openai")
public class OpenAiAnalysisProperties {

    /**
     * Total LLM round-trips per analyze request (first try + repair attempts).
     */
    private int maxAttempts = 2;

    /**
     * HTTP response timeout for OpenAI API calls.
     */
    private Duration responseTimeout = Duration.ofSeconds(10);

    /**
     * API key from environment (e.g. OPENAI_API_KEY); never log this value.
     */
    private String apiKey = "";

    /**
     * Chat Completions model id.
     */
    private String model = "gpt-4o-mini";

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public Duration getResponseTimeout() {
        return responseTimeout;
    }

    public void setResponseTimeout(Duration responseTimeout) {
        this.responseTimeout = responseTimeout;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
