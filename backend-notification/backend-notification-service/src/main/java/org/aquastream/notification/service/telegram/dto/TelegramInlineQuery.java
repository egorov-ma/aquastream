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
public class TelegramInlineQuery {
    
    private String id;
    
    private TelegramUser from;
    
    private String query;
    
    private String offset;

    /**
     * Parse inline query from raw Map data
     */
    @SuppressWarnings("unchecked")
    public static TelegramInlineQuery fromMap(Map<String, Object> data) {
        if (data == null) {
            return null;
        }

        try {
            TelegramInlineQuery.TelegramInlineQueryBuilder builder = TelegramInlineQuery.builder();
            
            if (data.containsKey("id")) {
                builder.id((String) data.get("id"));
            }
            
            if (data.containsKey("from")) {
                Map<String, Object> fromData = (Map<String, Object>) data.get("from");
                builder.from(TelegramUser.fromMap(fromData));
            }
            
            if (data.containsKey("query")) {
                builder.query((String) data.get("query"));
            }
            
            if (data.containsKey("offset")) {
                builder.offset((String) data.get("offset"));
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return null;
        }
    }
}