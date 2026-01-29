package com.ats.atsbackend.domain.resume.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResumeCreateRequest(
        @NotNull Long candidateId,
        @NotBlank String title,
        String summary,
        @NotNull Long resumeFileId,
        @NotBlank @Email String email,
        @NotBlank String phone// RESUME 파일은 필수
) {}
