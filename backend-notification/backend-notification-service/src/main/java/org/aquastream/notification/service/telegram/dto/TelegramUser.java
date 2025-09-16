package org.aquastream.notification.service.telegram.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TelegramUser {
    
    private Long id;
    
    @JsonProperty("is_bot")
    private Boolean isBot;
    
    @JsonProperty("first_name")
    private String firstName;
    
    @JsonProperty("last_name")
    private String lastName;
    
    private String username;
    
    @JsonProperty("language_code")
    private String languageCode;

    /**
     * Parse user from raw Map data
     */
    public static TelegramUser fromMap(Map<String, Object> data) {
        if (data == null) {
            return null;
        }

        try {
            TelegramUser.TelegramUserBuilder builder = TelegramUser.builder();
            
            if (data.containsKey("id")) {
                builder.id(((Number) data.get("id")).longValue());
            }
            
            if (data.containsKey("is_bot")) {
                builder.isBot((Boolean) data.get("is_bot"));
            }
            
            if (data.containsKey("first_name")) {
                builder.firstName((String) data.get("first_name"));
            }
            
            if (data.containsKey("last_name")) {
                builder.lastName((String) data.get("last_name"));
            }
            
            if (data.containsKey("username")) {
                builder.username((String) data.get("username"));
            }
            
            if (data.containsKey("language_code")) {
                builder.languageCode((String) data.get("language_code"));
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Get display name for user
     */
    public String getDisplayName() {
        StringBuilder name = new StringBuilder();
        
        if (firstName != null && !firstName.trim().isEmpty()) {
            name.append(firstName.trim());
        }
        
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (name.length() > 0) {
                name.append(" ");
            }
            name.append(lastName.trim());
        }
        
        if (name.length() == 0 && username != null && !username.trim().isEmpty()) {
            name.append("@").append(username.trim());
        }
        
        if (name.length() == 0) {
            name.append("User ").append(id);
        }
        
        return name.toString();
    }
}