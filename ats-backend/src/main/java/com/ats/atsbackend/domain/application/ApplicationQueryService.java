package com.ats.atsbackend.domain.application;

import com.ats.atsbackend.domain.application.dto.ApplicationDetailResponse;
import com.ats.atsbackend.domain.application.dto.AdminListResponse;
import com.ats.atsbackend.domain.jobposting.JobPostingEntity;
import com.ats.atsbackend.domain.resume.ResumeService;
import com.ats.atsbackend.domain.resume.dto.ResumeDetailResponse;
import com.ats.atsbackend.domain.resume.dto.ResumeFileItemResponse;
import com.ats.atsbackend.domain.application.dto.CandidateListResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ApplicationQueryService {

    private final ApplicationRepository applicationRepository;
    private final ResumeService resumeService;
    private ApplicationDetailResponse.ResumeFile toResumeFile(ResumeFileItemResponse r) {
        if (r == null) return null;
        return new ApplicationDetailResponse.ResumeFile(
                r.fileId(),
                r.role(),
                r.originalName(),
                r.fileKey(),
                r.mimeType(),
                r.fileSize()
        );
    }

    public ApplicationQueryService(ApplicationRepository applicationRepository,
                                   ResumeService resumeService) {
        this.applicationRepository = applicationRepository;
        this.resumeService = resumeService;
    }

    public ApplicationDetailResponse detail(Long applicationId) {
        ApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("APPLICATION not found id=" + applicationId));

        JobPostingEntity posting = app.getJobPosting();

        // ✅ 여기서 Resume + 파일까지 포함된 상세를 가져옴
        ResumeDetailResponse resumeDetail = resumeService.getDetail(app.getResumeId());

        return new ApplicationDetailResponse(
                app.getId(),
                app.getStatus(),
                app.getSubmittedAt(),
                new ApplicationDetailResponse.JobPosting(
                        posting.getId(),
                        posting.getTitle(),
                        posting.getStatus()
                ),
                new ApplicationDetailResponse.Resume(
                        resumeDetail.resumeId(),
                        resumeDetail.candidateId(),
                        resumeDetail.title(),
                        resumeDetail.summary(),
                        toResumeFile(resumeDetail.resumeFile()),
                        toResumeFile(resumeDetail.portfolioFile())
                )
        );
    }
    public List<CandidateListResponse> myApplications(Long candidateId) {
        return applicationRepository.findMyApplications(candidateId);
    }

    public List<AdminListResponse> adminList() {
        return applicationRepository.findAdminList();
    }
}
