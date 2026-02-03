# 🚀 ATS (Applicant Tracking System) - 사용자 정의형 채용 관리 플랫폼

> **"정형화된 이력서 양식의 한계를 넘어, 지원자가 자신의 역량을 자유롭게 구성할 수 있는 동적(Dynamic) 채용 시스템"**

<br>

## 1. 📖 프로젝트 소개 (Project Overview)
기존의 채용 사이트는 학력, 경력 등 입력 항목이 고정되어 있어, 개발자(포트폴리오 중심)나 디자이너(작업물 중심) 등 다양한 직군의 역량을 온전히 담아내기 어려웠습니다.

본 프로젝트는 **EAV(Entity-Attribute-Value) 패턴을 응용**하여, 지원자가 레고 블록을 조립하듯 **원하는 항목(Block)을 자유롭게 추가하고 구성**할 수 있는 유연한 이력서 시스템을 구현했습니다.

* **개발 기간:** 2025.12.29 ~ 2026.01.30 (약 5주)
* **개발 인원:** 5명 - **본인 역할: Backend (DB 설계, 지원자 접수 및 이력서 관리 기능)**

<br>

## 2. 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 |
| :-: | :- |
| **Backend** | Java JDK-21, Spring Boot 4.0.1, Spring Data JPA |
| **Frontend** | React.js |
| **Database** | Oracle DB |
| **Infra & Tool** | Git, GitHub, IntelliJ IDEA |

<br>

## 3. 💾 ERD 설계 및 핵심 구조 (Database Modeling)

![ERD Structure Placeholder](https://via.placeholder.com/800x400?text=Insert+ERD+Image+Here)<img width="780" height="1236" alt="스크린샷 2026-01-30 171542" src="https://github.com/user-attachments/assets/82221527-b668-4045-89df-becabb60189c" />


### 3-1. 동적 이력서 구조 (Dynamic Schema)
* **Resume (1) ↔ Block (N) ↔ Value (N)**
* 고정된 컬럼 대신 **3단계 계층 구조**를 설계하여, DB 스키마 변경 없이도 사용자가 '수상내역', '자격증' 등 섹션을 무한정 확장할 수 있습니다.

### 3-2. 파일 시스템 정규화
* **File (1) ↔ ResumeFile (N) ↔ Resume (1)**
* 물리적 파일 정보와 연결 정보를 분리하여, 하나의 포트폴리오 파일을 여러 이력서에서 참조 가능하도록 설계 (N:M 해소 및 스토리지 절약).

<br>

## 4. ✨ 핵심 기능 및 기술적 챌린지 (Key Features)

### ① 데이터 무결성을 위한 중복 지원 방지
* **문제:** 시스템 딜레이나 사용자의 실수로 인한 중복 지원 데이터 적재 위험.
* **해결:** `Application` 테이블에 **복합 유니크 제약조건(Composite Unique Key: JobID + CandidateID)**을 설정.
* **성과:** 프론트엔드 제어를 넘어, **DB 레벨에서 중복 데이터를 원천 차단**하여 데이터 신뢰성 확보.

### ② 트랜잭션 기반의 안전한 데이터 삭제 (Cascading)
* **문제:** 이력서 삭제 시 연결된 블록, 값, 파일 정보가 남아 '고아 데이터(Orphan Data)' 발생 및 참조 무결성 오류.
* **해결:** `@Transactional` 범위 내에서 **[자식 데이터(Values) → 부모 데이터(Blocks) → 이력서(Resume)]** 순서로 삭제 로직을 명시적으로 구현.
* **코드 예시:**
    ```java
    @Transactional
    public void delete(Long resumeId) {
        // 자식 데이터 먼저 삭제 (FK 제약조건 준수)
        resumeBlockValueRepository.deleteByBlock_IdIn(blockIds);
        resumeBlockRepository.deleteByResume_Id(resumeId);
        resumeRepository.deleteById(resumeId);
    }
    ```

### ③ 보안을 고려한 파일 업로드 (UUID)
* **문제:** 원본 파일명 저장 시 덮어쓰기 충돌 및 파일명 추측을 통한 불법 다운로드(IDOR) 취약점.
* **해결:** `UUID.randomUUID()`를 활용하여 서버 저장 파일명을 난수화.
* **성과:** 파일명 충돌 방지 및 외부에서의 무작위 파일 접근 차단.

### ④ REST API 에러 응답 표준화
* **GlobalExceptionHandler**를 적용하여 비즈니스 로직 예외 발생 시 `409 Conflict`, `400 Bad Request` 등 명확한 HTTP 상태 코드와 메시지 반환.

<br>

## 5. 📝 회고 및 개선사항 (Retrospective)

### ✅ 잘한 점 (Good)
* **유연한 아키텍처:** 정형화된 테이블의 한계를 넘는 동적 구조를 직접 설계하고 구현함.
* **유지보수성:** `BaseTimeEntity`를 통한 공통 필드 자동화 및 패키지 구조화를 통해 코드 가독성을 높임.

### ⚠️ 아쉬운 점 (Improvement)
* **테스트 코드 부재:** 복잡한 비즈니스 로직에 비해 JUnit 단위 테스트 작성이 부족하여 리팩토링 시 어려움을 겪음. -> **향후 테스트 커버리지를 높이는 학습 예정.**
* **초기 설계의 중요성:** 프로젝트 초반 컨벤션(Git, Code Style) 통일이 미흡하여 통합 과정에서 시간 소요. -> **설계와 규칙 정립의 중요성을 체감.**
