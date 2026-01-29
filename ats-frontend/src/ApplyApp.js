import React from "react";
import ApplyJobPostingsList from "./pages/apply/ApplyJobPostingsList";
import ApplyJobPostingDetail from "./pages/apply/ApplyJobPostingDetail";
import ApplyResumeCreate from "./pages/apply/ApplyResumeCreate";
import ApplyResumeList from "./pages/apply/ApplyResumeList";
import ApplyApplicationDetail from "./pages/apply/ApplyApplicationDetail";
import ApplyResumeEdit from "./pages/apply/ApplyResumeEdit";
import ApplyResumeDetail from "./pages/apply/ApplyResumeDetail";
import ApplyMyApplications from "./pages/apply/ApplyMyApplications";
import ApplyLayout from "./layout/ApplyLayout"

function ApplyApp() {
    const params = new URLSearchParams(window.location.search);
    const hasJobPostingId = params.has("jobPostingId");
    const hasResumeCreate = params.has("resumeCreate");
    const hasResumeList = params.has("resumeList");
    const hasApplicationId = params.has("applicationId");
    const hasResumeEdit = params.has("resumeEdit"); // ?resumeEdit=1&resumeId=xx
    const hasMyApplications = params.has("myApplications");
    const hasResumeIdOnly = params.has("resumeId") && !params.has("jobPostingId");
    let page = <ApplyJobPostingsList />;

    if (hasResumeCreate) page = <ApplyResumeCreate />;
    else if (hasResumeList) page = <ApplyResumeList />;
    else if (hasResumeEdit) page = <ApplyResumeEdit />;
    else if (hasResumeIdOnly) page = <ApplyResumeDetail />;
    else if (hasApplicationId) page = <ApplyApplicationDetail />;
    else if (hasMyApplications) page = <ApplyMyApplications />;
    else if (hasJobPostingId) page = <ApplyJobPostingDetail />;

    return <ApplyLayout>{page}</ApplyLayout>;
}

export default ApplyApp;