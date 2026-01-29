import React from "react";
import "../styles/ui.css";
import "./apply.css";

export default function ApplyLayout({ children }) {


    return (
        <div className="ui-page">
            <div className="apply-shell">
                {/* Sidebar */}
                <aside className="apply-side ui-card">
                    <div className="apply-sideHead">
                        <div className="apply-sideBrand">Careers</div>
                    </div>

                    <nav className="apply-nav">
                        <a className="apply-navItem" href="/apply?jobPostings=1">
                            채용공고
                        </a>
                        <a className="apply-navItem" href="/apply?resumeList=1">
                            내 이력서
                        </a>
                        <a className="apply-navItem" href="/apply?resumeCreate=1">
                            이력서 작성
                        </a>
                        <a className="apply-navItem" href="/apply?myApplications=1">
                            내 지원 목록
                        </a>
                    </nav>

                    <div className="apply-sideFoot">* 지원자 포털</div>
                </aside>

                {/* Main */}
                <main className="apply-main">
                    {/* Topbar */}
                    <div className="apply-topbar ui-card">
                        <div>
                            <div className="apply-topTitle">Applicant Portal</div>
                            <div className="muted">지원자 전용 페이지</div>
                        </div>

                        <div className="apply-topRight">
                            <input className="ui-input apply-search" placeholder="검색(모양만)..." />
                            <div className="apply-avatar">U</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="ui-container">{children}</div>
                </main>
            </div>
        </div>
    );
}
