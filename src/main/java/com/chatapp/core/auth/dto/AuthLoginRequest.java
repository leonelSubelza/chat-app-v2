package com.chatapp.core.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequest(
        @NotBlank
        String username,
        @NotBlank
        String password
) {
}
