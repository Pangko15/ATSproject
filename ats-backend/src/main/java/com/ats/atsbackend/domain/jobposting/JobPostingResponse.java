package com.ats.atsbackend.domain.jobposting;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JobPostingResponse {
    private Long id;
    private String title;
    private String description;
    private String status;

    public static JobPostingResponse from(JobPostingEntity e) {
        return new JobPostingResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getStatus()
        );
    }
}