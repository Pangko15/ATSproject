package com.ats.atsbackend.domain.resume;

import com.ats.atsbackend.domain.resume.dto.ResumeListItemResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResumeRepository extends JpaRepository<ResumeEntity, Long> {

    @Query("""
        select new com.ats.atsbackend.domain.resume.dto.ResumeListItemResponse(r.id, r.title)
        from ResumeEntity r
        where r.candidateId = :candidateId
        order by r.id desc
    """)
    List<ResumeListItemResponse> findListByCandidateId(@Param("candidateId") Long candidateId);
}
