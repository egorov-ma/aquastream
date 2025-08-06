package org.aquastream.crew;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CrewServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CrewServiceApplication.class, args);
    }
}