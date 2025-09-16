package org.aquastream.crew;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
    "org.aquastream.crew",
    "org.aquastream.common"
})
@EntityScan(basePackages = "org.aquastream.crew.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.crew.db.repository")
public class CrewServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CrewServiceApplication.class, args);
    }
}