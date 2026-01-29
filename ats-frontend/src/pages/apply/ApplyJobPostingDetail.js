import React from "react";

export default function ApplyJobPostingDetail() {
    const params = new URLSearchParams(window.location.search);
    const jobPostingId = params.get("jobPostingId");
    const resumeIdFromUrl = params.get("resumeId");
    const candidateId = 1; // TODO: 로그인 붙이면 교체

    const [job, setJob] = React.useState(null);

    const [resumes, setResumes] = React.useState([]);
    const [selectedResumeId, setSelectedResumeId] = React.useState("");
    const [resumeDetail, setResumeDetail] = React.useState(null);

    const [loadingResume, setLoadingResume] = React.useState(false);
    const [error, setError] = React.useState("");

    // 포트폴리오 업로드 상태
    const [portfolioFile, setPortfolioFile] = React.useState(null);
    const [uploading, setUploading] = React.useState(false);
    const [uploadMsg, setUploadMsg] = React.useState("");

    // 지원서 제출 상태
    const [submitting, setSubmitting] = React.useState(false);
    const [submitMsg, setSubmitMsg] = React.useState("");

    // 공고 상세
    React.useEffect(() => {
        if (!jobPostingId) return;

        fetch(`/api/job-postings/${jobPostingId}`)
            .then((r) => r.json())
            .then(setJob)
            .catch(() => setError("공고 조회 실패"));
    }, [jobPostingId]);

    // 내 이력서 목록
    React.useEffect(() => {
        fetch(`/api/resumes/candidates/${candidateId}`)
            .then((r) => r.json())
            .then((list) => {
                setResumes(list || []);

                if (resumeIdFromUrl) {
                    setSelectedResumeId(String(resumeIdFromUrl));
                } else if (list?.length === 1) {
                    setSelectedResumeId(String(list[0].resumeId));
                }
            })
            .catch(() => setError("이력서 목록 조회 실패"));
    }, [candidateId, resumeIdFromUrl]);

    // 선택한 이력서 상세
    const loadResumeDetail = React.useCallback(async (rid) => {
        if (!rid) {
            setResumeDetail(null);
            return;
        }
        setLoadingResume(true);
        setError("");
        try {
            const res = await fetch(`/api/resumes/${rid}`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setResumeDetail(data);
        } catch (e) {
            setError(e.message || "이력서 조회 실패");
        } finally {
            setLoadingResume(false);
        }
    }, []);

    React.useEffect(() => {
        setUploadMsg("");
        setPortfolioFile(null);
        loadResumeDetail(selectedResumeId);
    }, [selectedResumeId, loadResumeDetail]);

    // 포트폴리오 업로드 + 이력서에 연결
    const uploadAndAttachPortfolio = async () => {
        setUploadMsg("");
        setError("");

        if (!selectedResumeId) {
            setUploadMsg("먼저 이력서를 선택해주세요.");
            return;
        }
        if (!portfolioFile) {
            setUploadMsg("업로드할 포트폴리오 파일을 선택해주세요.");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", portfolioFile);
            formData.append("candidateId", String(candidateId));

            const uploadRes = await fetch("/api/files/upload-file", {
                method: "POST",
                body: formData,
            });

            const uploadText = await uploadRes.text();
            if (!uploadRes.ok) throw new Error(`업로드 실패: ${uploadText}`);

            const fileId = Number(uploadText);
            if (!fileId) throw new Error("업로드 응답 fileId 파싱 실패");

            const attachRes = await fetch(`/api/resumes/${selectedResumeId}/portfolio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ portfolioFileId: Number(fileId) }),
            });

            if (!attachRes.ok) {
                const t = await attachRes.text();
                throw new Error(`포트폴리오 연결 실패: ${t}`);
            }

            setUploadMsg("✅ 포트폴리오가 이력서에 연결되었습니다.");
            setPortfolioFile(null);
            await loadResumeDetail(selectedResumeId);
        } catch (e) {
            setUploadMsg(`❌ ${e.message}`);
        } finally {
            setUploading(false);
        }
    };

    // 지원서 제출
    const submitApplication = async () => {
        setSubmitMsg("");
        setError("");

        if (!selectedResumeId) {
            setSubmitMsg("이력서를 선택해주세요.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobPostingId: Number(jobPostingId),
                    candidateId: Number(candidateId),
                    resumeId: Number(selectedResumeId),
                }),
            });

            const text = await res.text();
            if (!res.ok) throw new Error(text || "지원서 제출 실패");

            // 성공 → 내 지원 목록으로
            window.location.href = `/apply?myApplications=1`;
        } catch (e) {
            setSubmitMsg(`❌ ${e.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const hasNoResume = resumes.length === 0;

    if (!jobPostingId) {
        return (
            <div className="page">
                <div className="pageTitle">공고 상세</div>
                <div className="muted">jobPostingId가 필요합니다. 예) /apply?jobPostingId=21</div>
            </div>
        );
    }

    const jobStatus = (job?.status || "OPEN").toUpperCase();

    return (
        <div className="page">
            <div className="pageHeader">
                <div>
                    <div className="pageTitle">공고 상세</div>
                    <div className="muted">jobPostingId: {jobPostingId}</div>
                </div>
                <span className={`badge ${jobStatus === "OPEN" ? "bGreen" : "bGray"}`}>
          {jobStatus}
        </span>
            </div>

            {error && <div className="card error">❌ {error}</div>}

            <div className="grid2">
                {/* LEFT: 공고 정보 */}
                <div className="card">
                    <div className="cardTitle">공고 정보</div>

                    <div className="kv">
                        <div className="k">제목</div>
                        <div className="v" style={{ fontWeight: 900 }}>
                            {job?.title || "-"}
                        </div>

                        <div className="k">상태</div>
                        <div className="v">
              <span className={`badge ${jobStatus === "OPEN" ? "bGreen" : "bGray"}`}>
                {jobStatus}
              </span>
                        </div>

                        <div className="k">설명</div>
                        <div className="v" style={{ whiteSpace: "pre-wrap" }}>
                            {job?.description || "설명 없음"}
                        </div>
                    </div>
                </div>

                {/* RIGHT: 지원하기 */}
                <div className="card">
                    <div className="cardTitle">지원하기</div>

                    {hasNoResume ? (
                        <div>
                            <div className="muted">등록된 이력서가 없습니다. 먼저 이력서를 작성해주세요.</div>
                            <button
                                className="btn primary"
                                style={{ marginTop: 12 }}
                                onClick={() =>
                                    (window.location.href = `/apply?resumeCreate=1&jobPostingId=${jobPostingId}`)
                                }
                            >
                                이력서 작성하러 가기
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "grid", gap: 10 }}>
                                <div>
                                    <div className="muted" style={{ marginBottom: 6 }}>
                                        이력서 선택 (필수)
                                    </div>
                                    <select
                                        className="select"
                                        value={selectedResumeId}
                                        onChange={(e) => setSelectedResumeId(e.target.value)}
                                    >
                                        <option value="">선택하세요</option>
                                        {resumes.map((r) => (
                                            <option key={r.resumeId} value={r.resumeId}>
                                                {r.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {loadingResume && <div className="muted">이력서 불러오는 중...</div>}

                                {resumeDetail && (
                                    <div className="card" style={{ padding: 14, borderRadius: 14 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                            <div>
                                                <div style={{ fontWeight: 900 }}>{resumeDetail.title}</div>
                                                <div className="muted" style={{ marginTop: 4 }}>
                                                    {resumeDetail.summary || "요약 없음"}
                                                </div>
                                            </div>
                                            <span className="badge bGray">resumeId: {resumeDetail.resumeId}</span>
                                        </div>

                                        <div className="divider" />

                                        <FileRow label="RESUME" file={resumeDetail.resumeFile} />
                                        <FileRow label="PORTFOLIO" file={resumeDetail.portfolioFile} />

                                        {!resumeDetail.portfolioFile && (
                                            <div style={{ marginTop: 12 }}>
                                                <div className="muted" style={{ marginBottom: 6 }}>
                                                    포트폴리오 업로드 (선택)
                                                </div>

                                                <input
                                                    className="input"
                                                    type="file"
                                                    onChange={(e) => setPortfolioFile(e.target.files?.[0] || null)}
                                                />

                                                <div className="btnRow" style={{ marginTop: 10 }}>
                                                    <button
                                                        className="btn"
                                                        onClick={uploadAndAttachPortfolio}
                                                        disabled={uploading}
                                                    >
                                                        {uploading ? "업로드 중..." : "포트폴리오 업로드 & 연결"}
                                                    </button>
                                                </div>

                                                {uploadMsg && (
                                                    <div style={{ marginTop: 8 }} className={uploadMsg.startsWith("❌") ? "error card" : "muted"}>
                                                        {uploadMsg}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="btnRow" style={{ marginTop: 6 }}>
                                    <button
                                        className="btn primary"
                                        onClick={submitApplication}
                                        disabled={!selectedResumeId || submitting}
                                    >
                                        {submitting ? "제출 중..." : "지원서 제출"}
                                    </button>
                                </div>

                                {submitMsg && <div className="card error">❌ {submitMsg}</div>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function FileRow({ label, file }) {
    return (
        <div className="fileRow" style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, padding: "6px 0" }}>
            <div className="muted" style={{ fontWeight: 900 }}>{label}</div>
            <div>
                {file?.fileId ? (
                    <a className="link" href={`/api/files/${file.fileId}/download`} style={{ fontWeight: 900 }}>
                        {file.originalName || `fileId=${file.fileId}`}
                    </a>
                ) : (
                    <span className="muted">없음</span>
                )}
            </div>
        </div>
    );
}