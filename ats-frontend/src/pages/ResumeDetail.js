import React from "react";
import { useEffect, useState } from "react";

function getResumeIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("resumeId");
    return v ? Number(v) : 1;
}

function ResumeDetail() {
    const resumeId = getResumeIdFromQuery();

    const [resume, setResume] = useState(null);
    const [error, setError] = useState(null);

    const downloadUrl = (fileId) => `/api/files/${fileId}/download`;

    const fetchResume = React.useCallback(async () => {
        try {
            setError(null);
            const res = await fetch(`/api/resumes/${resumeId}`); // proxy 사용
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            setResume(data);
        } catch (e) {
            setError(e.message);
        }
    }, [resumeId]);

    useEffect(() => {
        fetchResume();
    }, [fetchResume]);

    if (error) {
        return (
            <div style={{ marginTop: 20 }}>
                <h2>이력서 상세</h2>
                <p style={{ color: "red" }}>에러: {error}</p>
            </div>
        );
    }

    if (!resume) {
        return (
            <div style={{ marginTop: 20 }}>
                <h2>이력서 상세</h2>
                <p>로딩중...</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: 20 }}>
            <h2>이력서 상세</h2>

            <p>
                <b>이력서 ID:</b> {resume.resumeId}
            </p>
            <p>
                <b>지원자 ID:</b> {resume.candidateId}
            </p>
            <p>
                <b>제목:</b> {resume.title}
            </p>
            <p>
                <b>요약:</b> {resume.summary}
            </p>

            <hr />

            <h3>RESUME 파일</h3>
            {resume.resumeFile ? (
                <a href={downloadUrl(resume.resumeFile.fileId)} target="_blank" rel="noreferrer">
                    {resume.resumeFile.originalName} 다운로드
                </a>
            ) : (
                <p>이력서 파일 없음</p>
            )}

            <h3 style={{ marginTop: 20 }}>PORTFOLIO 파일</h3>
            {resume.portfolioFile ? (
                <a href={downloadUrl(resume.portfolioFile.fileId)} target="_blank" rel="noreferrer">
                    {resume.portfolioFile.originalName} 다운로드
                </a>
            ) : (
                <p>PORTFOLIO 파일 없음</p>
            )}

            {/* ✅ 포트폴리오 업로드 + 연결 */}
            <PortfolioUploadBox
                resumeId={resumeId}
                onLinked={() => fetchResume()} // 연결 후 재조회
            />
        </div>
    );
}

/**
 * 1) 파일 업로드: POST /api/files/upload-file (multipart)
 * 2) resume에 연결: POST /api/resumes/{resumeId}/portfolio (여기 URL은 네 백엔드에 맞춰야 함)
 */
function PortfolioUploadBox({ resumeId, onLinked }) {
    const [file, setFile] = React.useState(null);
    const [result, setResult] = React.useState("");

    const uploadAndLink = async () => {
        if (!file) return alert("포트폴리오 파일을 선택하세요");
        setResult("1) 업로드 중...");

        try {
            // 1) 업로드
            const form = new FormData();
            form.append("file", file);

            const uploadRes = await fetch("/api/files/upload-file", {
                method: "POST",
                body: form,
            });

            const uploadText = await uploadRes.text();
            if (!uploadRes.ok) {
                setResult(`업로드 실패 (status=${uploadRes.status})\n${uploadText}`);
                return;
            }

            const fileId = Number(uploadText);
            setResult(`1) 업로드 성공 ✅ fileId=${fileId}\n2) 이력서에 연결 중...`);

            // 2) 연결 (⭐️ 이 URL은 네 ResumeController에 맞춰야 함)
            // 아래는 A안(권장): POST /api/resumes/{resumeId}/portfolio, body에 portfolioFileId
            const linkRes = await fetch(`/api/resumes/${resumeId}/portfolio`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ portfolioFileId: fileId }),
            });

            const linkText = await linkRes.text();
            if (!linkRes.ok) {
                setResult(`연결 실패 (status=${linkRes.status})\n${linkText}`);
                return;
            }

            setResult(`업로드+연결 완료 ✅ fileId=${fileId}`);
            onLinked?.();
        } catch (e) {
            setResult("에러: " + e.message);
        }
    };

    return (
        <div style={{ marginTop: 20, padding: 12, border: "1px solid #ddd" }}>
            <h3>포트폴리오 업로드</h3>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
            <button onClick={uploadAndLink} style={{ marginLeft: 8 }}>
                업로드 & 연결
            </button>
            <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
            <p style={{ fontSize: 12, color: "#666" }}>
                연결 API가 다르면 이 컴포넌트의 fetch URL만 너 백엔드에 맞춰 바꾸면 됨
            </p>
        </div>
    );
}

export default ResumeDetail;