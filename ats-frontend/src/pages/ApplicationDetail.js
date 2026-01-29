import React from "react";

export default function ApplicationDetail() {
    const params = new URLSearchParams(window.location.search);
    const applicationId = params.get("applicationId");

    const [data, setData] = React.useState(null);
    const [status, setStatus] = React.useState(""); // ✅ 현재 상태(버튼 active용)
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState("");
    const [updating, setUpdating] = React.useState(false);
    const [msg, setMsg] = React.useState(""); // ✅ 성공/실패 메시지

    const fetchDetail = React.useCallback(async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`/api/applications/${applicationId}`);
            const text = await res.text();
            if (!res.ok) throw new Error(text || "상세 조회 실패");

            const json = JSON.parse(text);
            setData(json);

            const s = json.applicationStatus || json.status || "";
            setStatus(s);
        } catch (e) {
            setErr(e.message || "에러");
            setData(null);
            setStatus("");
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    React.useEffect(() => {
        if (!applicationId) return;
        fetchDetail();
    }, [applicationId, fetchDetail]);

    const updateStatus = async (nextStatus) => {
        if (!applicationId) return;
        if (updating) return;

        setUpdating(true);
        setErr("");
        setMsg("");

        try {
            const res = await fetch(`/api/applications/${applicationId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });

            const t = await res.text();
            if (!res.ok) throw new Error(t || "상태 변경 실패");

            // ✅ UI 즉시 반영 (ATS 느낌)
            setStatus(nextStatus);
            setMsg("✅ 상태가 변경되었습니다.");
            window.setTimeout(() => setMsg(""), 2000);

            // ✅ 서버값과 동기화(필요하면 유지)
            await fetchDetail();
        } catch (e) {
            setErr(e.message || "상태 변경 실패");
            setMsg(`❌ ${e.message || "상태 변경 실패"}`);
            window.setTimeout(() => setMsg(""), 3000);
        } finally {
            setUpdating(false);
        }
    };

    if (!applicationId) {
        return (
            <div className="page">
                <div className="pageTitle">지원서 상세</div>
                <div className="muted">
                    applicationId 쿼리스트링이 필요합니다. 예) /?applicationId=43
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="pageHeader">
                <div>
                    <div className="pageTitle">지원서 상세</div>
                    <div className="muted">applicationId: {applicationId}</div>
                </div>

                {status && <span className={`badge ${badgeClass(status)}`}>{status}</span>}
            </div>

            {loading && <div className="card">불러오는 중...</div>}
            {err && <div className="card error">❌ {err}</div>}

            {msg && (
                <div className={`card ${msg.startsWith("✅") ? "ok" : "error"}`}>
                    {msg}
                </div>
            )}

            {data && !loading && (
                <div className="grid2">
                    {/* LEFT: 기본 정보 */}
                    <div className="card">
                        <div className="cardTitle">기본 정보</div>

                        <div className="kv">
                            <div className="k">제출일</div>
                            <div className="v">{formatDate(data.submittedAt)}</div>

                            <div className="k">공고</div>
                            <div className="v">
                                <div style={{ fontWeight: 800 }}>
                                    {data.jobPosting?.title || data.jobPost?.title || "-"}
                                </div>
                                <div className="muted" style={{ marginTop: 4 }}>
                                    jobPostingId: {data.jobPosting?.id ?? data.jobPost?.id ?? "-"} · status:{" "}
                                    {data.jobPosting?.status ?? data.jobPost?.status ?? "-"}
                                </div>
                            </div>

                            <div className="k">지원자ID</div>
                            <div className="v">{data.resume?.candidateId ?? "-"}</div>

                            <div className="k">이력서ID</div>
                            <div className="v">{data.resume?.id ?? "-"}</div>
                        </div>
                    </div>

                    {/* RIGHT: 이력서/파일/상태 */}
                    <div className="card">
                        <div className="cardTitle">이력서</div>

                        <div className="resumeBox">
                            <div className="resumeTop">
                                <div>
                                    <div className="resumeTitle">{data.resume?.title || "-"}</div>
                                    <div className="muted">{data.resume?.summary || "요약 없음"}</div>
                                </div>
                            </div>

                            <div className="fileList">
                                <FileRow label="RESUME" file={data.resume?.resumeFile} />
                                <FileRow label="PORTFOLIO" file={data.resume?.portfolioFile} />
                            </div>
                        </div>

                        <div className="divider" />

                        <div className="cardTitle" style={{ marginTop: 4 }}>
                            상태 변경
                        </div>

                        {/* ✅ 버튼: 기본 동일 / active만 색 */}
                        <div className="status-actions">
                            {["REVIEWING", "REJECTED", "PASSED"].map((s) => (
                                <button
                                    key={s}
                                    className={`status-btn ${status === s ? `is-active is-${s.toLowerCase()}` : ""}`}
                                    disabled={updating}
                                    onClick={() => updateStatus(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {updating && (
                            <div className="muted" style={{ marginTop: 10 }}>
                                상태 변경 중...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/** ===== 작은 컴포넌트 ===== */
function FileRow({ label, file }) {
    return (
        <div className="fileRow">
            <div className="fileLabel">{label}</div>
            <div className="fileValue">
                {file?.fileId ? (
                    <a className="link" href={`/api/files/${file.fileId}/download`}>
                        {file.originalName || `fileId=${file.fileId}`}
                    </a>
                ) : (
                    <span className="muted">없음</span>
                )}
            </div>
        </div>
    );
}

/** ===== 유틸 ===== */
function formatDate(v) {
    if (!v) return "-";
    return String(v).replace("T", " ").split(".")[0];
}

function badgeClass(status) {
    switch (status) {
        case "SUBMITTED":
            return "bGray";
        case "REVIEWING":
            return "bBlue";
        case "PASSED":
            return "bGreen";
        case "REJECTED":
            return "bRed";
        case "CANCELED":
            return "bDark";
        default:
            return "bGray";
    }
}