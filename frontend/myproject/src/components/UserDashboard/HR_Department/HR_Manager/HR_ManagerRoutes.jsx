import { Route } from "react-router-dom";
import HR_ManagerDashboard from "./HR_ManagerDashboard";
import HR_Training from "./HR_Training";
import HR_WorkLink from "./HR_WorkLInk";
import HR_WorkIconList from "./HR_WorkIconList";

import LoanVideoList from "./LoanVideoList";
import ProfileList from "./ProfileList";
import SeminarsList from "./SeminarsList";
import PolicyList from "./PolicyList";
import OffersList from "./OffersList";
import NewsList from "./NewsList";
import PolicyImagesList from "./PolicyImagesList";


const HR_ManagerRoutes = () => {
  return (
    <>
      <Route path="/hr/manager/dashboard" element={<HR_ManagerDashboard />} />
      <Route path="/hr/manager/training" element={<HR_Training />} />
      <Route path="/hr/manager/loan-video-list" element={<LoanVideoList />} />
      <Route path="/hr/manager/profile-list" element={<ProfileList />} />
      <Route path="/hr/manager/seminars-list" element={<SeminarsList />} />
      <Route path="/hr/manager/policy-list" element={<PolicyList />} />
      <Route path="/hr/manager/offers-list" element={<OffersList />} />
      <Route path="/hr/manager/news-list" element={<NewsList />} />
      <Route path="/hr/manager/policy-images-list" element={<PolicyImagesList />} />
      <Route path="/hr/manager/work-links" element={<HR_WorkLink />} />
      <Route path="/hr/manager/work-icon-links" element={<HR_WorkIconList />} />
      {/* Add other HR Manager routes here as needed */}
    </>
  );
};

export default HR_ManagerRoutes;