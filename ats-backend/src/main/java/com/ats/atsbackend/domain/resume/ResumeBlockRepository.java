package com.ats.atsbackend.domain.resume;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeBlockRepository extends JpaRepository<ResumeBlockEntity, Long> {
    int countByResume_Id(Long resumeId);
    java.util.List<ResumeBlockEntity> findAllByResume_Id(Long resumeId);
    void deleteByResume_Id(Long resumeId);
    List<ResumeBlockEntity> findAllByResume_IdOrderBySortOrderAsc(Long resumeId);
}
