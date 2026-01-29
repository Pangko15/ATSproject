package com.ats.atsbackend.domain.application;


import com.ats.atsbackend.domain.application.dto.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationCommandService commandService;
    private final ApplicationQueryService queryService;


    public ApplicationController(ApplicationCommandService commandService,
                                 ApplicationQueryService queryService) {
        this.commandService = commandService;
        this.queryService = queryService;
    }

    // ✅ 지원서 제출
    @PostMapping
    public ResponseEntity<ApplicationCreateResponse> submit(@RequestBody ApplicationCreateRequest req) {
        Long applicationId = commandService.submit(req.jobPostingId(), req.candidateId(), req.resumeId());
        return ResponseEntity.ok(new ApplicationCreateResponse(applicationId));
    }

    // ✅ 지원서 상세 조회 (React에서 GET /api/applications/{id} 필요)
    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationDetailResponse> detail(@PathVariable Long applicationId) {
        return ResponseEntity.ok(queryService.detail(applicationId));
    }

    // ✅ 지원서 상태 변경
    @PatchMapping("/{applicationId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long applicationId,
            @RequestBody UpdateStatusRequest req
    ) {
        commandService.updateStatus(applicationId, req.status());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{applicationId}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long applicationId) {
        commandService.cancel(applicationId);
        return ResponseEntity.ok().build();
    }

    public record UpdateStatusRequest(ApplicationStatus status) {}

    @GetMapping("/candidates/{candidateId}")
    public List<CandidateListResponse> myApplications(@PathVariable Long candidateId) {
        return queryService.myApplications(candidateId);
    }

    @GetMapping
    public List<AdminListResponse> adminList() {
        return queryService.adminList();
    }
}
