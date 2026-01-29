import React from "react";

/** 수정 화면에서도 create 화면과 같은 템플릿을 써야 "sectionKey -> fields" 매칭이 됨 */
const templateSections = [
    {
        id: "career",
        title: "경력사항",
        desc: "지원자 경력에 대한 정보",
        fields: [
            { id: "company", label: "회사명", type: "TEXT", required: true, placeholder: "예) (주)ATS" },
            { id: "role", label: "직무/역할", type: "TEXT", required: true, placeholder: "예) 백엔드 개발" },
            { id: "period", label: "재직기간", type: "TEXT", required: false, placeholder: "예) 2023.01 ~ 2024.12" },
            { id: "desc", label: "업무내용", type: "TEXTAREA", required: false, placeholder: "담당 업무/성과를 적어주세요." },
        ],
    },
    {
        id: "edu",
        title: "학력사항",
        desc: "지원자 학력에 대한 정보",
        fields: [
            { id: "school", label: "학교명", type: "TEXT", required: true, placeholder: "예) 대진대학교" },
            { id: "major", label: "전공", type: "TEXT", required: false, placeholder: "예) 전기공학" },
            { id: "grad", label: "졸업(예정)일", type: "DATE", required: false },
        ],
    },
    {
        id: "cert",
        title: "자격증/수상",
        desc: "자격증 또는 수상 정보",
        fields: [
            { id: "name", label: "자격증/수상명", type: "TEXT", required: true, placeholder: "예) 정보처리기사" },
            { id: "org", label: "발급기관", type: "TEXT", required: false, placeholder: "예) 한국산업인력공단" },
            { id: "date", label: "취득일", type: "DATE", required: false },
        ],
    },
];

