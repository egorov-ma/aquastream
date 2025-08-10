package org.aquastream.user.db.entity;

import lombok.Data;

import java.io.Serializable;
import java.util.UUID;

@Data
public class RecoveryCodeId implements Serializable {
    private UUID userId;
    private String codeHash;

    public RecoveryCodeId() {}

    public RecoveryCodeId(UUID userId, String codeHash) {
        this.userId = userId;
        this.codeHash = codeHash;
    }
}


