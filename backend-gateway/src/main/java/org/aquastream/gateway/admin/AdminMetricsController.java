package org.aquastream.gateway.admin;

import org.springframework.data.domain.Range;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(path = "/api/v1/admin/metrics", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminMetricsController {

    private final ReactiveStringRedisTemplate redis;

    public AdminMetricsController(ReactiveStringRedisTemplate redis) {
        this.redis = redis;
    }

    @GetMapping("/series")
    public Mono<Map<String, Object>> series(
            @RequestParam("service") String service,
            @RequestParam("metric") String metric,
            @RequestParam(value = "range", defaultValue = "h24") String range
    ) {
        String key = "metrics:" + service + ":" + metric;
        Instant now = Instant.now();
        Instant from = switch (range) {
            case "h1" -> now.minus(Duration.ofHours(1));
            case "h6" -> now.minus(Duration.ofHours(6));
            case "h24" -> now.minus(Duration.ofHours(24));
            case "d7" -> now.minus(Duration.ofDays(7));
            default -> now.minus(Duration.ofHours(24));
        };
        double min = from.getEpochSecond();
        double max = now.getEpochSecond();

        Flux<Map<String, Object>> points = redis.opsForZSet()
                .rangeByScoreWithScores(key, Range.closed(min, max))
                .map(tuple -> {
                    Map<String, Object> p = new HashMap<>();
                    p.put("ts", (long) Math.floor(tuple.getScore()));
                    p.put("value", parseDoubleSafely(tuple.getValue()));
                    return p;
                });

        return points.collectList().map(list -> Map.of(
                "service", service,
                "metric", metric,
                "range", range,
                "series", list
        ));
    }

    private double parseDoubleSafely(String v) {
        try {
            return Double.parseDouble(v);
        } catch (Exception e) {
            return 0.0;
        }
    }
}


