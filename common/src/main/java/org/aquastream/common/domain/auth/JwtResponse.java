package org.aquastream.common.domain.auth;

import java.util.List;
import java.util.UUID;

/**
 * DTO для ответа с JWT токеном
 */
public class JwtResponse {
    private String token;
    private String type;
    private UUID id;
    private String username;
    private String name;
    private List<String> roles;

    public JwtResponse(String token, String type, UUID id, String username, String name, List<String> roles) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.username = username;
        this.name = name;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
} 