package com.ats.atsbackend.domain.resume;

import com.ats.atsbackend.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "ATS_RESUME_BLOCK")
@SequenceGenerator(
        name = "RESUME_BLOCK_SEQ_GEN",
        sequenceName = "RESUME_BLOCK_SEQ",
        allocationSize = 1
)
public class ResumeBlockEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "RESUME_BLOCK_SEQ_GEN")
    @Column(name = "BLOCK_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RESUME_ID", nullable = false)
    private ResumeEntity resume;

    @Column(name = "SECTION_KEY", nullable = false, length = 50)
    private String sectionKey;

    @Column(name = "TITLE", nullable = false, length = 100)
    private String title;

    @Column(name = "SORT_ORDER", nullable = false)
    private Integer sortOrder;

    protected ResumeBlockEntity() {}

    public ResumeBlockEntity(ResumeEntity resume, String sectionKey, String title, Integer sortOrder) {
        this.resume = resume;
        this.sectionKey = sectionKey;
        this.title = title;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public Integer getSortOrder() { return sortOrder; }
    public String getSectionKey() { return sectionKey; }
    public String getTitle() { return title; }
    public ResumeEntity getResume() { return resume; }
}
