
import { Route } from "react-router-dom";
import CBO_Dashboard from "./CBO_Dashboard";
import CBO_Emp_Info from "./MarketingCBO/CBO_Emp_Info";
import CBO_WorkLinks from "./CBO_WorkLInks/CBO_WorkLinks";
import CBO_WorkIconList from "./CBO_WorkLInks/CBO_WorkIconList";
import CBO_TeamWorklinks from "./CBO_WorkLInks/CBO_TeamWorklinks"
import CBO_Payout from "./CBO_PAYOUT/CBO_Payout";
import CBO_Dsa_Code from "./CBO_DSA-CODE/CBO_Dsa_Code";
import CBO_AddBank from "./CBO_BANKERS/CBO_AddBank";
import CBO_ListBank from "./CBO_BANKERS/CBO_ListBank";
import CBO_Training from "./CBO_TRAINING/CBO_Training";

import LoanVideoList from "./CBO_TRAINING/LoanVideoList";
import ProfileList from "./CBO_TRAINING/ProfileList";
import SeminarsList from "./CBO_TRAINING/SeminarsList";
import PolicyList from "./CBO_TRAINING/PolicyList";
import OffersList from "./CBO_TRAINING/OffersList";
import NewsList from "./CBO_TRAINING/NewsList";
import PolicyImagesList from "./CBO_TRAINING/PolicyImagesList";


const RBH_Routes = () => {
  return (
    <>
      <Route path="/marketing/cbo/dashboard" element={<CBO_Dashboard />} />
      <Route path="/marketing/cbo/empinfo" element={<CBO_Emp_Info />} />
      <Route path="/marketing/cbo/worklinks" element={<CBO_WorkLinks />} />
      <Route path="/marketing/cbo/work-icon-list" element={<CBO_WorkIconList/>} />
      <Route path="/marketing/cbo/teamworklinks" element={<CBO_TeamWorklinks/>} />
      <Route path="/marketing/cbo/payout" element={<CBO_Payout/>} />
      <Route path="/marketing/cbo/dsacode" element={<CBO_Dsa_Code/>} />
      <Route path="/marketing/cbo/addbank" element={<CBO_AddBank/>} />
      <Route path="/marketing/cbo/listbank" element={<CBO_ListBank/>} />
      <Route path="/marketing/cbo/training/dashboard" element={<CBO_Training/>} />
      <Route path="/marketing/cbo/loan-video-list" element={<LoanVideoList/>} />
      <Route path="/marketing/cbo/profile-list" element={<ProfileList/>} />
      <Route path="/marketing/cbo/seminars-list" element={<SeminarsList/>} />
      <Route path="/marketing/cbo/policy-list" element={<PolicyList/>} />
      <Route path="/marketing/cbo/offers-list" element={<OffersList/>} />
      <Route path="/marketing/cbo/news-list" element={<NewsList/>} />
      <Route path="/marketing/cbo/policy-images-list" element={<PolicyImagesList/>} />

      
      
    </>
  );
};

export default RBH_Routes;