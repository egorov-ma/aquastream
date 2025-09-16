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
public class TelegramUpdate {
    
    @JsonProperty("update_id")
    private Long updateId;
    
    private TelegramMessage message;
    
    @JsonProperty("edited_message")
    private TelegramMessage editedMessage;
    
    @JsonProperty("callback_query")
    private TelegramCallbackQuery callbackQuery;
    
    @JsonProperty("inline_query")
    private TelegramInlineQuery inlineQuery;

    /**
     * Parse Telegram update from raw Map data
     */
    @SuppressWarnings("unchecked")
    public static TelegramUpdate fromMap(Map<String, Object> data) {
        if (data == null) {
            return null;
        }

        try {
            TelegramUpdate.TelegramUpdateBuilder builder = TelegramUpdate.builder();
            
            // Update ID
            if (data.containsKey("update_id")) {
                builder.updateId(((Number) data.get("update_id")).longValue());
            }
            
            // Message
            if (data.containsKey("message")) {
                Map<String, Object> messageData = (Map<String, Object>) data.get("message");
                builder.message(TelegramMessage.fromMap(messageData));
            }
            
            // Edited message
            if (data.containsKey("edited_message")) {
                Map<String, Object> messageData = (Map<String, Object>) data.get("edited_message");
                builder.editedMessage(TelegramMessage.fromMap(messageData));
            }
            
            // Callback query
            if (data.containsKey("callback_query")) {
                Map<String, Object> callbackData = (Map<String, Object>) data.get("callback_query");
                builder.callbackQuery(TelegramCallbackQuery.fromMap(callbackData));
            }
            
            // Inline query
            if (data.containsKey("inline_query")) {
                Map<String, Object> inlineData = (Map<String, Object>) data.get("inline_query");
                builder.inlineQuery(TelegramInlineQuery.fromMap(inlineData));
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return null;
        }
    }
}