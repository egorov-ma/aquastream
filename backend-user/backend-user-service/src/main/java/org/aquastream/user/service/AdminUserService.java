package org.aquastream.user.service;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.AuditLogEntity;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repository.AuditLogRepository;
import org.aquastream.user.db.repository.UserRepository;
import org.aquastream.user.service.dto.PagedResponse;
import org.aquastream.user.service.dto.UserSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository users;
    private final AuditLogRepository auditLogs;

    public PagedResponse<UserSummary> listUsers(int page, int size, String q, String role) {
        Page<UserEntity> res;
        if (role != null && q != null && !q.isBlank()) {
            res = users.findByRoleAndUsernameContainingIgnoreCase(role, q, PageRequest.of(page, size));
        } else if (role != null) {
            res = users.findByRole(role, PageRequest.of(page, size));
        } else if (q != null && !q.isBlank()) {
            res = users.findByUsernameContainingIgnoreCase(q, PageRequest.of(page, size));
        } else {
            res = users.findAll(PageRequest.of(page, size));
        }
        List<UserSummary> items = res.getContent().stream().map(u -> UserSummary.builder()
                .id(u.getId())
                .username(u.getUsername())
                .role(u.getRole())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .build()).toList();
        return PagedResponse.<UserSummary>builder()
                .items(items)
                .total(res.getTotalElements())
                .page(page)
                .size(size)
                .build();
    }

    public void changeRole(UUID actorUserId, UUID userId, String newRole) {
        UserEntity user = users.findById(userId).orElseThrow();
        user.setRole(newRole);
        users.save(user);
        auditLogs.save(AuditLogEntity.builder()
                .id(UUID.randomUUID())
                .actorUserId(actorUserId)
                .action("role.change")
                .targetType("user")
                .targetId(userId)
                .payload("{\"role\":\"" + newRole + "\"}")
                .createdAt(Instant.now())
                .build());
    }

    public long countAdmins() {
        return users.countByRole("ADMIN");
    }
}

