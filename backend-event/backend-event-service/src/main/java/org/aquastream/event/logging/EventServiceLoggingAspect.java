package org.aquastream.event.logging;

import org.aquastream.common.logging.CorrelationIdInterceptor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class EventServiceLoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(EventServiceLoggingAspect.class);

    @Around("execution(* org.aquastream.event.grpc.EventServiceImpl.*(..))")
    public Object logGrpcServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String correlationId = CorrelationIdInterceptor.getCurrentCorrelationId();
        
        // Структурированные поля для логирования
        MDC.put("method", methodName);
        MDC.put("service", "event-service");
        MDC.put("type", "grpc");
        
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("Starting gRPC method execution", 
                "method", methodName, 
                "correlationId", correlationId);
            
            Object result = joinPoint.proceed();
            
            long executionTime = System.currentTimeMillis() - startTime;
            logger.info("Completed gRPC method execution", 
                "method", methodName,
                "correlationId", correlationId,
                "executionTimeMs", executionTime,
                "status", "success");
            
            return result;
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("Failed gRPC method execution", 
                "method", methodName,
                "correlationId", correlationId,
                "executionTimeMs", executionTime,
                "status", "error",
                "errorMessage", e.getMessage(),
                "errorType", e.getClass().getSimpleName());
            throw e;
        } finally {
            // Очищаем MDC от метода-специфичных полей
            MDC.remove("method");
            MDC.remove("service");
            MDC.remove("type");
        }
    }

    @Around("execution(* org.aquastream.event.grpc.gateway.EventGrpcGateway.*(..))")
    public Object logRestGatewayMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String correlationId = MDC.get("correlationId");
        
        // Структурированные поля для логирования
        MDC.put("method", methodName);
        MDC.put("service", "event-service");
        MDC.put("type", "rest-gateway");
        
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("Starting REST gateway method execution",
                "method", methodName,
                "correlationId", correlationId);
            
            Object result = joinPoint.proceed();
            
            long executionTime = System.currentTimeMillis() - startTime;
            logger.info("Completed REST gateway method execution",
                "method", methodName,
                "correlationId", correlationId,
                "executionTimeMs", executionTime,
                "status", "success");
            
            return result;
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("Failed REST gateway method execution",
                "method", methodName,
                "correlationId", correlationId,
                "executionTimeMs", executionTime,
                "status", "error",
                "errorMessage", e.getMessage(),
                "errorType", e.getClass().getSimpleName());
            throw e;
        } finally {
            // Очищаем MDC от метода-специфичных полей
            MDC.remove("method");
            MDC.remove("service");
            MDC.remove("type");
        }
    }

    @AfterThrowing(pointcut = "execution(* org.aquastream.event.grpc.validation.*.*(..))", throwing = "exception")
    public void logValidationErrors(JoinPoint joinPoint, Throwable exception) {
        String methodName = joinPoint.getSignature().getName();
        String correlationId = MDC.get("correlationId");
        
        logger.warn("Validation error occurred",
            "method", methodName,
            "correlationId", correlationId,
            "validationError", exception.getMessage(),
            "errorType", exception.getClass().getSimpleName());
    }
}