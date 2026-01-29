import React from "react";

export default function AppLayout({ children }) {
    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: 240,
                    borderRight: "1px solid #eee",
                    padding: 16,
                    background: "#fafafa",
                }}
            >
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>ATS</div>

                <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <SideLink label="채용공고" href="/?jobPostingId=21" />
                    <SideLink label="지원서 관리" href="/?applications=1" />

                </nav>

                <div style={{ marginTop: 24, fontSize: 12, color: "#666" }}>
                    * 링크는 임시(쿼리스트링 기반)
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Topbar */}
                <header
                    style={{
                        height: 56,
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 16px",
                        background: "white",
                    }}
                >
                    <div style={{ fontWeight: 700 }}>Recruiting</div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input
                            placeholder="검색(모양만)..."
                            style={{
                                width: 260,
                                padding: "8px 10px",
                                border: "1px solid #ddd",
                                borderRadius: 8,
                            }}
                        />
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "#eaeaea",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                            }}
                        >
                            U
                        </div>
                    </div>
                </header>

                {/* Content */}
                <section style={{ padding: 20, overflow: "auto" }}>{children}</section>
            </main>
        </div>
    );
}

function SideLink({ label, href }) {
    return (
        <a
            href={href}
            style={{
                padding: "10px 10px",
                borderRadius: 10,
                textDecoration: "none",
                color: "#111",
                border: "1px solid #eee",
                background: "white",
                fontWeight: 600,
            }}
        >
            {label}
        </a>
    );
}