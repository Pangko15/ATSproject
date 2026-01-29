package com.ats.atsbackend.domain.jobposting;

import com.ats.atsbackend.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ATS_JOB_POSTING")
@SequenceGenerator(
        name = "JOB_POSTING_SEQ_GEN",
        sequenceName = "JOB_POSTING_SEQ",
        allocationSize = 1
)
public class JobPostingEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "JOB_POSTING_SEQ_GEN")
    @Column(name = "JOB_POSTING_ID")
    private Long id;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "DESCRIPTION", length = 2000)
    private String description;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status; // OPEN/CLOSED

    protected JobPostingEntity() {}

    public JobPostingEntity(String title, String description) {
        this.title = title;
        this.description = description;
        this.status = "OPEN";
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }


    public void close() { this.status = "CLOSED"; }
}
