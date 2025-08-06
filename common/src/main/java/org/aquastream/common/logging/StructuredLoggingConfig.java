package org.aquastream.common.logging;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.filter.ThresholdFilter;
import ch.qos.logback.core.ConsoleAppender;
import net.logstash.logback.encoder.LogstashEncoder;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StructuredLoggingConfig {

    @Value("${spring.application.name:unknown-service}")
    private String serviceName;
    
    @Value("${aquastream.logging.structured.enabled:true}")
    private boolean structuredLoggingEnabled;
    
    @Value("${aquastream.logging.level.root:INFO}")
    private String rootLogLevel;

    @Bean
    @ConditionalOnProperty(name = "aquastream.logging.structured.enabled", havingValue = "true", matchIfMissing = true)
    public LoggerContext configureStructuredLogging() {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        
        // Получаем root logger
        Logger rootLogger = context.getLogger(Logger.ROOT_LOGGER_NAME);
        rootLogger.detachAndStopAllAppenders();
        
        if (structuredLoggingEnabled) {
            configureJsonLogging(context, rootLogger);
        } else {
            configurePatternLogging(context, rootLogger);
        }
        
        return context;
    }

    private void configureJsonLogging(LoggerContext context, Logger rootLogger) {
        // JSON Console Appender
        ConsoleAppender<ch.qos.logback.classic.spi.ILoggingEvent> consoleAppender = new ConsoleAppender<>();
        consoleAppender.setContext(context);
        consoleAppender.setName("CONSOLE_JSON");
        
        LogstashEncoder encoder = new LogstashEncoder();
        encoder.setContext(context);
        encoder.setIncludeContext(true);
        encoder.setIncludeMdc(true);
        encoder.setCustomFields("{\"service\":\"" + serviceName + "\"}");
        encoder.start();
        
        consoleAppender.setEncoder(encoder);
        
        // Threshold filter для production
        ThresholdFilter filter = new ThresholdFilter();
        filter.setLevel(rootLogLevel);
        filter.start();
        consoleAppender.addFilter(filter);
        
        consoleAppender.start();
        rootLogger.addAppender(consoleAppender);
        
        rootLogger.setLevel(ch.qos.logback.classic.Level.toLevel(rootLogLevel));
    }

    private void configurePatternLogging(LoggerContext context, Logger rootLogger) {
        // Pattern Console Appender для development
        ConsoleAppender<ch.qos.logback.classic.spi.ILoggingEvent> consoleAppender = new ConsoleAppender<>();
        consoleAppender.setContext(context);
        consoleAppender.setName("CONSOLE_PATTERN");
        
        PatternLayoutEncoder encoder = new PatternLayoutEncoder();
        encoder.setContext(context);
        encoder.setPattern(
            "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{correlationId:-}] [%logger{36}] - %msg%n"
        );
        encoder.start();
        
        consoleAppender.setEncoder(encoder);
        consoleAppender.start();
        rootLogger.addAppender(consoleAppender);
        
        rootLogger.setLevel(ch.qos.logback.classic.Level.DEBUG);
    }
}