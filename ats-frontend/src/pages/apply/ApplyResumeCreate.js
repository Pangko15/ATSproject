import React from "react";

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
    const common = {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        outline: "none",
        fontSize: 14,
        background: "#fff",
    };

    if (field.type === "TEXTAREA") {
        return (
            <textarea
                style={{ ...common, minHeight: 110, resize: "vertical" }}
                placeholder={field.placeholder || ""}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (field.type === "DATE") {
        return <input style={common} type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    }

    return (
        <input
            style={common}
            type="text"
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

// ✅ 아주 가벼운 검증(프론트 단계)
function isValidEmail(v) {
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isValidPhone(v) {
    if (!v) return false;
    const t = v.trim();
    return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(t);
}

/** 생성 전 임시 섹션 id */
function makeTempId(sectionKey) {
    return `${sectionKey}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ApplyResumeCreate() {
    // ✅ params는 1번만!
    const params = new URLSearchParams(window.location.search);
    const jobPostingId = params.get("jobPostingId");
    const resumeId = params.get("resumeId"); // string | null
    const resumeIdOk = !!resumeId && resumeId !== "null";

    const candidateId = 1; // TODO 로그인 붙이면 교체

    // ✅ 고정 필수 입력
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");

    const [title, setTitle] = React.useState("");
    const [summary, setSummary] = React.useState("");
    const [resumeFile, setResumeFile] = React.useState(null);

    /**
     * 섹션은 “이력서 생성 전에도” 화면에 쌓이게 한다.
     * - 생성 전: tempId 기준으로 answers를 관리
     * - 생성 후: newResumeId 얻고 서버에 blocks 생성 + (있으면) values 저장
     */
    const [addedSections, setAddedSections] = React.useState([]); // {tempId, sectionKey, title, fields}
    const [answers, setAnswers] = React.useState({}); // key: `${tempId}.${fieldId}`

    const [loading, setLoading] = React.useState(false);
    const [msg, setMsg] = React.useState("");

    /** ✅ 생성 전에도 섹션 추가 가능 (로컬에만 쌓기) */
    const addSection = (section) => {
        const tempId = makeTempId(section.id);

        setAddedSections((prev) => [
            ...prev,
            {
                tempId,
                sectionKey: section.id,
                title: section.title,
                fields: section.fields,
            },
        ]);
    };

    const removeSectionInstance = async (blockId) => {
        // ✅ DB 삭제
        if (resumeIdOk) {
            const res = await fetch(`/api/resumes/${resumeId}/blocks/${blockId}`, { method: "DELETE" });
            if (!res.ok) {
                alert(await res.text());
                return;
            }
        }

        // ✅ UI 삭제
        setAddedSections((prev) => prev.filter((s) => s.blockId !== blockId));
        setAnswers((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((k) => {
                if (k.startsWith(`${blockId}.`)) delete next[k];
            });
            return next;
        });
    };

    const setAnswer = (tempId, fieldId, value) => {
        const key = `${tempId}.${fieldId}`;
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const getAnswer = (tempId, fieldId) => {
        const key = `${tempId}.${fieldId}`;
        return answers[key] || "";
    };

    /**
     * ✅ 서버에 블록 생성 + 값 저장
     * - POST /api/resumes/{resumeId}/blocks  -> {blockId, sortOrder}
     * - (선택) PUT /api/resumes/{resumeId}/blocks/{blockId}/values  -> { values: {...} }
     *
     * values API가 아직 없으면, 아래 "values 저장" 부분을 주석 처리하면 된다.
     */
    const persistSectionsAfterCreate = async (newResumeId) => {
        for (const sec of addedSections) {
            // 1) 블록 생성
            const res = await fetch(`/api/resumes/${newResumeId}/blocks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sectionKey: sec.sectionKey,
                    title: sec.title,
                }),
            });

            if (!res.ok) throw new Error(await res.text());

            const { blockId } = await res.json();

            // 2) (선택) 값 저장: tempId 기반 answers -> values로 변환
            const values = {};
            for (const f of sec.fields) {
                const v = answers[`${sec.tempId}.${f.id}`];
                if (v != null && String(v).trim() !== "") values[f.id] = String(v);
            }

            // 값이 있을 때만 저장 호출
            if (Object.keys(values).length > 0) {
                // ✅ values 저장 API가 준비되어 있을 때만 사용
                const vr = await fetch(`/api/resumes/${newResumeId}/blocks/${blockId}/values`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ values }),
                });

                if (!vr.ok) throw new Error(await vr.text());
            }
        }
    };

    const createResume = async () => {
        setMsg("");

        // ✅ 고정 필수값 검증
        if (!email.trim()) return setMsg("이메일을 입력하세요.");
        if (!isValidEmail(email)) return setMsg("이메일 형식이 올바르지 않습니다.");
        if (!phone.trim()) return setMsg("연락처를 입력하세요.");
        if (!isValidPhone(phone)) return setMsg("연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)");

        if (!title.trim()) return setMsg("제목을 입력하세요.");
        if (!resumeFile) return setMsg("이력서 파일(PDF 등)을 선택하세요. (필수)");

        setLoading(true);

        try {
            // 1) 파일 업로드
            const fd = new FormData();
            fd.append("file", resumeFile);
            fd.append("candidateId", String(candidateId));

            const uploadRes = await fetch("/api/files/upload-file", { method: "POST", body: fd });
            const uploadText = await uploadRes.text();
            if (!uploadRes.ok) throw new Error(`파일 업로드 실패: ${uploadText}`);

            const resumeFileId = Number(uploadText);
            if (!resumeFileId) throw new Error("업로드 응답 fileId 파싱 실패");

            // 2) 이력서 생성
            const createRes = await fetch("/api/resumes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    candidateId,
                    title: title.trim(),
                    summary: summary.trim() || null,
                    resumeFileId,
                    email: email.trim(),
                    phone: phone.trim(),
                }),
            });

            const createText = await createRes.text();
            if (!createRes.ok) throw new Error(`이력서 생성 실패: ${createText}`);

            const created = JSON.parse(createText);
            const newResumeId = created.resumeId;

            // 3) ✅ 생성과 동시에, 선택된 섹션들을 서버에 저장
            if (addedSections.length > 0) {
                await persistSectionsAfterCreate(newResumeId);
            }

            setMsg("✅ 이력서가 생성되었습니다.");

            // ✅ 이동: resumeId를 유지한 채로 이동
            if (jobPostingId) window.location.href = `/apply?jobPostingId=${jobPostingId}&resumeId=${newResumeId}`;
            else window.location.href = `/apply?resumeId=${newResumeId}`;
        } catch (e) {
            setMsg(`❌ ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: "100vh", background: "#f5f6f8", padding: 18, boxSizing: "border-box" }}>
            <div style={{ display: "flex", gap: 14, height: "100%" }}>
                {/* LEFT: 섹션 추가 */}
                <aside style={panel(280)}>
                    <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>항목 추가</div>

                    {/* ✅ 이제는 이력서 생성 전에도 섹션을 추가할 수 있으니 안내문 제거 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {templateSections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => addSection(s)}
                                style={{
                                    textAlign: "left",
                                    padding: "12px 12px",
                                    borderRadius: 12,
                                    border: "1px solid #e5e7eb",
                                    background: "#fff",
                                    cursor: "pointer",
                                }}
                                type="button"
                            >
                                <div style={{ fontWeight: 900 }}>{s.title}</div>
                                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.desc}</div>
                                <div style={{ marginTop: 8 }}>
                                    <span style={pill}>+ 추가</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* CENTER */}
                <main style={{ flex: 1, background: "#fff", borderRadius: 14, padding: 22, overflow: "auto" }}>
                    <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 6 }}>이력서 작성</div>
                    <div style={{ color: "#6b7280", marginBottom: 18 }}>지원 전에 이력서를 먼저 등록하세요.</div>

                    {/* ✅ 고정 입력 블록 */}
                    <section style={{ ...box, background: "#fff" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <div style={label}>이메일 *</div>
                                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@domain.com" style={inputBase} />
                                    {email && !isValidEmail(email) && (
                                        <div style={{ marginTop: 6, color: "#ef4444", fontSize: 12 }}>이메일 형식이 올바르지 않습니다.</div>
                                    )}
                                </div>

                                <div>
                                    <div style={label}>연락처 *</div>
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" style={inputBase} />
                                    {phone && !isValidPhone(phone) && (
                                        <div style={{ marginTop: 6, color: "#ef4444", fontSize: 12 }}>예) 010-1234-5678 / 01012345678</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div style={label}>제목 *</div>
                                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 백엔드 신입 이력서" style={inputBase} />
                            </div>

                            <div>
                                <div style={label}>요약(선택)</div>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="간단한 자기소개/핵심 경험 요약"
                                    rows={4}
                                    style={{ ...inputBase, minHeight: 110, resize: "vertical" }}
                                />
                            </div>

                            {/* (옵션) 지금 URL에 resumeId가 있으면 안내 */}
                            {resumeIdOk && (
                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                    현재 resumeId: <b>{resumeId}</b> (이력서 생성 후 추가한 섹션들은 저장됩니다)
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 추가된 섹션들 */}
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                        {addedSections.length === 0 ? (
                            <div style={{ color: "#6b7280", fontSize: 14 }}>왼쪽에서 항목을 눌러 섹션을 추가하세요. (예: 경력사항, 학력사항)</div>
                        ) : (
                            addedSections.map((sec) => {
                                const t = templateSections.find((x) => x.id === sec.sectionKey);
                                const desc = t?.desc || "";
                                return (
                                    <section key={sec.tempId} style={box}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                            <div style={{ fontWeight: 900, fontSize: 16 }}>{sec.title}</div>
                                            <div style={{ color: "#6b7280", fontSize: 12 }}>{desc}</div>
                                            <button type="button" onClick={() => removeSectionInstance(sec.tempId)} style={delBtn}>
                                                삭제
                                            </button>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                            {sec.fields.map((f) => (
                                                <div key={f.id}>
                                                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
                                                        <div style={{ fontWeight: 800 }}>{f.label}</div>
                                                        {f.required && <span style={{ color: "#ef4444", fontWeight: 900 }}>*</span>}
                                                    </div>
                                                    <FieldInput field={f} value={getAnswer(sec.tempId, f.id)} onChange={(v) => setAnswer(sec.tempId, f.id, v)} />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })
                        )}
                    </div>
                </main>

                {/* RIGHT */}
                <aside style={panel(320)}>
                    <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>이력서 파일</div>

                    <div style={{ marginBottom: 10 }}>
                        <div style={label}>이력서 파일 업로드(필수)</div>
                        <input type="file" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                        {resumeFile && (
                            <div style={{ marginTop: 8, fontSize: 13, color: "#374151" }}>
                                선택됨: <b>{resumeFile.name}</b>
                            </div>
                        )}
                    </div>

                    <button onClick={createResume} disabled={loading} style={primaryBtn}>
                        {loading ? "생성 중..." : "이력서 생성"}
                    </button>

                    <button
                        type="button"
                        onClick={() => console.log("TEMP sections", addedSections, "answers", answers, "email", email, "phone", phone, "resumeId", resumeId)}
                        style={{ ...ghostBtn, marginTop: 10 }}
                    >
                        임시저장(콘솔)
                    </button>

                    {msg && <div style={{ marginTop: 12 }}>{msg}</div>}

                    {/* (참고) 이미 resumeId가 있을 때 “추가 저장”을 따로 만들고 싶으면 여기서 버튼을 더 붙이면 됨 */}
                </aside>
            </div>
        </div>
    );
}

/** styles */
function panel(w) {
    return { width: w, background: "#fff", borderRadius: 14, padding: 14, overflow: "auto" };
}
const label = { fontWeight: 800, marginBottom: 6 };
const inputBase = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    outline: "none",
    fontSize: 14,
    background: "#fff",
};
const box = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    background: "#fafafa",
};
const primaryBtn = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
};
const ghostBtn = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
};
const delBtn = {
    marginLeft: "auto",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
};
const pill = {
    display: "inline-block",
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fafafa",
};
