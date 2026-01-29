package com.ats.atsbackend.domain.jobposting;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/job-postings")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingRepository jobPostingRepository;

    // ✅ 공고 목록 (지원자용)
    @GetMapping
    public Page<JobPostingResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return jobPostingRepository
                .findAll(PageRequest.of(page, size))
                .map(JobPostingResponse::from);
    }

    // ✅ 공고 상세 (지원자용)
    @GetMapping("/{id}")
    public JobPostingResponse detail(@PathVariable Long id) {
        JobPostingEntity e = jobPostingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("JobPosting not found: " + id));
        return JobPostingResponse.from(e);
    }
}