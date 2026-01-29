package com.ats.atsbackend.domain.resume;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeFileRepository extends JpaRepository<ResumeFileEntity, Long> {

    Optional<ResumeFileEntity> findByResume_IdAndFileRole(Long resumeId, FileRole fileRole);

    long countByResume_Id(Long resumeId);

    List<ResumeFileEntity> findAllByResume_Id(Long resumeId);

    void deleteByResume_Id(Long resumeId);

    void deleteByResume_IdAndFileRole(Long resumeId, FileRole fileRole);
}
