package org.aquastream.user.api.controller;

import lombok.RequiredArgsConstructor;
import org.aquastream.user.service.AdminUserService;
import org.aquastream.user.service.dto.PagedResponse;
import org.aquastream.user.service.dto.UserSummary;
import org.aquastream.user.api.dto.response.AdminUserListResponse;
import org.aquastream.user.api.dto.response.SimpleSuccessResponse;
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
    private final AdminUserService adminUserService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserListResponse> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "20") int size,
                                  @RequestParam(required = false) String q,
                                  @RequestParam(required = false) String role) {
        PagedResponse<UserSummary> res = adminUserService.listUsers(page, size, q, role);
        var items = res.getItems().stream().map(u -> AdminUserListResponse.Item.builder()
                .id(u.getId())
                .username(u.getUsername())
                .role(u.getRole())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .build()).toList();
        return ResponseEntity.ok(AdminUserListResponse.builder().total(res.getTotal()).items(items).build());
    }

    @PostMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SimpleSuccessResponse> setRole(@PathVariable UUID id, @RequestParam String role, Authentication auth) {
        if (role == null || role.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role is required");
        }
        String newRole = role.toUpperCase();
        if (!newRole.equals("ADMIN") && !newRole.equals("ORGANIZER") && !newRole.equals("USER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "unsupported role");
        }
        var adminsCountCheckRequired = !"ADMIN".equals(newRole);
        if (adminsCountCheckRequired) {
            long admins = adminUserService.countAdmins();
            if (admins <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cannot demote last admin");
            }
        }
        UUID actor = null;
        try { if (auth != null && auth.getName() != null) actor = UUID.fromString(auth.getName()); } catch (Exception ignored) {}
        adminUserService.changeRole(actor, id, newRole);
        return ResponseEntity.ok(SimpleSuccessResponse.builder().success(true).message("role updated").build());
    }
}
