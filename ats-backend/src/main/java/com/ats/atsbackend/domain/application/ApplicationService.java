package com.ats.atsbackend.domain.application;

import com.ats.atsbackend.domain.jobposting.JobPostingEntity;
import com.ats.atsbackend.domain.jobposting.JobPostingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              JobPostingRepository jobPostingRepository) {
        this.applicationRepository = applicationRepository;
        this.jobPostingRepository = jobPostingRepository;
    }

    // 지원서 제출
    public Long submit(Long jobPostingId, Long candidateId, Long resumeId) {
        JobPostingEntity posting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new IllegalArgumentException("JOB_POSTING not found id=" + jobPostingId));

        // 중복 지원 방지 (DB UK + 서비스에서도 한번 더)
        applicationRepository.findByJobPostingIdAndCandidateId(jobPostingId, candidateId)
                .ifPresent(x -> { throw new IllegalStateException("이미 지원한 공고입니다."); });

        ApplicationEntity app = applicationRepository.save(new ApplicationEntity(posting, candidateId, resumeId));
        return app.getId();
    }

    @Transactional(readOnly = true)
    public ApplicationEntity get(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("APPLICATION not found id=" + applicationId));
    }
    @Transactional
    public void updateStatus(Long applicationId, ApplicationStatus newStatus) {
        ApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("APPLICATION not found id=" + applicationId));

        if (app.getStatus() == ApplicationStatus.CANCELED) {
            throw new IllegalStateException("Canceled application cannot be changed");
        }

        app.changeStatus(newStatus);
    }
    @Transactional
    public void cancel(Long applicationId) {
        ApplicationEntity app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("APPLICATION not found id=" + applicationId));


        if (app.getStatus() == ApplicationStatus.CANCELED) {
            throw new IllegalStateException("Already canceled");
        }


        app.cancel();
    }
}
