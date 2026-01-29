import React from "react";

export default function ApplyResumeDetail() {
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get("resumeId");

    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    const load = React.useCallback(async () => {
        if (!resumeId) return;
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch(`/api/resumes/${resumeId}`);
            const text = await res.text();
            if (!res.ok) throw new Error(text);
            setData(JSON.parse(text));
        } catch (e) {
            setMsg(`❌ ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [resumeId]);

    React.useEffect(() => {
        load();
    }, [load]);

    const onDelete = async () => {
        if (!resumeId) return;
        const ok = window.confirm("정말 이 이력서를 삭제할까요?\n(연결된 지원서도 함께 삭제될 수 있어요)");
        if (!ok) return;

        setMsg("");
        try {
            const res = await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
            const text = await res.text();
            if (!res.ok) throw new Error(text || "삭제 실패");

            // ✅ 삭제 후 리스트로
            window.location.href = "/apply?resumeList=1";
        } catch (e) {
            setMsg(`❌ ${e.message}`);
        }
    };

    return (
        <div className="ui-page">
            <div className="ui-pageHeader">
                <div>
                    <div className="ui-title">이력서 상세</div>
                    <div className="ui-subtitle">이력서/파일 정보를 확인하고 관리합니다.</div>
                </div>

                <div className="ui-actions">
                    <button
                        className="ui-btn ui-btnGhost"
                        onClick={() => (window.location.href = `/apply?resumeEdit=1&resumeId=${resumeId}`)}
                    >
                        수정
                    </button>
                    <button className="ui-btn ui-btnDanger" onClick={onDelete}>
                        삭제
                    </button>
                </div>
            </div>

            {loading && <div className="ui-hint">불러오는 중...</div>}
            {msg && <div className="ui-error">{msg}</div>}

            {!loading && data && (
                <div className="ui-card">
                    <div className="ui-cardHeader">
                        <div className="ui-cardTitle">{data.title}</div>
                        <div className="ui-cardMeta">resumeId: <span className="ui-mono">{data.resumeId}</span></div>
                    </div>

                    <div style={{ padding: 16 }}>
                        <div className="ui-rowSub">{data.summary || "요약 없음"}</div>

                        <div style={{ marginTop: 14 }}>
                            <div style={{ fontWeight: 800, marginBottom: 6 }}>파일</div>

                            <div className="ui-rowSub">
                                <b>RESUME</b>{" "}
                                <a href={`/api/files/${data.resumeFile.fileId}/download`} className="ui-link">
                                    {data.resumeFile.originalName}
                                </a>
                            </div>

                            <div className="ui-rowSub" style={{ marginTop: 6 }}>
                                <b>PORTFOLIO</b>{" "}
                                {data.portfolioFile ? (
                                    <a href={`/api/files/${data.portfolioFile.fileId}/download`} className="ui-link">
                                        {data.portfolioFile.originalName}
                                    </a>
                                ) : (
                                    <span className="ui-rowSubMuted">없음</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}