package com.ats.atsbackend.domain.file;

import com.ats.atsbackend.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table( name = "ATS_FILE" )
@SequenceGenerator(
        name = "FILE_SEQ_GEN",
        sequenceName = "FILE_SEQ",
        allocationSize = 1
)
public class FileEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "FILE_SEQ_GEN")
    @Column(name = "FILE_ID")
    private Long id;

    @Column(name = "ORIGINAL_NAME", nullable = false, length = 255)
    private String originalName;

    @Column(name = "FILE_KEY", nullable = false, length = 500)
    private String fileKey;

    @Column(name = "MIME_TYPE", length = 100)
    private String mimeType;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @Column(name = "FILE_HASH", length = 128)
    private String fileHash;

    @Column(name = "DELETED_YN", nullable = false)
    private Integer deletedYn; // 0/1

    @Column(name = "UPLOADED_AT", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "UPLOADED_BY_CANDIDATE_ID")
    private Long uploadedByCandidateId;

    @Column(name = "UPLOADED_BY_ADMIN_USER_ID")
    private Long uploadedByAdminUserId;

    protected FileEntity() {
    }

    public FileEntity(String originalName, String fileKey, String mimeType, Long fileSize,
                      Long uploadedByCandidateId, Long uploadedByAdminUserId) {
        this.originalName = originalName;
        this.fileKey = fileKey;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.deletedYn = 0;
        this.uploadedAt = LocalDateTime.now();
        this.uploadedByCandidateId = uploadedByCandidateId;
        this.uploadedByAdminUserId = uploadedByAdminUserId;
    }

    public Long getId() {
        return id;
    }
    public String getOriginalName() {

        return originalName;
    }
    public String getFileKey() {

        return fileKey;
    }
    public String getMimeType() {

        return mimeType;
    }
    public Long getFileSize() {

        return fileSize;
    }
    public Integer getDeletedYn() {

        return deletedYn;
    }
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void softDelete() {

        this.deletedYn = 1;
    }

}
