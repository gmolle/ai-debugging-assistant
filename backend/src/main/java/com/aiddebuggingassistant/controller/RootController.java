package com.aiddebuggingassistant.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> root() {
        return Map.of(
                "service", "ai-debugging-assistant",
                "health", "/actuator/health",
                "analyze", "POST /api/analyze"
        );
    }
}
