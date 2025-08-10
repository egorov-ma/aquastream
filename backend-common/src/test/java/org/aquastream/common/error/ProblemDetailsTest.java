package org.aquastream.common.error;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ProblemDetailsTest {
    @Test
    void serializeProblemDetails() throws JsonProcessingException {
        ProblemDetails pd = new ProblemDetails();
        pd.setType(URI.create("https://aquastream.app/problems/validation-failed"));
        pd.setTitle("Validation Failed");
        pd.setStatus(400);
        pd.setDetail("Profile must be completed");
        pd.setInstance("/api/v1/bookings");
        pd.setCorrelationId("req-123");
        pd.setErrors(List.of(new ProblemDetails.FieldError("profile.phone", "required", "required")));

        ObjectMapper om = new ObjectMapper().registerModule(new JavaTimeModule());
        String json = om.writeValueAsString(pd);
        assertTrue(json.contains("Validation Failed"));
        assertTrue(json.contains("problems/validation-failed"));
        assertTrue(json.contains("req-123"));
        assertTrue(json.contains("profile.phone"));
    }
}


