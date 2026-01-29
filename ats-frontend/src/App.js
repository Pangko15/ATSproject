import React from "react";
import ApplicationDetail from "./pages/ApplicationDetail";
import JobPostingDetail from "./pages/JobPostingDetail";
import AppLayout from "./layout/AppLayout";
import AdminApplicationsList from "./pages/AdminApplicationsList";


function App() {
    const params = new URLSearchParams(window.location.search);

    const hasJobPostingId = params.has("jobPostingId");
    const hasApplicationId = params.has("applicationId");
    const hasApplications = params.has("applications");


    let page = (
        <div>
            채용 관리자 페이지
        </div>
    );

    if (hasJobPostingId) page = <JobPostingDetail />;
    else if (hasApplicationId) page = <ApplicationDetail />;
    else if (hasApplications) page = <AdminApplicationsList />;


    return <AppLayout>{page}</AppLayout>;
}

export default App;