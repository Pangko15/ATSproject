package com.ats.atsbackend.domain.resume;

import com.ats.atsbackend.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ATS_RESUME")
@SequenceGenerator(
        name = "RESUME_SEQ_GEN",
        sequenceName = "RESUME_SEQ",
        allocationSize = 1
)
public class ResumeEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "RESUME_SEQ_GEN")
    @Column(name = "RESUME_ID")
    private Long id;

    @Column(name = "CANDIDATE_ID", nullable = false)
    private Long candidateId;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "SUMMARY", length = 1000)
    private String summary;

    @Column(name = "EMAIL", length = 200)
    private String email;

    @Column(name = "PHONE", length = 30)
    private String phone;

    @Column(name = "DELETED_YN", nullable = false)
    private Integer deletedYn;

    protected ResumeEntity() {}

    public ResumeEntity(Long candidateId, String title, String summary, String email, String phone) {
        this.candidateId = candidateId;
        this.title = title;
        this.summary = summary;
        this.email = email;
        this.phone = phone;
        this.deletedYn = 0;
    }

    public Long getId() { return id; }
    public Long getCandidateId() { return candidateId; }
    public String getTitle() { return title; }
    public String getSummary() { return summary; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }

    public void update(String title, String summary, String email, String phone) {
        this.title = title;
        this.summary = summary;
        this.email = email;
        this.phone = phone;
    }


    public Integer getDeletedYn() { return deletedYn; }

    public void softDelete() { this.deletedYn = 1; }

}
