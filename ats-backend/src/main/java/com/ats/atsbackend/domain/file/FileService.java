package com.ats.atsbackend.domain.file;

import com.ats.atsbackend.domain.file.dto.FileCreateRequest;
import com.ats.atsbackend.domain.file.dto.FileResponse;
import com.ats.atsbackend.global.config.FileStorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.UUID;

@Service
@Transactional
public class FileService {

    private final FileRepository fileRepository;
    private final FileStorageProperties props;

    public FileService(FileRepository fileRepository, FileStorageProperties props) {
        this.fileRepository = fileRepository;
        this.props = props;
    }

    public FileResponse create(FileCreateRequest req) {
        FileEntity saved = fileRepository.save(
                new FileEntity(
                        req.originalName(),
                        req.fileKey(),
                        req.mimeType(),
                        req.fileSize(),
                        req.uploadedByCandidateId(),
                        req.uploadedByAdminUserId()
                )
        );

        return new FileResponse(
                saved.getId(),
                saved.getOriginalName(),
                saved.getFileKey(),
                saved.getMimeType(),
                saved.getFileSize(),
                saved.getDeletedYn(),
                saved.getUploadedAt()
        );
    }

    @Transactional(readOnly = true)
    public FileResponse get(Long fileId) {
        FileEntity e = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("FILE not found. id=" + fileId));

        return new FileResponse(
                e.getId(),
                e.getOriginalName(),
                e.getFileKey(),
                e.getMimeType(),
                e.getFileSize(),
                e.getDeletedYn(),
                e.getUploadedAt()
        );
    }

    public void delete(Long fileId) {
        FileEntity e = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("FILE not found. id=" + fileId));
        e.softDelete();
    }
    public Long upload(MultipartFile multipartFile, Long candidateId, Long adminUserId) throws Exception {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException("file is empty");
        }

        String originalName = StringUtils.cleanPath(multipartFile.getOriginalFilename());
        String contentType = multipartFile.getContentType();
        long size = multipartFile.getSize();

        String ext = "";
        int dot = originalName.lastIndexOf(".");
        if (dot >= 0) ext = originalName.substring(dot);

        String storedName = UUID.randomUUID() + ext;

        Path root = Paths.get(props.getUploadDir()).toAbsolutePath().normalize();
        Files.createDirectories(root);

        Path target = root.resolve(storedName);
        Files.copy(multipartFile.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String fileKey = storedName; // 로컬 저장 기준

        FileEntity saved = fileRepository.save(
                new FileEntity(
                        originalName,
                        fileKey,
                        contentType,
                        size,
                        candidateId,
                        adminUserId
                )
        );

        return saved.getId();
    }
}
