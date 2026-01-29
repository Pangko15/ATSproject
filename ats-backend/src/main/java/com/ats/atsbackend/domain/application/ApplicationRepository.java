package com.ats.atsbackend.domain.application;

import com.ats.atsbackend.domain.application.dto.AdminListResponse;
import com.ats.atsbackend.domain.application.dto.CandidateListResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<ApplicationEntity, Long> {

    void deleteByResumeId(Long resumeId);

    Optional<ApplicationEntity> findByJobPostingIdAndCandidateId(Long jobPostingId, Long candidateId);

    // ✅ 여기 추가
    @Query("""
        select new com.ats.atsbackend.domain.application.dto.CandidateListResponse(
            a.id,
            jp.id,
            jp.title,
            a.status,
            a.submittedAt
        )
        from ApplicationEntity a
        join a.jobPosting jp
        where a.candidateId = :candidateId
        order by a.submittedAt desc
    """)


    List<CandidateListResponse> findMyApplications(@Param("candidateId") Long candidateId);

    @Query("""
        select new com.ats.atsbackend.domain.application.dto.AdminListResponse(
            a.id,
            jp.id,
            jp.title,
            a.candidateId,
            a.resumeId,
            a.status,
            a.submittedAt
        )
        from ApplicationEntity a
        join a.jobPosting jp
        order by a.submittedAt desc
    """)
    List<AdminListResponse> findAdminList();
}
