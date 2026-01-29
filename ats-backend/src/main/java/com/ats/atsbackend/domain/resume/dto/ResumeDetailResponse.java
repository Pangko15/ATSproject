package com.ats.atsbackend.domain.resume.dto;

public record ResumeDetailResponse(
        Long resumeId,
        Long candidateId,
        String title,
        String summary,
        String email,
        String phone,
        ResumeFileItemResponse resumeFile,      // 필수
        ResumeFileItemResponse portfolioFile    // 선택(null 가능)
) {}
