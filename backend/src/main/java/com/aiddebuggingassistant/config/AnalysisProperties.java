package com.aiddebuggingassistant.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.analysis")
public class AnalysisProperties {

    /**
     * When true, persist successful analyses to the database.
     */
    private boolean persistResults = true;

    public boolean isPersistResults() {
        return persistResults;
    }

    public void setPersistResults(boolean persistResults) {
        this.persistResults = persistResults;
    }
}
