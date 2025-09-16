package org.aquastream.user.api.dto.response;

/**
 * Response DTO for revoke all sessions endpoint.
 */
public record RevokeAllResponse(
        int revokedCount,
        String message
) {
    public static RevokeAllResponse success(int count) {
        return new RevokeAllResponse(count, "All sessions revoked successfully");
    }
}