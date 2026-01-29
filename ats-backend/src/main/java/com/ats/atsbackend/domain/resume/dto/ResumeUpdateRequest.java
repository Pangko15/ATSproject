package com.ats.atsbackend.domain.resume.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResumeUpdateRequest(
        @NotBlank String title,
        String summary,
        @NotBlank @Email String email,
        @NotBlank String phone
) {}
