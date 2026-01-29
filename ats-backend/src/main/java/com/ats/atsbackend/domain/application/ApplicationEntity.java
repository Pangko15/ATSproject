package com.ats.atsbackend.domain.application;

import com.ats.atsbackend.domain.jobposting.JobPostingEntity;
import com.ats.atsbackend.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ATS_APPLICATION",
        uniqueConstraints = @UniqueConstraint(
                name = "UK_APP_UNIQUE",
                columnNames = {"JOB_POSTING_ID", "CANDIDATE_ID"}
        )
)
@SequenceGenerator(
        name = "APPLICATION_SEQ_GEN",
        sequenceName = "APPLICATION_SEQ",
        allocationSize = 1
)
public class ApplicationEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "APPLICATION_SEQ_GEN")
    @Column(name = "APPLICATION_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "JOB_POSTING_ID", nullable = false)
    private JobPostingEntity jobPosting;

    @Column(name = "CANDIDATE_ID", nullable = false)
    private Long candidateId;

    @Column(name = "RESUME_ID", nullable = false)
    private Long resumeId;


    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(name = "SUBMITTED_AT", nullable = false)
    private LocalDateTime submittedAt;

    protected ApplicationEntity() {}

    public ApplicationEntity(JobPostingEntity jobPosting, Long candidateId, Long resumeId) {
        this.jobPosting = jobPosting;
        this.candidateId = candidateId;
        this.resumeId = resumeId;
        this.status = ApplicationStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
    }

    /* ======================
       Getter
    ====================== */
    public Long getId() {

        return id;
    }

    public JobPostingEntity getJobPosting() {

        return jobPosting;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public Long getResumeId() {

        return resumeId;
    }

    public ApplicationStatus getStatus() {

        return status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }


    public void changeStatus(ApplicationStatus status) {
        this.status = status;
    }

    public void cancel() {
        if (this.status == ApplicationStatus.CANCELED) {
            throw new IllegalStateException("Already canceled");
        }
        changeStatus(ApplicationStatus.CANCELED);
    }
}