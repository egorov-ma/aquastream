package org.aquastream.user.api.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 20, message = "Phone number must not exceed 20 characters")
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
        String phone,
        
        @Size(max = 32, message = "Telegram username must not exceed 32 characters")
        @Pattern(regexp = "^[a-zA-Z0-9_]{5,32}$", message = "Invalid telegram username format")
        String telegram
) {}