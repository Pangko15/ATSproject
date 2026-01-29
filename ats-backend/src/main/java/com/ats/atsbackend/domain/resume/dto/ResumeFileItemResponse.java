package com.ats.atsbackend.domain.resume.dto;

public record ResumeFileItemResponse(
        Long fileId,
        String role,          // RESUME / PORTFOLIO
        String originalName,
        String fileKey,
        String mimeType,
        Long fileSize
) {}
