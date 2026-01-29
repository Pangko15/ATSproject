package com.ats.atsbackend.domain.application.dto;

public record ApplicationCreateRequest(
        Long jobPostingId,
        Long candidateId,
        Long resumeId
) {}
