package com.ats.atsbackend;

import com.ats.atsbackend.global.config.FileStorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties(FileStorageProperties.class)
@SpringBootApplication
public class AtsBackendApplication {

    public static void main(String[] args) {

        SpringApplication.run(AtsBackendApplication.class, args);
    }

}
