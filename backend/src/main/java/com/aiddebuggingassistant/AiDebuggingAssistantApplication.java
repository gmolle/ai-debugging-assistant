package com.aiddebuggingassistant;

import com.aiddebuggingassistant.config.AnalysisProperties;
import com.aiddebuggingassistant.config.OpenAiAnalysisProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
@EnableConfigurationProperties({OpenAiAnalysisProperties.class, AnalysisProperties.class})
public class AiDebuggingAssistantApplication {

    private static final Logger log = LoggerFactory.getLogger(AiDebuggingAssistantApplication.class);

    public static void main(String[] args) {
        loadBackendEnvFile();
        SpringApplication.run(AiDebuggingAssistantApplication.class, args);
    }

    /**
     * Loads {@code .env} from the JVM working directory (use {@code backend/.env} when starting
     * via Maven from {@code backend/}). Lines are {@code KEY=value}. OS environment variables
     * win over the file. Values are applied as Java system properties so
     * {@code app.openai.api-key: ${OPENAI_API_KEY:}} in {@code application.yml} resolves.
     */
    private static void loadBackendEnvFile() {
        Path envFile = Path.of(".env");
        if (!Files.isRegularFile(envFile)) {
            return;
        }
        try {
            List<String> lines = Files.readAllLines(envFile, StandardCharsets.UTF_8);
            int applied = 0;
            for (String raw : lines) {
                String line = raw.replaceFirst("^\uFEFF", "").trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eq = line.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = line.substring(0, eq).trim();
                if (key.isEmpty()) {
                    continue;
                }
                String val = line.substring(eq + 1).trim();
                if ((val.startsWith("\"") && val.endsWith("\""))
                        || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.substring(1, val.length() - 1);
                }
                if (System.getenv(key) == null) {
                    System.setProperty(key, val);
                    applied++;
                }
            }
            if (applied > 0) {
                log.info("Loaded {} variable(s) from .env ({}); OPENAI_API_KEY {}", applied, envFile.toAbsolutePath(), isOpenAiKeyPresent() ? "is set" : "is not set");
            }
        } catch (IOException e) {
            log.warn("Could not read .env at {}: {}", envFile.toAbsolutePath(), e.getMessage());
        }
    }

    private static boolean isOpenAiKeyPresent() {
        String env = System.getenv("OPENAI_API_KEY");
        if (env != null && !env.isBlank()) {
            return true;
        }
        String prop = System.getProperty("OPENAI_API_KEY");
        return prop != null && !prop.isBlank();
    }
}
