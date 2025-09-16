package org.aquastream.notification.service.telegram.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
public class TelegramCallbackQuery {
    
    private String id;
    
    private TelegramUser from;
    
    private TelegramMessage message;
    
    private String data;

    /**
     * Parse callback query from raw Map data
     */
    @SuppressWarnings("unchecked")
    public static TelegramCallbackQuery fromMap(Map<String, Object> data) {
        if (data == null) {
            return null;
        }

        try {
            TelegramCallbackQuery.TelegramCallbackQueryBuilder builder = TelegramCallbackQuery.builder();
            
            if (data.containsKey("id")) {
                builder.id((String) data.get("id"));
            }
            
            if (data.containsKey("from")) {
                Map<String, Object> fromData = (Map<String, Object>) data.get("from");
                builder.from(TelegramUser.fromMap(fromData));
            }
            
            if (data.containsKey("message")) {
                Map<String, Object> messageData = (Map<String, Object>) data.get("message");
                builder.message(TelegramMessage.fromMap(messageData));
            }
            
            if (data.containsKey("data")) {
                builder.data((String) data.get("data"));
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return null;
        }
    }
}