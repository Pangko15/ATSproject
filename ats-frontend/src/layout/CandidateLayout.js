import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function CandidateLayout() {
    return (
        <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
            <div
                style={{
                    height: 64,
                    background: "#fff",
                    borderBottom: "1px solid #eaecf0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                }}
            >
                <b>
                    <Link to="/apply" style={{ textDecoration: "none", color: "#111827" }}>
                        Careers
                    </Link>
                </b>
                <div style={{ color: "#667085", fontSize: 13 }}>지원자 포털</div>
            </div>

            <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px" }}>
                <Outlet />
            </div>
        </div>
    );
}