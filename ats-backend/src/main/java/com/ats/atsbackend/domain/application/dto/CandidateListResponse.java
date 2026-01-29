package com.ats.atsbackend.domain.application.dto;

import com.ats.atsbackend.domain.application.ApplicationStatus;

import java.time.LocalDateTime;

public record CandidateListResponse(
        Long applicationId,
        Long jobPostingId,
        String jobTitle,
        ApplicationStatus status,
        LocalDateTime submittedAt
) {}
