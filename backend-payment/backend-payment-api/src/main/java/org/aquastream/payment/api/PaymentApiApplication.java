package org.aquastream.payment.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "org.aquastream.payment")
@EntityScan("org.aquastream.payment.db.entity")
@EnableJpaRepositories("org.aquastream.payment.db.repository")
@EnableConfigurationProperties
public class PaymentApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentApiApplication.class, args);
    }
}