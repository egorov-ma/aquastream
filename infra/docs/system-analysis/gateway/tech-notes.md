# Gateway Service – Tech Notes

## application.yml (excerpt)
```yaml
server:
  port: 8080
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lowerCaseServiceId: true
```

## Custom Filters
- `JwtAuthenticationFilter`
- `RequestRateLimiter` (Redis)
- `LoggingFilter`

## Route DB Table
`gateway_routes` – хранит JSON столбцы `predicates`, `filters`.

## Health endpoints
`/actuator/gateway/routes`, `/actuator/metrics`. 