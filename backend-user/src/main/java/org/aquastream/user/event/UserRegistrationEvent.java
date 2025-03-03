package org.aquastream.user.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRegistrationEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private UUID userId;
    private String username;
    private String name;
    private String telegramUser;
} 