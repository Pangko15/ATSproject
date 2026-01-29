package com.ats.atsbackend.domain.resume;

import com.ats.atsbackend.domain.resume.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // 이력서 생성 (RESUME 파일 필수)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeCreateResponse create(@Valid @RequestBody ResumeCreateRequest req) {
        Long resumeId = resumeService.create(req);
        return new ResumeCreateResponse(resumeId);
    }

    // 포트폴리오 추가 (선택)
    @PostMapping("/{resumeId}/portfolio")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addPortfolio(@PathVariable Long resumeId, @Valid @RequestBody PortfolioAddRequest req) {
        resumeService.addPortfolio(resumeId, req.portfolioFileId());
    }

    // 상세 조회 (Step 11에서 만든 getDetail 재사용)
    @GetMapping("/{resumeId}")
    public ResumeDetailResponse detail(@PathVariable Long resumeId) {

        return resumeService.getDetail(resumeId);
    }

    @GetMapping("/candidates/{candidateId}")
    public List<ResumeListItemResponse> listByCandidate(@PathVariable Long candidateId) {
        return resumeService.listByCandidate(candidateId);
    }

    @PatchMapping("/{resumeId}")
    public void update(
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeUpdateRequest req
    ) {
        resumeService.update(
                resumeId,
                req.title(),
                req.summary(),
                req.email(),
                req.phone()
        );
    }
    @DeleteMapping("/{resumeId}")
    public void delete(@PathVariable Long resumeId) {

        resumeService.delete(resumeId);
    }

    @PutMapping("/{resumeId}/resume-file")
    public ResponseEntity<Void> replaceResumeFile(
            @PathVariable Long resumeId,
            @RequestBody ReplaceResumeFileRequest req
    ) {
        resumeService.replaceResumeFile(resumeId, req.resumeFileId());
        return ResponseEntity.ok().build();
    }

    public record ReplaceResumeFileRequest(Long resumeFileId) {}

    @PostMapping("/{resumeId}/blocks")
    public ResumeBlockCreateResponse addBlock(
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeBlockCreateRequest req
    ) {
        return resumeService.addBlock(resumeId, req);
    }

    @PutMapping("/{resumeId}/blocks/{blockId}/values")
    public void upsertBlockValues(
            @PathVariable Long resumeId,
            @PathVariable Long blockId,
            @Valid @RequestBody com.ats.atsbackend.domain.resume.dto.ResumeBlockValuesUpsertRequest req
    ) {
        resumeService.upsertBlockValues(resumeId, blockId, req.values());
    }

    @DeleteMapping("/{resumeId}/blocks/{blockId}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteBlock(
            @PathVariable Long resumeId,
            @PathVariable Long blockId
    ) {
        resumeService.deleteBlock(resumeId, blockId);
    }

    @GetMapping("/{resumeId}/blocks")
    public java.util.List<com.ats.atsbackend.domain.resume.dto.ResumeBlockWithValuesResponse>
    getBlocks(@PathVariable Long resumeId) {
        return resumeService.getBlocksWithValues(resumeId);
    }

}