function FieldInput({ field, value, onChange }) {
    if (field.type === "TEXTAREA") {
        return (
            <textarea
                className="ui-textarea"
                rows={5}
                placeholder={field.placeholder || ""}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (field.type === "DATE") {
        return (
            <input
                className="ui-input"
                type="date"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    return (
        <input
            className="ui-input"
            type="text"
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

export default function ApplyResumeEdit() {
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get("resumeId");
    const candidateId = 1; // TODO 로그인 붙이면 교체

    // 기본 정보
    const [title, setTitle] = React.useState("");
    const [summary, setSummary] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [resumeDetail, setResumeDetail] = React.useState(null);

    // 섹션(블록)
    const [blocks, setBlocks] = React.useState([]); // [{blockId, sectionKey, title, sortOrder, values:[{fieldKey,valueText}]}]
    const [answers, setAnswers] = React.useState({}); // key: `${blockId}.${fieldKey}` -> value

    // UI 상태
    const [saving, setSaving] = React.useState(false);
    const [saveMsg, setSaveMsg] = React.useState("");
    const [saveErr, setSaveErr] = React.useState("");
    const [deleting, setDeleting] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    // 파일 교체
    const [newResumeFile, setNewResumeFile] = React.useState(null);
    const [replacing, setReplacing] = React.useState(false);

    /** 블록 로드 */
    const loadBlocks = React.useCallback(async () => {
        if (!resumeId) return;

        const res = await fetch(`/api/resumes/${resumeId}/blocks`);
        const text = await res.text();
        if (!res.ok) throw new Error(text || "블록 조회 실패");

        const list = JSON.parse(text); // ResumeBlockWithValuesResponse[]
        setBlocks(list);

        // answers 초기화 (DB 값 -> 폼 값)
        const next = {};
        for (const b of list) {
            for (const v of (b.values || [])) {
                next[`${b.blockId}.${v.fieldKey}`] = v.valueText || "";
            }
        }
        setAnswers(next);
    }, [resumeId]);

    /** 기본 정보 + 파일 로드 */
    const loadDetail = React.useCallback(async () => {
        if (!resumeId) return;
        const res = await fetch(`/api/resumes/${resumeId}`);
        const text = await res.text();
        if (!res.ok) throw new Error(text || "상세 조회 실패");

        const data = JSON.parse(text);
        setResumeDetail(data);
        setTitle(data.title || "");
        setSummary(data.summary || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
    }, [resumeId]);

    /** 최초 로드: detail + blocks 둘 다 */
    const load = React.useCallback(async () => {
        if (!resumeId) return;
        setMsg("");
        try {
            await Promise.all([loadDetail(), loadBlocks()]);
        } catch (e) {
            setMsg(`❌ ${e.message}`);
        }
    }, [resumeId, loadDetail, loadBlocks]);

    React.useEffect(() => {
        load();
    }, [load]);

    /** answers helpers */
    const setAnswer = (blockId, fieldKey, value) => {
        const k = `${blockId}.${fieldKey}`;
        setAnswers((prev) => ({ ...prev, [k]: value }));
    };
    const getAnswer = (blockId, fieldKey) => {
        const k = `${blockId}.${fieldKey}`;
        return answers[k] || "";
    };

    /** 섹션 추가(수정 화면에서도 가능) */
    const addSection = async (section) => {
        setMsg("");
        try {
            const res = await fetch(`/api/resumes/${resumeId}/blocks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sectionKey: section.id, title: section.title }),
            });
            const text = await res.text();
            if (!res.ok) throw new Error(text || "블록 추가 실패");

            const created = JSON.parse(text); // { blockId, sortOrder }
            const newBlock = {
                blockId: created.blockId,
                sectionKey: section.id,
                title: section.title,
                sortOrder: created.sortOrder,
                values: [],
            };

            setBlocks((prev) => [...prev, newBlock]);
        } catch (e) {
            setMsg(`❌ ${e.message}`);
        }
    };

    /** 섹션 삭제 */
    const deleteBlock = async (blockId) => {
        const ok = window.confirm("이 섹션을 삭제할까요?");
        if (!ok) return;

        setMsg("");
        try {
            const res = await fetch(`/api/resumes/${resumeId}/blocks/${blockId}`, { method: "DELETE" });
            const text = await res.text();
            if (!res.ok) throw new Error(text || "블록 삭제 실패");

            // UI에서도 제거
            setBlocks((prev) => prev.filter((b) => b.blockId !== blockId));
            setAnswers((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((k) => {
                    if (k.startsWith(`${blockId}.`)) delete next[k];
                });
                return next;
            });

            setMsg("✅ 섹션이 삭제되었습니다.");
        } catch (e) {
            setMsg(`❌ ${e.message}`);
        }
    };

    /** 저장: 기본정보 PATCH + 블록 값 PUT(블록별) */
    const onSave = async () => {
        setMsg("");
        setSaveMsg("");
        setSaveErr("");

        if (!title.trim()) {
            setSaveErr("제목은 필수입니다.");
            window.setTimeout(() => setSaveErr(""), 2500);
            return;
        }

        setSaving(true);
        try {
            // 1) 기본 정보 저장 (너 백엔드는 title/summary/email/phone 받음)
            {
                const res = await fetch(`/api/resumes/${resumeId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        candidateId,
                        title: title.trim(),
                        summary: summary.trim() || null,
                        email: email.trim() || null,
                        phone: phone.trim() || null,
                    }),
                });
                const text = await res.text();
                if (!res.ok) throw new Error(text || "기본 정보 저장 실패");
            }

            // 2) 블록 값 저장 (블록별 upsert)
            //    answers에서 blockId별로 묶어서 { fieldKey: valueText } 형태로 PUT
            for (const b of blocks) {
                const valuesMap = {};
                const t = templateSections.find((x) => x.id === b.sectionKey);
                const fields = t?.fields || [];

                for (const f of fields) {
                    const v = getAnswer(b.blockId, f.id);
                    // Service 정책이 "빈 값이면 삭제"니까, 그냥 그대로 보내도 됨.
                    // 다만 undefined 방지
                    valuesMap[f.id] = (v ?? "");
                }

                const res = await fetch(`/api/resumes/${resumeId}/blocks/${b.blockId}/values`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ values: valuesMap }),
                });
                const text = await res.text();
                if (!res.ok) throw new Error(text || `블록 값 저장 실패 (blockId=${b.blockId})`);
            }

            setSaveMsg("✅ 저장되었습니다.");
            window.setTimeout(() => setSaveMsg(""), 2500);

            // 최신 데이터로 재로딩(선택이지만 추천)
            await load();
        } catch (e) {
            setSaveErr(e.message || "저장 실패");
            window.setTimeout(() => setSaveErr(""), 4000);
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        const ok = window.confirm("정말 이 이력서를 삭제할까요?\n연결된 지원서도 함께 삭제될 수 있습니다.");
        if (!ok) return;

        setMsg("");
        setDeleting(true);
        try {
            const res = await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
            const text = await res.text();
            if (!res.ok) throw new Error(text || "삭제 실패");

            window.location.href = "/apply?resumeList=1";
        } catch (e) {
            setMsg(`❌ ${e.message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="apply-page">
            {/* 헤더 */}
            <div className="ui-pageHeader">
                {saveMsg && <div className="ui-toast ui-toastOk">{saveMsg}</div>}
                {saveErr && <div className="ui-toast ui-toastErr">❌ {saveErr}</div>}
                <div>
                    <h1 className="ui-title">이력서 수정</h1>
                    <div className="ui-subtitle">기본 정보/섹션/파일을 업데이트하세요.</div>
                    <div className="ui-cardMeta" style={{ marginTop: 8 }}>
                        resumeId: <span className="ui-mono">{resumeId}</span>
                    </div>
                </div>

                <div className="ui-actions">
                    <button className="ui-btn ui-btnGhost" onClick={() => (window.location.href = `/apply?resumeId=${resumeId}`)}>
                        상세 보기
                    </button>
                    <button className="ui-btn ui-btnPrimary" onClick={onSave} disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </button>
                    <button className="ui-btn ui-btnDanger" onClick={onDelete} disabled={deleting}>
                        {deleting ? "삭제 중..." : "삭제"}
                    </button>
                </div>
            </div>

            {/* 메시지 배너 */}
            {msg && <div className={msg.startsWith("✅") ? "ui-toast ui-toastOk" : "ui-toast ui-toastErr"}>{msg}</div>}

            {/* 본문: 2컬럼 카드 */}
            <div className="ui-grid2">
                {/* 좌측: 기본 정보 + 섹션 */}
                <div className="ui-card">
                    <div className="ui-cardHeader">
                        <div className="ui-cardTitle">기본 정보</div>
                        <div className="ui-cardMeta">지원 시 노출되는 정보</div>
                    </div>

                    <div className="ui-form">
                        <div className="ui-field">
                            <label className="ui-label">이메일</label>
                            <input
                                className="ui-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@domain.com"
                            />
                        </div>

                        <div className="ui-field">
                            <label className="ui-label">연락처</label>
                            <input
                                className="ui-input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="010-1234-5678"
                            />
                        </div>

                        <div className="ui-field">
                            <label className="ui-label">제목</label>
                            <input
                                className="ui-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예) 백엔드 신입 이력서"
                            />
                            <div className="ui-help">채용 담당자가 가장 먼저 보는 제목입니다.</div>
                        </div>

                        <div className="ui-field">
                            <label className="ui-label">요약</label>
                            <textarea
                                className="ui-textarea"
                                rows={6}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="예) Spring Boot / Oracle 기반 프로젝트 경험..."
                            />
                            <div className="ui-help">간단한 자기소개/핵심 경험을 2~3줄로 적어주세요.</div>
                        </div>
                    </div>

                    {/* ✅ 섹션(블록) 영역 */}
                    <div style={{ marginTop: 18 }}>
                        <div className="ui-cardHeader" style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <div className="ui-cardTitle">추가 섹션</div>
                            <div className="ui-cardMeta">생성 때 추가한 섹션을 수정할 수 있습니다.</div>
                        </div>

                        {/* 섹션 추가 버튼들(원하면 제거 가능) */}
                        <div className="ui-inline" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                            {templateSections.map((s) => (
                                <button
                                    key={s.id}
                                    className="ui-btn ui-btnGhost"
                                    type="button"
                                    onClick={() => addSection(s)}
                                >
                                    + {s.title}
                                </button>
                            ))}
                        </div>

                        {blocks.length === 0 ? (
                            <div className="ui-empty">추가된 섹션이 없습니다.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {blocks.map((b) => {
                                    const t = templateSections.find((x) => x.id === b.sectionKey);
                                    const fields = t?.fields || [];
                                    const desc = t?.desc || "";

                                    return (
                                        <div key={b.blockId} className="ui-card" style={{ padding: 14 }}>
                                            <div className="ui-cardHeader" style={{ padding: 0, marginBottom: 12 }}>
                                                <div>
                                                    <div className="ui-cardTitle">{b.title}</div>
                                                    {desc && <div className="ui-cardMeta">{desc}</div>}
                                                    <div className="ui-metaLine" style={{ marginTop: 6 }}>
                                                        blockId: <span className="ui-mono">{b.blockId}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    className="ui-btn ui-btnDanger"
                                                    type="button"
                                                    onClick={() => deleteBlock(b.blockId)}
                                                >
                                                    섹션 삭제
                                                </button>
                                            </div>

                                            {fields.length === 0 ? (
                                                <div className="ui-empty">
                                                    ⚠️ templateSections에 없는 sectionKey 입니다: <b>{b.sectionKey}</b>
                                                </div>
                                            ) : (
                                                <div className="ui-form">
                                                    {fields.map((f) => (
                                                        <div className="ui-field" key={f.id}>
                                                            <label className="ui-label">
                                                                {f.label} {f.required ? "*" : ""}
                                                            </label>
                                                            <FieldInput
                                                                field={f}
                                                                value={getAnswer(b.blockId, f.id)}
                                                                onChange={(v) => setAnswer(b.blockId, f.id, v)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 우측: 파일/상태 */}
                <div className="ui-card">
                    <div className="ui-cardHeader">
                        <div className="ui-cardTitle">첨부 파일</div>
                        <div className="ui-cardMeta">다운로드 링크</div>
                    </div>

                    {!resumeDetail ? (
                        <div className="ui-empty">파일 정보를 불러오는 중...</div>
                    ) : (
                        <div className="ui-fileList">
                            <div className="ui-fileRow">
                                <div className="ui-fileLabel">RESUME</div>
                                <div className="ui-fileValue">
                                    <a className="ui-link" href={`/api/files/${resumeDetail.resumeFile.fileId}/download`}>
                                        {resumeDetail.resumeFile.originalName}
                                    </a>
                                    <div className="ui-rowSub ui-rowSubMuted">
                                        {resumeDetail.resumeFile.mimeType} · {formatBytes(resumeDetail.resumeFile.fileSize)}
                                    </div>

                                    {/* 교체 UI */}
                                    <div className="ui-inline" style={{ marginTop: 10 }}>
                                        <input
                                            type="file"
                                            onChange={(e) => setNewResumeFile(e.target.files?.[0] || null)}
                                        />
                                        <button
                                            className="ui-btn ui-btnGhost"
                                            disabled={!newResumeFile || replacing}
                                            onClick={async () => {
                                                setMsg("");
                                                setReplacing(true);
                                                try {
                                                    // 1) 새 파일 업로드
                                                    const fd = new FormData();
                                                    fd.append("file", newResumeFile);
                                                    fd.append("candidateId", String(candidateId));

                                                    const up = await fetch("/api/files/upload-file", { method: "POST", body: fd });
                                                    const upText = await up.text();
                                                    if (!up.ok) throw new Error(`파일 업로드 실패: ${upText}`);
                                                    const newFileId = Number(upText);
                                                    if (!newFileId) throw new Error("업로드 응답 fileId 파싱 실패");

                                                    // 2) RESUME 링크 교체
                                                    const rep = await fetch(`/api/resumes/${resumeId}/resume-file`, {
                                                        method: "PUT",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ resumeFileId: newFileId }),
                                                    });
                                                    const repText = await rep.text();
                                                    if (!rep.ok) throw new Error(`교체 실패: ${repText}`);

                                                    setMsg("✅ 이력서 파일이 교체되었습니다.");
                                                    setNewResumeFile(null);

                                                    await load(); // 상세 다시 로드해서 링크 갱신
                                                } catch (e) {
                                                    setMsg(`❌ ${e.message}`);
                                                } finally {
                                                    setReplacing(false);
                                                }
                                            }}
                                        >
                                            {replacing ? "교체 중..." : "파일 교체"}
                                        </button>
                                    </div>

                                    <div className="ui-help" style={{ marginTop: 8 }}>
                                        * pdf/doc/docx만 가능
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 디버그(필요하면 삭제) */}
            {/* <pre>{JSON.stringify({ blocks, answers }, null, 2)}</pre> */}
        </div>
    );
}

/** util */
function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "-";
    const units = ["B", "KB", "MB", "GB"];
    let v = Number(bytes);
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }
    return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}