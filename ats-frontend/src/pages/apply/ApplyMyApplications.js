import React from "react";

export default function ApplyMyApplications() {
    const candidateId = 1; // TODO 로그인 붙으면 교체

    const [list, setList] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    // 검색/필터
    const [q, setQ] = React.useState("");
    const [status, setStatus] = React.useState("ALL");

    React.useEffect(() => {
        (async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/applications/candidates/${candidateId}`);
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

    const filtered = React.useMemo(() => {
        const keyword = q.trim().toLowerCase();

        return list.filter((a) => {
            const title = (a.jobTitle ?? a.jobPostingTitle ?? "").toLowerCase();
            const appId = String(a.applicationId ?? "");
            const jobId = String(a.jobPostingId ?? a.jobPosting?.id ?? "");
            const st = String(a.status ?? a.applicationStatus ?? "").toUpperCase();

            const matchKeyword =
                !keyword ||
                title.includes(keyword) ||
                appId.includes(keyword) ||
                jobId.includes(keyword);

            const matchStatus = status === "ALL" ? true : st === status;

            return matchKeyword && matchStatus;
        });
    }, [list, q, status]);

    const openDetail = (applicationId) => {
        // ✅ 지원자 포털에서 상세를 만들면 /apply?...로 바꾸면 됨
        // 지금은 관리자 상세(/?applicationId=) 재사용
        window.location.href = `/apply?applicationId=${applicationId}`;
    };

    return (
        <div className="page">
            <div className="pageHeader">
                <div>
                    <div className="pageTitle">내 지원 목록</div>

                    <div className="muted">내가 제출한 지원서가 표시됩니다.</div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                        className="input"
                        placeholder="검색(공고/지원서ID/공고ID)..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ width: 320 }}
                    />
                    <select
                        className="select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ width: 160 }}
                    >
                        <option value="ALL">전체</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="REVIEWING">REVIEWING</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="PASSED">PASSED</option>
                        <option value="CANCELED">CANCELED</option>
                    </select>
                </div>
            </div>

            {loading && <div className="card">불러오는 중...</div>}
            {error && <div className="card error">❌ {error}</div>}

            {!loading && !error && (
                <div className="card">
                    <div className="cardTitle">지원서 리스트</div>

                    {filtered.length === 0 ? (
                        <div className="muted">조건에 맞는 지원서가 없습니다.</div>
                    ) : (
                        <div className="tableWrap">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th style={{ width: 120 }}>지원서ID</th>
                                    <th>공고</th>
                                    <th style={{ width: 160 }}>상태</th>
                                    <th style={{ width: 220 }}>제출일</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((a) => {
                                    const applicationId = a.applicationId;
                                    const jobTitle = a.jobTitle ?? a.jobPostingTitle ?? "-";
                                    const jobPostingId =
                                        a.jobPostingId ?? a.jobPosting?.id ?? a.jobPosting?.jobPostingId ?? null;

                                    const st = String(a.status ?? a.applicationStatus ?? "-").toUpperCase();

                                    const submittedAt = a.submittedAt
                                        ? String(a.submittedAt).slice(0, 19).replace("T", " ")
                                        : "-";

                                    return (
                                        <tr
                                            key={applicationId}
                                            className="rowLink"
                                            onClick={() => openDetail(applicationId)}
                                            title="클릭해서 상세 보기"
                                        >
                                            <td style={{ fontWeight: 900 }}>{applicationId}</td>
                                            <td>
                                                <div style={{ fontWeight: 900 }}>{jobTitle}</div>
                                                <div className="muted" style={{ marginTop: 4 }}>
                                                    {jobPostingId ? `jobPostingId: ${jobPostingId}` : ""}
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge status={st} />
                                            </td>
                                            <td className="muted">{submittedAt}</td>
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

function StatusBadge({ status }) {
    // css는 badge + bGreen/bGray 정도만 있어도 충분
    // 상태별 느낌만 조금 다르게 주자
    if (status === "PASSED") return <span className="badge bGreen">PASSED</span>;
    if (status === "REJECTED") return <span className="badge bGray">REJECTED</span>;
    if (status === "REVIEWING") return <span className="badge bGray">REVIEWING</span>;
    if (status === "CANCELED") return <span className="badge bGray">CANCELED</span>;
    return <span className="badge bGray">{status || "-"}</span>;
}