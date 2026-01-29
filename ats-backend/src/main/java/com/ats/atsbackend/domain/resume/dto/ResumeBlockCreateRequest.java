package com.ats.atsbackend.domain.resume.dto;

import jakarta.validation.constraints.NotBlank;

public record ResumeBlockCreateRequest(
        @NotBlank String sectionKey,
        @NotBlank String title
) {}
