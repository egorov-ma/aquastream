package org.aquastream.payment.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "org.aquastream.payment")
@EntityScan("org.aquastream.payment.db.entity")
@EnableJpaRepositories("org.aquastream.payment.db.repository")
@EnableConfigurationProperties
@OpenAPIDefinition(
    info = @Info(
        title = "AquaStream Payment Service API",
        version = "1.0",
        description = "Payment processing, QR codes and webhook handling",
        contact = @Contact(name = "AquaStream Team", email = "support@aquastream.org")
    ),
    servers = {
        @Server(url = "http://localhost:8104", description = "Development server")
    }
)
public class PaymentApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentApiApplication.class, args);
    }
}