package org.aquastream.media;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
    "org.aquastream.media",
    "org.aquastream.common"
})
@EntityScan(basePackages = "org.aquastream.media.db.entity")
@EnableJpaRepositories(basePackages = "org.aquastream.media.db.repository")
public class MediaServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MediaServiceApplication.class, args);
    }
}