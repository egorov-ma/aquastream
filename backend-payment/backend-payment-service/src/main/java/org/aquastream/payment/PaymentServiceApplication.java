package org.aquastream.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
    "org.aquastream.payment",
    "org.aquastream.common"
})
@EntityScan(basePackages = "org.aquastream.payment.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.payment.db.repository")
public class PaymentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
}