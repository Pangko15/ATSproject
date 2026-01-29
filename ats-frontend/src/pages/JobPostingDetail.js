import React from "react";

function JobPostingDetail() {
    const params = new URLSearchParams(window.location.search);
    const jobPostingId = params.get("jobPostingId");

    return (
        <div>
            <h2>공고 상세 (관리자)</h2>
            <p>jobPostingId = {jobPostingId}</p>

            {/* TODO: 다음 단계에서 여기에 공고 상세 정보 fetch + 지원자 관리 패널 붙임 */}
            {/* 예: 공고 제목/설명/마감일, 지원자 목록 버튼 등 */}
        </div>
    );
}

export default JobPostingDetail;