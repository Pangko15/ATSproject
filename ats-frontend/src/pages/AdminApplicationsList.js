import React from "react";

export default function AdminApplicationsList() {
    const [list, setList] = React.useState([]);
    const [q, setQ] = React.useState("");
    const [status, setStatus] = React.useState("ALL");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch("/api/applications");
                const text = await res.text();
                if (!res.ok) throw new Error(text);
                setList(JSON.parse(text));
            } catch (e) {
                setError(e.message || "목록 조회 실패");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = list.filter((row) => {
        const okStatus = status === "ALL" ? true : row.status === status;
        const okQ =
            !q.trim()
                ? true
                : `${row.jobTitle} ${row.candidateId} ${row.applicationId}`
                    .toLowerCase()
                    .includes(q.toLowerCase());
        return okStatus && okQ;
    });

    const badge = (s) => {
        const map = {
            SUBMITTED: "badge badge-gray",
            REVIEWING: "badge badge-blue",
            PASSED: "badge badge-green",
            REJECTED: "badge badge-red",
            CANCELED: "badge badge-dark",
        };
        return map[s] || "badge badge-gray";
    };

    return (
        <div className="page">
            <div className="pageHeader">
                <div>
                    <h1 className="h1">지원서 관리</h1>
                    <div className="sub">최근 지원서부터 표시됩니다.</div>
                </div>

                <div className="toolbar">
                    <input
                        className="input"
                        placeholder="검색(공고/지원자ID/지원서ID)..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <select
                        className="select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ALL">전체</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="REVIEWING">REVIEWING</option>
                        <option value="PASSED">PASSED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CANCELED">CANCELED</option>
                    </select>
                </div>
            </div>

            {loading && <div className="card">불러오는 중...</div>}
            {error && <div className="card error">{error}</div>}

            {!loading && !error && (
                <div className="card">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>지원서ID</th>
                            <th>공고</th>
                            <th>지원자ID</th>
                            <th>이력서ID</th>
                            <th>상태</th>
                            <th>제출일</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((row) => (
                            <tr
                                key={row.applicationId}
                                className="rowHover"
                                onClick={() =>
                                    (window.location.href = `/?applicationId=${row.applicationId}`)
                                }
                                style={{ cursor: "pointer" }}
                            >
                                <td>{row.applicationId}</td>
                                <td>
                                    <div className="strong">{row.jobTitle}</div>
                                    <div className="muted">jobPostingId: {row.jobPostingId}</div>
                                </td>
                                <td>{row.candidateId}</td>
                                <td>{row.resumeId}</td>
                                <td>
                                    <span className={badge(row.status)}>{row.status}</span>
                                </td>
                                <td className="muted">
                                    {row.submittedAt ? row.submittedAt.replace("T", " ") : "-"}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="muted" style={{ padding: 16 }}>
                                    결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}