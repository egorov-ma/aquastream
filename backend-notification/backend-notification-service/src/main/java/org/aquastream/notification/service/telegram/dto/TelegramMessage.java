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
public class TelegramMessage {
    
    @JsonProperty("message_id")
    private Long messageId;
    
    private TelegramUser from;
    
    private TelegramChat chat;
    
    private Long date;
    
    private String text;
    
    @JsonProperty("reply_to_message")
    private TelegramMessage replyToMessage;

    /**
     * Parse message from raw Map data
     */
    @SuppressWarnings("unchecked")
    public static TelegramMessage fromMap(Map<String, Object> data) {
        if (data == null) {
            return null;
        }

        try {
            TelegramMessage.TelegramMessageBuilder builder = TelegramMessage.builder();
            
            if (data.containsKey("message_id")) {
                builder.messageId(((Number) data.get("message_id")).longValue());
            }
            
            if (data.containsKey("from")) {
                Map<String, Object> fromData = (Map<String, Object>) data.get("from");
                builder.from(TelegramUser.fromMap(fromData));
            }
            
            if (data.containsKey("chat")) {
                Map<String, Object> chatData = (Map<String, Object>) data.get("chat");
                builder.chat(TelegramChat.fromMap(chatData));
            }
            
            if (data.containsKey("date")) {
                builder.date(((Number) data.get("date")).longValue());
            }
            
            if (data.containsKey("text")) {
                builder.text((String) data.get("text"));
            }
            
            if (data.containsKey("reply_to_message")) {
                Map<String, Object> replyData = (Map<String, Object>) data.get("reply_to_message");
                builder.replyToMessage(TelegramMessage.fromMap(replyData));
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return null;
        }
    }
}