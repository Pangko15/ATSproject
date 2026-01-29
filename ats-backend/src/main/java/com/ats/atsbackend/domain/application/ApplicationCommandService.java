package com.ats.atsbackend.domain.application;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ApplicationCommandService {

    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository;

    public ApplicationCommandService(
            ApplicationService applicationService,
            ApplicationRepository applicationRepository
    ) {
        this.applicationService = applicationService;
        this.applicationRepository = applicationRepository;
    }

    /* ======================
       Create: 지원서 제출
    ====================== */
    public Long submit(Long jobPostingId, Long candidateId, Long resumeId) {
        return applicationService.submit(jobPostingId, candidateId, resumeId);
    }

    /* ======================
       Update: 지원서 상태 변경
    ====================== */
    public void updateStatus(Long applicationId, ApplicationStatus newStatus) {
        applicationService.updateStatus(applicationId, newStatus);
    }

    public void cancel(Long applicationId) {
        applicationService.cancel(applicationId);
    }
}
