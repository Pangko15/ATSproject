import React from "react";

export default function PageShell({ title, subtitle, children, right }) {
    return (
        <div style={{ maxWidth: 1000 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{title}</div>
                    {subtitle && <div style={{ marginTop: 6, color: "#666" }}>{subtitle}</div>}
                </div>
                {right && <div>{right}</div>}
            </div>

            <div
                style={{
                    marginTop: 16,
                    border: "1px solid #eee",
                    borderRadius: 12,
                    background: "white",
                    padding: 16,
                }}
            >
                {children}
            </div>
        </div>
    );
}