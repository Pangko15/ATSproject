import React from "react";

export default function ApplyResumeList() {
    const candidateId = 1; // TODO 로그인 붙이면 교체

    const [list, setList] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        (async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/resumes/candidates/${candidateId}`);
                const text = await res.text();
                if (!res.ok) throw new Error(text);

                const data = JSON.parse(text);
                setList(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e.message || "조회 실패");
            } finally {
                setLoading(false);
            }
        })();
    }, [candidateId]);

    return (
        <div className="page">
            <div className="ui-pageHeader">
                <div>
                    <h1 className="ui-title">내 이력서</h1>
                    <div className="ui-subtitle">지원에 사용할 이력서를 관리합니다.</div>
                </div>

                <div className="ui-actions">
                    <button className="ui-btn ui-btnPrimary" onClick={() => (window.location.href = "/apply?resumeCreate=1")}>
                        + 새 이력서 작성
                    </button>
                </div>
            </div>

            {loading && <div className="ui-toast">불러오는 중...</div>}
            {error && <div className="ui-toast ui-toastErr">❌ {error}</div>}

            {!loading && !error && (
                <div className="ui-card">
                    <div className="ui-cardHeader">
                        <div className="ui-cardTitle">이력서 리스트</div>
                        <div className="ui-cardMeta">총 {list.length}건</div>
                    </div>

                    {list.length === 0 ? (
                        <div className="ui-cardBody">
                            <div className="muted">등록된 이력서가 없습니다. “새 이력서 작성”으로 먼저 등록해 주세요.</div>
                        </div>
                    ) : (
                        <div className="ui-cardBody">
                            <div className="tableWrap">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th style={{ width: 110 }}>이력서ID</th>
                                        <th>제목</th>
                                        <th style={{ width: 140 }}>관리</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {list.map((r) => (
                                        <tr key={r.resumeId}>
                                            <td style={{ fontWeight: 900 }}>{r.resumeId}</td>
                                            <td>
                                                <div style={{ fontWeight: 900 }}>{r.title}</div>
                                                <div className="muted" style={{ marginTop: 6 }}>
                                                    {r.summary ? r.summary : "요약 없음"}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className="ui-btn ui-btnGhost"
                                                    onClick={() => (window.location.href = `/apply?resumeId=${r.resumeId}`)}
                                                >
                                                    보기
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="muted" style={{ marginTop: 10 }}>
                                * 삭제는 상세/수정 화면에서 처리하는 흐름으로 유지하면 UX가 깔끔함
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
