# AquaStream gRPC Monitoring Setup

Comprehensive monitoring solution for AquaStream gRPC services using Prometheus, Grafana, and Alertmanager.

## 📋 Overview

This monitoring stack provides:
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert management and notifications
- **gRPC-specific metrics**: Custom interceptors for detailed gRPC monitoring

## 🚀 Quick Start

### 1. Start Monitoring Stack

```bash
# From the monitoring directory
cd infra/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Access Services

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093

### 3. Start AquaStream Services

```bash
# Start all services with monitoring enabled
docker-compose up -d
```

## 📊 Available Dashboards

### gRPC Services Overview
- **URL**: `http://localhost:3000/d/grpc-overview`
- **Features**:
  - Request rate by service/method
  - Response time percentiles (50th, 95th, 99th)
  - Error rates by error type
  - Active connections gauge
  - Memory usage trends

### gRPC Performance Dashboard
- **URL**: `http://localhost:3000/d/grpc-performance`
- **Features**:
  - Detailed performance metrics per method
  - Connection tracking
  - Message processing rates
  - System resource utilization
  - Cancellation rates

## 📈 Key Metrics

### Request Metrics
- `grpc_server_started_total`: Total gRPC calls started
- `grpc_server_completed_total`: Total gRPC calls completed
- `grpc_server_duration_seconds`: Response time histograms
- `grpc_server_errors_total`: Error counts by type

### Connection Metrics
- `grpc_active_connections`: Current active connections
- `grpc_total_connections`: Total connections established
- `grpc_server_cancelled_total`: Cancelled request count

### System Metrics
- `grpc_memory_usage_bytes`: Memory usage estimation
- `grpc_thread_pool_active`: Active thread count

## 🚨 Alerting Rules

### Performance Alerts
- **GrpcHighErrorRate**: Error rate > 5% for 2 minutes
- **GrpcCriticalErrorRate**: Error rate > 20% for 1 minute
- **GrpcHighLatency**: 95th percentile > 1s for 3 minutes
- **GrpcCriticalLatency**: 95th percentile > 5s for 1 minute

### Availability Alerts
- **GrpcServiceDown**: Service unreachable for 1 minute
- **GrpcNoRequests**: No requests for 5 minutes

### Resource Alerts
- **GrpcHighMemoryUsage**: Memory usage > 1GB for 5 minutes
- **GrpcTooManyConnections**: Active connections > 1000 for 2 minutes
- **GrpcConnectionLeak**: Connection growth rate doubled

### Business Logic Alerts
- **GrpcHighValidationErrors**: Validation errors > 10/sec for 3 minutes
- **GrpcHighCancellationRate**: Cancellation rate > 10% for 3 minutes

## ⚙️ Configuration

### Enable gRPC Monitoring

Add to your service's `application.yml`:

```yaml
aquastream:
  monitoring:
    grpc:
      enabled: true
      detailed-metrics: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    tags:
      application: ${spring.application.name}
      service: your-service-name
      version: 1.0.0
    export:
      prometheus:
        enabled: true
        step: 10s
    distribution:
      percentiles-histogram:
        grpc.server.duration.seconds: true
      slo:
        grpc.server.duration.seconds: 50ms,100ms,200ms,500ms,1s,2s,5s
```

### Custom Metrics

The `GrpcMetricsInterceptor` automatically creates metrics for:
- Request rates per method
- Response time distributions  
- Error counts by type and method
- Connection tracking
- Message counts

## 🔧 Development Setup

### Local Development

For local development, services are available at:
- Event Service: `localhost:8082/actuator/prometheus`
- Crew Service: `localhost:8083/actuator/prometheus`
- Gateway Service: `localhost:8080/actuator/prometheus`

### Docker Environment

In Docker, services use internal networking:
- Event Service: `event-service:8082`
- Crew Service: `crew-service:8083`

## 📝 Troubleshooting

### Common Issues

1. **Metrics not appearing**
   - Check service is exposing `/actuator/prometheus`
   - Verify Prometheus can reach the service
   - Check logs: `docker logs aquastream-prometheus`

2. **Dashboard showing no data**
   - Verify Prometheus datasource is configured
   - Check metric names match in queries
   - Confirm time range is appropriate

3. **Alerts not firing**
   - Check alert rules syntax: `promtool check rules grpc-alerts.yml`
   - Verify Alertmanager is configured
   - Check alert rule evaluation in Prometheus UI

### Debugging Commands

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check available metrics
curl http://localhost:8082/actuator/prometheus | grep grpc

# Test alert rules
docker exec aquastream-prometheus promtool check rules /etc/prometheus/grpc-alerts.yml

# View Grafana logs
docker logs aquastream-grafana
```

## 🔍 Monitoring Best Practices

### Performance Optimization
- Use histogram buckets appropriate for your SLAs
- Monitor both success and error rates
- Track percentiles, not just averages
- Set up proper retention policies

### Alerting Strategy
- Start with high-level alerts (service down, high error rate)
- Add detailed alerts based on actual issues
- Use runbooks for alert resolution
- Regular alert rule reviews

### Dashboard Design
- Focus on user-impacting metrics first
- Use consistent time ranges across panels
- Include context with annotations
- Regular dashboard reviews and updates

## 📚 Additional Resources

- [Prometheus gRPC Monitoring](https://prometheus.io/docs/guides/go-application/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/manage-dashboards/)
- [Micrometer Prometheus Integration](https://micrometer.io/docs/registry/prometheus)
- [gRPC Monitoring Guide](https://grpc.io/docs/guides/monitoring/)

## 🤝 Contributing

To add new metrics or dashboards:
1. Add metrics in the `GrpcMetricsInterceptor`
2. Update Prometheus configuration
3. Create/update Grafana dashboards
4. Add corresponding alert rules
5. Update this documentation