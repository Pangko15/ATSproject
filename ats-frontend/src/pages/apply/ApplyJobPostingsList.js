import React from "react";

export default function ApplyJobPostingsList() {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const [q, setQ] = React.useState("");
    const [status, setStatus] = React.useState("ALL");

    React.useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await fetch("/api/job-postings?page=0&size=50");
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }

                const data = await res.json();
                setItems(data.content || []);
            } catch (e) {
                setError(e.message || "목록 조회 실패");
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, []);

    const filtered = React.useMemo(() => {
        const keyword = q.trim().toLowerCase();

        return items.filter((jp) => {
            const id = jp.jobPostingId ?? jp.id;
            const title = (jp.title || "").toLowerCase();
            const desc = (jp.description || "").toLowerCase();
            const st = (jp.status || "").toUpperCase();

            const matchKeyword =
                !keyword ||
                title.includes(keyword) ||
                desc.includes(keyword) ||
                String(id).includes(keyword);

            const matchStatus = status === "ALL" ? true : st === status;

            return matchKeyword && matchStatus;
        });
    }, [items, q, status]);

    const openDetail = (id) => {
        window.location.href = `/apply?jobPostingId=${id}`;
    };

    return (
        <div className="page">
            <div className="ui-pageHeader">
                <div>
                    <div className="ui-pageTitle">채용공고</div>
                    <div className="muted">지원 가능한 공고 목록입니다.</div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                        className="input"
                        placeholder="검색(공고ID/제목/설명)..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ width: 320 }}
                    />
                    <select
                        className="select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ width: 140 }}
                    >
                        <option value="ALL">전체</option>
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSED">CLOSED</option>
                    </select>
                </div>
            </div>

            {loading && <div className="card">불러오는 중...</div>}
            {error && <div className="card error">❌ {error}</div>}

            {!loading && !error && (
                <div className="card">
                    <div className="cardTitle">공고 리스트</div>

                    {filtered.length === 0 ? (
                        <div className="muted">조건에 맞는 공고가 없습니다.</div>
                    ) : (
                        <div className="tableWrap">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th style={{ width: 120 }}>공고ID</th>
                                    <th>공고</th>
                                    <th style={{ width: 140 }}>상태</th>
                                    <th style={{ width: 160 }}>마감일</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((jp) => {
                                    const id = jp.jobPostingId ?? jp.id;
                                    const st = (jp.status || "OPEN").toUpperCase();
                                    const deadline = jp.deadline ? String(jp.deadline).slice(0, 10) : "-";

                                    return (
                                        <tr
                                            key={id}
                                            className="rowLink"
                                            onClick={() => openDetail(id)}
                                            title="클릭해서 상세 보기"
                                        >
                                            <td style={{ fontWeight: 900 }}>{id}</td>
                                            <td>
                                                <div style={{ fontWeight: 900 }}>{jp.title}</div>
                                                <div className="muted" style={{ marginTop: 4, maxWidth: 720 }}>
                                                    {(jp.description || "설명 없음").slice(0, 120)}
                                                    {(jp.description || "").length > 120 ? "..." : ""}
                                                </div>
                                            </td>
                                            <td>
                          <span className={`badge ${st === "OPEN" ? "bGreen" : "bGray"}`}>
                            {st}
                          </span>
                                            </td>
                                            <td className="muted">{deadline}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}