package com.ats.atsbackend.domain.resume;

import com.ats.atsbackend.domain.application.ApplicationRepository;
import com.ats.atsbackend.domain.file.FileEntity;
import com.ats.atsbackend.domain.file.FileRepository;
import com.ats.atsbackend.domain.resume.dto.ResumeCreateRequest;
import com.ats.atsbackend.domain.resume.dto.ResumeDetailResponse;
import com.ats.atsbackend.domain.resume.dto.ResumeFileItemResponse;
import com.ats.atsbackend.domain.resume.dto.ResumeListItemResponse;
import com.ats.atsbackend.domain.resume.dto.ResumeBlockCreateRequest;
import com.ats.atsbackend.domain.resume.dto.ResumeBlockCreateResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeFileRepository resumeFileRepository;
    private final FileRepository fileRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeBlockRepository resumeBlockRepository;
    private final ResumeBlockValueRepository resumeBlockValueRepository;

    public ResumeService(ResumeRepository resumeRepository,
                         ResumeFileRepository resumeFileRepository,
                         FileRepository fileRepository,
                         ApplicationRepository applicationRepository,
                         ResumeBlockRepository resumeBlockRepository,
                         ResumeBlockValueRepository resumeBlockValueRepository) {
        this.resumeRepository = resumeRepository;
        this.resumeFileRepository = resumeFileRepository;
        this.fileRepository = fileRepository;
        this.applicationRepository = applicationRepository;
        this.resumeBlockRepository = resumeBlockRepository;
        this.resumeBlockValueRepository = resumeBlockValueRepository;
    }

    /** 1) 이력서 생성 (RESUME 파일 필수) */
    public Long createResumeWithRequiredResumeFile(
            Long candidateId,
            String title,
            String summary,
            String email,
            String phone,
            Long resumeFileId
    ) {
        ResumeEntity resume = resumeRepository.save(
                new ResumeEntity(candidateId, title, summary, email, phone)
        );

        FileEntity file = fileRepository.findById(resumeFileId)
                .orElseThrow(() -> new IllegalArgumentException("FILE not found. id=" + resumeFileId));

        resumeFileRepository.findByResume_IdAndFileRole(resume.getId(), FileRole.RESUME)
                .ifPresent(x -> { throw new IllegalStateException("RESUME file already exists"); });

        long cnt = resumeFileRepository.countByResume_Id(resume.getId());
        if (cnt >= 2) throw new IllegalStateException("Resume files limit exceeded (max 2)");

        validateResumeFilePolicy(file.getOriginalName(), file.getMimeType());

        resumeFileRepository.save(new ResumeFileEntity(resume, file, FileRole.RESUME));
        return resume.getId();
    }


    /** 2) 포트폴리오 파일 추가 (선택) */
    public void addPortfolioFile(Long resumeId, Long portfolioFileId) {
        ResumeEntity resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("RESUME not found. id=" + resumeId));

        FileEntity file = fileRepository.findById(portfolioFileId)
                .orElseThrow(() -> new IllegalArgumentException("FILE not found. id=" + portfolioFileId));

        // (1) PORTFOLIO 1개 제한
        resumeFileRepository.findByResume_IdAndFileRole(resumeId, FileRole.PORTFOLIO)
                .ifPresent(x -> { throw new IllegalStateException("PORTFOLIO file already exists"); });

        // (2) 총 2개 제한 (RESUME + PORTFOLIO)
        long cnt = resumeFileRepository.countByResume_Id(resumeId);
        if (cnt >= 2) throw new IllegalStateException("Resume files limit exceeded (max 2)");

        validatePortfolioFilePolicy(file.getOriginalName(), file.getMimeType());

        // save
        resumeFileRepository.save(new ResumeFileEntity(resume, file, FileRole.PORTFOLIO));
    }

    /** 3) 간단 조회용 */
    @Transactional(readOnly = true)
    public long countFiles(Long resumeId) {
        return resumeFileRepository.countByResume_Id(resumeId);
    }

    @Transactional
    public void update(
            Long resumeId,
            String title,
            String summary,
            String email,
            String phone
    ) {
        ResumeEntity resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("resume not found: " + resumeId));

        resume.update(title, summary, email, phone);
    }

    @Transactional
    public void delete(Long resumeId) {
        // 1) 지원서가 이 resume를 참조 중이면 먼저 삭제
        applicationRepository.deleteByResumeId(resumeId);

        // ✅ 2) 블록 값/블록 삭제 (FK_RESUME_BLOCK_VALUE -> FK_RB_RESUME 때문에 필수)
        var blocks = resumeBlockRepository.findAllByResume_Id(resumeId);
        java.util.List<Long> blockIds = blocks.stream().map(ResumeBlockEntity::getId).toList();

        if (!blockIds.isEmpty()) {
            resumeBlockValueRepository.deleteByBlock_IdIn(blockIds); // values 먼저
            resumeBlockRepository.deleteByResume_Id(resumeId);       // blocks 삭제
        }

        // 3) 연결 테이블 삭제 (RESUME_FILE)
        resumeFileRepository.deleteByResume_Id(resumeId);

        // 4) 이력서 삭제
        resumeRepository.deleteById(resumeId);
    }

    @Transactional(readOnly = true)
    public ResumeDetailResponse getDetail(Long resumeId) {
        ResumeEntity resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("RESUME not found. id=" + resumeId));

        List<ResumeFileEntity> links = resumeFileRepository.findAllByResume_Id(resumeId);

        ResumeFileItemResponse resumeFile = null;
        ResumeFileItemResponse portfolioFile = null;

        for (ResumeFileEntity link : links) {
            var f = link.getFile();
            ResumeFileItemResponse item = new ResumeFileItemResponse(
                    f.getId(),
                    link.getFileRole().name(),
                    f.getOriginalName(),
                    f.getFileKey(),
                    f.getMimeType(),
                    f.getFileSize()
            );

            if (link.getFileRole() == FileRole.RESUME) resumeFile = item;
            if (link.getFileRole() == FileRole.PORTFOLIO) portfolioFile = item;
        }

        if (resumeFile == null) {
            throw new IllegalStateException("RESUME file is required but missing. resumeId=" + resumeId);
        }

        return new ResumeDetailResponse(
                resume.getId(),
                resume.getCandidateId(),
                resume.getTitle(),
                resume.getSummary(),
                resume.getEmail(),
                resume.getPhone(),
                resumeFile,
                portfolioFile
        );
    }

    public Long create(ResumeCreateRequest req) {
        return createResumeWithRequiredResumeFile(
                req.candidateId(),
                req.title(),
                req.summary(),
                req.email(),
                req.phone(),
                req.resumeFileId()
        );
    }

    public List<ResumeListItemResponse> listByCandidate(Long candidateId) {
        return resumeRepository.findListByCandidateId(candidateId);
    }

    public void addPortfolio(Long resumeId, Long portfolioFileId) {
        addPortfolioFile(resumeId, portfolioFileId);
    }

    private void validateResumeFilePolicy(String originalName, String mimeType) {
        String ext = getExtensionLower(originalName);

        // RESUME: pdf/doc/docx만 허용
        if (!(ext.equals("pdf") || ext.equals("doc") || ext.equals("docx"))) {
            throw new IllegalStateException("RESUME 파일은 pdf/doc/docx만 업로드 가능합니다. (현재: " + ext + ")");
        }

        // mimeType도 참고(있을 때만)
        if (mimeType != null && !mimeType.isBlank()) {
            // ext 기준으로만 처리
        }
    }

    private void validatePortfolioFilePolicy(String originalName, String mimeType) {
        String ext = getExtensionLower(originalName);

        // PORTFOLIO: pdf/ppt/pptx/zip 허용
        if (!(ext.equals("pdf") || ext.equals("ppt") || ext.equals("pptx") || ext.equals("zip"))) {
            throw new IllegalStateException("PORTFOLIO 파일은 pdf/ppt/pptx/zip만 허용합니다. (현재: " + ext + ")");
        }
    }

    private String getExtensionLower(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length() - 1) return "";
        return filename.substring(idx + 1).toLowerCase();
    }

    @Transactional
    public void replaceResumeFile(Long resumeId, Long newResumeFileId) {

        ResumeEntity resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("RESUME not found. id=" + resumeId));

        FileEntity newFile = fileRepository.findById(newResumeFileId)
                .orElseThrow(() -> new IllegalArgumentException("FILE not found. id=" + newResumeFileId));

        // 확장자 정책 체크 (pdf/doc/docx)
        validateResumeFilePolicy(newFile.getOriginalName(), newFile.getMimeType());

        // ✅ 핵심: 기존 RESUME 링크가 있으면 UPDATE로 교체 (유니크 충돌 없음)
        ResumeFileEntity link = resumeFileRepository
                .findByResume_IdAndFileRole(resumeId, FileRole.RESUME)
                .orElseThrow(() -> new IllegalStateException("RESUME link missing. resumeId=" + resumeId));

        link.changeFile(newFile); // 아래에 엔티티 메서드 추가
    }

    @Transactional
    public ResumeBlockCreateResponse addBlock(Long resumeId, ResumeBlockCreateRequest req) {
        ResumeEntity resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("RESUME not found. id=" + resumeId));

        int nextOrder = resumeBlockRepository.countByResume_Id(resumeId) + 1;

        ResumeBlockEntity saved = resumeBlockRepository.save(
                new ResumeBlockEntity(resume, req.sectionKey().trim(), req.title().trim(), nextOrder)
        );

        return new ResumeBlockCreateResponse(saved.getId(), saved.getSortOrder());
    }

    @Transactional
    public void upsertBlockValues(Long resumeId, Long blockId, java.util.Map<String, String> values) {

        ResumeBlockEntity block = resumeBlockRepository.findById(blockId)
                .orElseThrow(() -> new IllegalArgumentException("BLOCK not found. id=" + blockId));

        // ✅ 블록이 이 resume 소속인지 확인
        if (!block.getResume().getId().equals(resumeId)) {
            throw new IllegalStateException("BLOCK does not belong to resume. resumeId=" + resumeId + ", blockId=" + blockId);
        }

        for (var entry : values.entrySet()) {
            String fieldKey = entry.getKey();
            String valueText = entry.getValue();

            // ✅ 정책: 빈 값이면 삭제(원하면 유지)
            if (valueText == null || valueText.trim().isEmpty()) {
                resumeBlockValueRepository.deleteByBlock_IdAndFieldKey(blockId, fieldKey);
                continue;
            }

            ResumeBlockValueEntity row = resumeBlockValueRepository
                    .findByBlock_IdAndFieldKey(blockId, fieldKey)
                    .orElseGet(() -> new ResumeBlockValueEntity(block, fieldKey, null));

            row.changeValueText(valueText.trim());
            resumeBlockValueRepository.save(row);
        }
    }

    @Transactional
    public void deleteBlock(Long resumeId, Long blockId) {

        ResumeBlockEntity block = resumeBlockRepository.findById(blockId)
                .orElseThrow(() -> new IllegalArgumentException("BLOCK not found. id=" + blockId));

        // ✅ 소속 검증
        if (!block.getResume().getId().equals(resumeId)) {
            throw new IllegalStateException("BLOCK does not belong to resume. resumeId=" + resumeId + ", blockId=" + blockId);
        }

        // 1) block value 먼저 삭제 (FK 때문에)
        resumeBlockValueRepository.deleteByBlock_Id(blockId);

        // 2) block 삭제
        resumeBlockRepository.deleteById(blockId);
    }

    @Transactional(readOnly = true)
    public java.util.List<com.ats.atsbackend.domain.resume.dto.ResumeBlockWithValuesResponse>
    getBlocksWithValues(Long resumeId) {

        // resume 존재 검증(선택이지만 추천)
        resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("RESUME not found. id=" + resumeId));

        var blocks = resumeBlockRepository.findAllByResume_IdOrderBySortOrderAsc(resumeId);
        if (blocks.isEmpty()) return java.util.List.of();

        java.util.List<Long> blockIds = blocks.stream().map(ResumeBlockEntity::getId).toList();

        var values = resumeBlockValueRepository.findAllByBlock_IdIn(blockIds);

        // blockId -> values 묶기
        java.util.Map<Long, java.util.List<com.ats.atsbackend.domain.resume.dto.ResumeBlockValueItemResponse>> grouped =
                new java.util.HashMap<>();

        for (var v : values) {
            grouped.computeIfAbsent(v.getBlock().getId(), k -> new java.util.ArrayList<>())
                    .add(new com.ats.atsbackend.domain.resume.dto.ResumeBlockValueItemResponse(
                            v.getFieldKey(),
                            v.getValueText()
                    ));
        }

        java.util.List<com.ats.atsbackend.domain.resume.dto.ResumeBlockWithValuesResponse> out = new java.util.ArrayList<>();
        for (var b : blocks) {
            out.add(new com.ats.atsbackend.domain.resume.dto.ResumeBlockWithValuesResponse(
                    b.getId(),
                    b.getSectionKey(),
                    b.getTitle(),
                    b.getSortOrder(),
                    grouped.getOrDefault(b.getId(), java.util.List.of())
            ));
        }
        return out;
    }

}
