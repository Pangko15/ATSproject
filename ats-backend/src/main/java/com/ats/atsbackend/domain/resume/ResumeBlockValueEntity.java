package com.ats.atsbackend.domain.resume;

import com.ats.atsbackend.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;

@Entity
@Table(
        name = "ATS_RESUME_BLOCK_VALUE",
        uniqueConstraints = {
                @UniqueConstraint(name = "UK_RBV", columnNames = {"BLOCK_ID", "FIELD_KEY"})
        }
)
@SequenceGenerator(
        name = "RESUME_BLOCK_VALUE_SEQ_GEN",
        sequenceName = "RESUME_BLOCK_VALUE_SEQ", // ✅ 너가 만든 시퀀스명으로 맞춰줘
        allocationSize = 1
)
public class ResumeBlockValueEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "RESUME_BLOCK_VALUE_SEQ_GEN")
    @Column(name = "VALUE_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BLOCK_ID", nullable = false)
    private ResumeBlockEntity block;

    @Column(name = "FIELD_KEY", nullable = false, length = 50)
    private String fieldKey;


    @Lob
    @Column(name = "VALUE_TEXT")
    private String valueText;

    protected ResumeBlockValueEntity() {}

    public ResumeBlockValueEntity(ResumeBlockEntity block, String fieldKey, String valueText) {
        this.block = block;
        this.fieldKey = fieldKey;
        this.valueText = valueText;
    }

    public Long getId() { return id; }
    public ResumeBlockEntity getBlock() { return block; }
    public String getFieldKey() { return fieldKey; }
    public String getValueText() { return valueText; }

    public void changeValueText(String valueText) {
        this.valueText = valueText;
    }
}
