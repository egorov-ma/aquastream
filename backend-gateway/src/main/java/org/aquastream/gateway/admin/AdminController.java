package org.aquastream.gateway.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "/api/v1/admin", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminController {

    private final WebClient webClient;
    private final List<String> services;

    public AdminController(WebClient.Builder builder,
                           @Value("${gateway.admin.services:http://localhost:8101,http://localhost:8102,http://localhost:8103,http://localhost:8104,http://localhost:8105,http://localhost:8106}") List<String> services) {
        this.webClient = builder.build();
        this.services = services;
    }

    @GetMapping("/health")
    public Mono<Map<String, Object>> health() {
        return Mono.fromCallable(() -> services)
                .flatMapMany(Flux::fromIterable)
                .flatMap(url -> webClient.get()
                        .uri(url + "/actuator/health")
                        .retrieve()
                        .bodyToMono(Map.class)
                        .timeout(Duration.ofSeconds(2))
                        .map(body -> Map.entry(url, body))
                        .onErrorResume(e -> Mono.just(Map.entry(url, Map.of("status", "DOWN"))))
                ).collectList()
                .map(list -> Map.of("services", list));
    }
}


