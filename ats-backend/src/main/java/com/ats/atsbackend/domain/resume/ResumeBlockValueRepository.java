package com.ats.atsbackend.domain.resume;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeBlockValueRepository extends JpaRepository<ResumeBlockValueEntity, Long> {

    Optional<ResumeBlockValueEntity> findByBlock_IdAndFieldKey(Long blockId, String fieldKey);

    void deleteByBlock_IdAndFieldKey(Long blockId, String fieldKey);
    void deleteByBlock_Id(Long blockId);
    void deleteByBlock_IdIn(java.util.List<Long> blockIds);
    List<ResumeBlockValueEntity> findAllByBlock_IdIn(List<Long> blockIds);
}
