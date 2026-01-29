package com.ats.atsbackend.domain.resume.dto;

import java.util.List;

public record ResumeBlockWithValuesResponse(
        Long blockId,
        String sectionKey,
        String title,
        Integer sortOrder,
        List<ResumeBlockValueItemResponse> values
) {}