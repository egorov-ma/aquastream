package org.aquastream.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.liquibase.enabled=false",
        "springdoc.api-docs.enabled=false",
        "springdoc.swagger-ui.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration"
})
@AutoConfigureMockMvc
class AuthControllerStaticTokensTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void staticTokensEndpointReturnsOk() throws Exception {
        mockMvc.perform(get("/api/auth/static-tokens"))
                .andExpect(status().isOk());
    }
}