package com.aiddebuggingassistant;

import com.aiddebuggingassistant.config.AnalysisProperties;
import com.aiddebuggingassistant.config.OpenAiAnalysisProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({OpenAiAnalysisProperties.class, AnalysisProperties.class})
public class AiDebuggingAssistantApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiDebuggingAssistantApplication.class, args);
    }
}
