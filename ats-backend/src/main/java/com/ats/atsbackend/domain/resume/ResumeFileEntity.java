package com.ats.atsbackend.domain.resume;

import com.ats.atsbackend.domain.file.FileEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ATS_RESUME_FILE",
        uniqueConstraints = @UniqueConstraint(name = "UK_RF_ROLE", columnNames = {"RESUME_ID", "FILE_ROLE"}))
@SequenceGenerator(
        name = "RESUME_FILE_SEQ_GEN",
        sequenceName = "RESUME_FILE_SEQ",
        allocationSize = 1
)
public class ResumeFileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "RESUME_FILE_SEQ_GEN")
    @Column(name = "RESUME_FILE_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "RESUME_ID", nullable = false)
    private ResumeEntity resume;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "FILE_ID", nullable = false)
    private FileEntity file;

    @Enumerated(EnumType.STRING)
    @Column(name = "FILE_ROLE", nullable = false, length = 20)
    private FileRole fileRole;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    protected ResumeFileEntity() {}

    public ResumeFileEntity(ResumeEntity resume, FileEntity file, FileRole fileRole) {
        this.resume = resume;
        this.file = file;
        this.fileRole = fileRole;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }
    public ResumeEntity getResume() {
        return resume;
    }
    public FileEntity getFile() {
        return file;
    }
    public FileRole getFileRole() {
        return fileRole;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void changeFile(FileEntity file) {
        this.file = file;
    }
}
