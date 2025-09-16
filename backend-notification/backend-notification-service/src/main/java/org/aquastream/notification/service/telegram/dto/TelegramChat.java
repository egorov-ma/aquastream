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
public class TelegramChat {
    
    private Long id;
    
    private String type; // "private", "group", "supergroup", "channel"
    
    private String title;
    
    private String username;
    
    @JsonProperty("first_name")
    private String firstName;
    
    @JsonProperty("last_name")
    private String lastName;

    /**
     * Parse chat from raw Map data
     */
    public static TelegramChat fromMap(Map<String, Object> data) {
        if (data == null) {
            return null;
        }

        try {
            TelegramChat.TelegramChatBuilder builder = TelegramChat.builder();
            
            if (data.containsKey("id")) {
                builder.id(((Number) data.get("id")).longValue());
            }
            
            if (data.containsKey("type")) {
                builder.type((String) data.get("type"));
            }
            
            if (data.containsKey("title")) {
                builder.title((String) data.get("title"));
            }
            
            if (data.containsKey("username")) {
                builder.username((String) data.get("username"));
            }
            
            if (data.containsKey("first_name")) {
                builder.firstName((String) data.get("first_name"));
            }
            
            if (data.containsKey("last_name")) {
                builder.lastName((String) data.get("last_name"));
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Check if this is a private chat
     */
    public boolean isPrivate() {
        return "private".equals(type);
    }
    
    /**
     * Check if this is a group chat
     */
    public boolean isGroup() {
        return "group".equals(type) || "supergroup".equals(type);
    }
    
    /**
     * Get display name for chat
     */
    public String getDisplayName() {
        if (title != null && !title.trim().isEmpty()) {
            return title.trim();
        }
        
        if (isPrivate()) {
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
            
            if (name.length() > 0) {
                return name.toString();
            }
        }
        
        return "Chat " + id;
    }
}