import React from "react";

export default function ApplyApplicationDetail() {
    const params = new URLSearchParams(window.location.search);
    const applicationId = params.get("applicationId");

    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (!applicationId) return;

        (async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/applications/${applicationId}`);
                const text = await res.text();
                if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

                setData(JSON.parse(text));
            } catch (e) {
                setError(e.message || "조회 실패");
            } finally {
                setLoading(false);
            }
        })();
    }, [applicationId]);

    if (!applicationId) return <div>applicationId가 없습니다.</div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ marginBottom: 6 }}>지원서 상세</h1>
                    <div style={{ color: "#666" }}>applicationId: {applicationId}</div>
                </div>

                {data?.applicationStatus && (
                    <div
                        style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            border: "1px solid #e5e7eb",
                            background: "#f8fafc",
                            fontWeight: 700,
                        }}
                    >
                        {data.applicationStatus}
                    </div>
                )}
            </div>

            {loading && <p style={{ marginTop: 12 }}>불러오는 중...</p>}
            {error && <p style={{ marginTop: 12, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</p>}

            {data && !loading && !error && (
                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* 기본 정보 */}
                    <section style={{ border: "1px solid #eee", borderRadius: 14, padding: 16, background: "white" }}>
                        <h3 style={{ marginTop: 0 }}>기본 정보</h3>
                        <Row label="제출일" value={fmtDate(data.submittedAt)} />
                        <Row label="공고" value={data.jobPosting?.title || "-"} />
                        <Row
                            label="공고상태"
                            value={data.jobPosting?.status || "-"}
                        />
                        <Row
                            label="공고ID"
                            value={data.jobPosting?.id ?? "-"}
                        />
                        <Row label="지원자ID" value={data.resume?.candidateId ?? "-"} />
                        <Row label="이력서ID" value={data.resume?.id ?? "-"} />
                    </section>

                    {/* 이력서 */}
                    <section style={{ border: "1px solid #eee", borderRadius: 14, padding: 16, background: "white" }}>
                        <h3 style={{ marginTop: 0 }}>이력서</h3>

                        <div style={{ fontWeight: 800, fontSize: 18 }}>{data.resume?.title || "-"}</div>
                        <div style={{ marginTop: 6, color: "#555" }}>{data.resume?.summary || ""}</div>

                        <div style={{ marginTop: 14 }}>
                            <FileRow label="RESUME" file={data.resume?.resumeFile} />
                            <FileRow label="PORTFOLIO" file={data.resume?.portfolioFile} />
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <a href="/apply?myApplications=1" style={{ textDecoration: "none" }}>
                                ← 내 지원 목록으로
                            </a>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f2f2f2" }}>
            <div style={{ width: 90, color: "#666" }}>{label}</div>
            <div style={{ fontWeight: 600 }}>{value}</div>
        </div>
    );
}

function FileRow({ label, file }) {
    return (
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0" }}>
            <div style={{ width: 90, color: "#666", fontWeight: 700 }}>{label}</div>
            {file ? (
                <a href={`/api/files/${file.fileId}/download`} style={{ fontWeight: 700 }}>
                    {file.originalName}
                </a>
            ) : (
                <span style={{ color: "#999" }}>없음</span>
            )}
        </div>
    );
}

function fmtDate(v) {
    if (!v) return "-";
    return String(v).slice(0, 19).replace("T", " ");
}