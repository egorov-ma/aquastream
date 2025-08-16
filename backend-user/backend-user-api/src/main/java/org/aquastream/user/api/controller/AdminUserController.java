package org.aquastream.user.api.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.db.entity.AuditLogEntity;
import org.aquastream.user.db.entity.UserEntity;
import org.aquastream.user.db.repo.AuditLogRepository;
import org.aquastream.user.db.repo.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@Validated
@RequiredArgsConstructor
public class AdminUserController {
    private final UserRepository users;
    private final AuditLogRepository auditLogs;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "20") int size,
                                  @RequestParam(required = false) String q,
                                  @RequestParam(required = false) String role) {
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
        var items = res.getContent().stream().map(u -> Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "role", u.getRole(),
                "active", u.isActive(),
                "createdAt", u.getCreatedAt()
        )).toList();
        return ResponseEntity.ok(Map.of("total", res.getTotalElements(), "items", items));
    }

    @PostMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setRole(@PathVariable UUID id, @RequestParam String role, Authentication auth) {
        if (role == null || role.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role is required");
        }
        String newRole = role.toUpperCase();
        if (!newRole.equals("ADMIN") && !newRole.equals("ORGANIZER") && !newRole.equals("USER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported role");
        }
        UserEntity user = users.findById(id).orElseThrow();
        if (user.getRole().equals("ADMIN") && !newRole.equals("ADMIN")) {
            long admins = users.countByRole("ADMIN");
            if (admins <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cannot demote last admin");
            }
        }
        user.setRole(newRole);
        users.save(user);
        UUID actor = null;
        try { if (auth != null && auth.getName() != null) actor = UUID.fromString(auth.getName()); } catch (Exception ignored) {}
        auditLogs.save(AuditLogEntity.builder()
                .id(UUID.randomUUID())
                .actorUserId(actor)
                .action("role.change")
                .targetType("user")
                .targetId(id)
                .payload("{\"role\":\"" + newRole + "\"}")
                .createdAt(Instant.now())
                .build());
        return ResponseEntity.ok(Map.of("success", true));
    }
}


