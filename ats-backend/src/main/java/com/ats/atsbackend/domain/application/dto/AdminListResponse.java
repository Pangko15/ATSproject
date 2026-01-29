package com.ats.atsbackend.domain.application.dto;

import com.ats.atsbackend.domain.application.ApplicationStatus;
import java.time.LocalDateTime;

public record AdminListResponse(
        Long applicationId,
        Long jobPostingId,
        String jobTitle,
        Long candidateId,
        Long resumeId,
        ApplicationStatus status,
        LocalDateTime submittedAt
) {}