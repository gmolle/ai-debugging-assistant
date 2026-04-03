package com.aiddebuggingassistant.config;

import io.netty.channel.ChannelOption;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient openAiWebClient(OpenAiAnalysisProperties properties) {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(properties.getResponseTimeout())
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5_000);

        return WebClient.builder()
                .baseUrl("https://api.openai.com")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
