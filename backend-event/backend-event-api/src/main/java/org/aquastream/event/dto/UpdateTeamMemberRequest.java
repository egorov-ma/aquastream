package org.aquastream.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTeamMemberRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    @NotBlank(message = "Role is required")
    @Size(max = 255, message = "Role must not exceed 255 characters")
    private String role;
    
    @Size(max = 512, message = "Photo URL must not exceed 512 characters")
    private String photoUrl;
    
    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
    
    private Integer sortOrder;
}