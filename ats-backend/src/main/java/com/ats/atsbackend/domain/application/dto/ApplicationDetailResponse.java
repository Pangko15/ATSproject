package com.ats.atsbackend.domain.application.dto;

import com.ats.atsbackend.domain.application.ApplicationStatus;

import java.time.LocalDateTime;

public record ApplicationDetailResponse(
        Long applicationId,
        ApplicationStatus applicationStatus,
        LocalDateTime submittedAt,
        JobPosting jobPosting,
        Resume resume
) {
    public record JobPosting(Long id, String title, String status) {}

    public record Resume(
            Long id,
            Long candidateId,
            String title,
            String summary,
            ResumeFile resumeFile,
            ResumeFile portfolioFile
    ) {}

    public record ResumeFile(
            Long fileId,
            String role,
            String originalName,
            String fileKey,
            String mimeType,
            Long fileSize
    ) {}
}
