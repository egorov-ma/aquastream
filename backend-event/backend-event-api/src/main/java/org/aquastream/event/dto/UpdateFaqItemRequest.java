package org.aquastream.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateFaqItemRequest {
    
    @NotBlank(message = "Question is required")
    @Size(max = 500, message = "Question must not exceed 500 characters")
    private String question;
    
    @NotBlank(message = "Answer is required")
    @Size(max = 2000, message = "Answer must not exceed 2000 characters")
    private String answer;
    
    private Integer sortOrder;
}