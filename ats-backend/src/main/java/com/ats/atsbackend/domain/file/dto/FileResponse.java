package com.ats.atsbackend.domain.file.dto;

import java.time.LocalDateTime;

public record FileResponse(
        Long fileId,
        String originalName,
        String fileKey,
        String mimeType,
        Long fileSize,
        Integer deletedYn,
        LocalDateTime uploadedAt
) {}
