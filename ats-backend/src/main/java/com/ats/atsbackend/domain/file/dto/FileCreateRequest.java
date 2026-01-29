package com.ats.atsbackend.domain.file.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FileCreateRequest(
        @NotBlank String originalName,
        @NotBlank String fileKey,
        String mimeType,
        Long fileSize,
        Long uploadedByCandidateId,
        Long uploadedByAdminUserId
) {}
