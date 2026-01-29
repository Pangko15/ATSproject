package com.ats.atsbackend.domain.file;

import com.ats.atsbackend.domain.file.dto.FileCreateRequest;
import com.ats.atsbackend.domain.file.dto.FileResponse;
import com.ats.atsbackend.global.config.FileStorageProperties;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final FileStorageProperties props;

    public FileController(FileService fileService, FileStorageProperties props) {
        this.fileService = fileService;
        this.props = props;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FileResponse create(@Valid @RequestBody FileCreateRequest req) {
        return fileService.create(req);
    }

    @GetMapping("/{fileId}")
    public FileResponse get(@PathVariable Long fileId) {
        return fileService.get(fileId);
    }

    @DeleteMapping("/{fileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long fileId) {
        fileService.delete(fileId);
    }




    @GetMapping("/upload-file")
    public String uploadFileInfo() {
        return "Use POST multipart/form-data. e.g. POST /api/files/upload-file with form-data key 'file'";
    }


    @PostMapping(value = "/upload-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "candidateId", required = false) Long candidateId,
            @RequestParam(value = "adminUserId", required = false) Long adminUserId
    ) throws Exception {
        Long fileId = fileService.upload(file, candidateId, adminUserId);
        return ResponseEntity.ok(fileId);
    }


    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long fileId) throws Exception {


        FileResponse info = fileService.get(fileId);


        if (info.deletedYn() != null && info.deletedYn() == 1) {
            return ResponseEntity.status(HttpStatus.GONE).build();
        }


        Path root = Paths.get(props.getUploadDir()).toAbsolutePath().normalize();
        Path target = root.resolve(info.fileKey()).normalize();

        if (!Files.exists(target)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(target.toUri());


        String originalName = (info.originalName() != null && !info.originalName().isBlank())
                ? info.originalName()
                : "download";

        String contentType = (info.mimeType() != null && !info.mimeType().isBlank())
                ? info.mimeType()
                : "application/octet-stream";

        String encoded = URLEncoder.encode(originalName, StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))

                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + originalName.replace("\"", "") + "\"; filename*=UTF-8''" + encoded)
                .body(resource);
    }
}