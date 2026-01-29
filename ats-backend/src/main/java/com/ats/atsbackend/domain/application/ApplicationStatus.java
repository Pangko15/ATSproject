package com.ats.atsbackend.domain.application;

public enum ApplicationStatus {
    SUBMITTED,   // 제출
    REVIEWING,   // 검토중
    PASSED,      // 합격(다음 단계)
    REJECTED,    // 불합격
    CANCELED     // 지원취소(철회)
}
