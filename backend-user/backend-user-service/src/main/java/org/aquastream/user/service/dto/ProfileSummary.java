package org.aquastream.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileSummary {
    private String phone;
    private String telegram;
    private boolean telegramVerified;
}

