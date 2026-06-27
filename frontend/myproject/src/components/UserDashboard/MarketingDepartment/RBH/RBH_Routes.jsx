import { Route } from "react-router-dom";
import RBH_Dashboard from "./RBH_Dashboard";
import RBH_Emp_Info from "./MarketingRBH/RBH_Emp_Info";
import RBH_WorkLinks from "./RBH_WorkLinks/RBH_Worklinks";
import RBH_WorkIconList from "./RBH_WorkLinks/RBH_WorkIconList";
import RBH_TeamWorklinks from "./RBH_WorkLinks/RBH_TeamWorklinks";
import RBH_Payout from "./RBH_PAYOUT/RBH_Payout";
import RBH_Dsa_Code from "./RBH_DSA-CODE/RBH_Dsa_Code";
import RBH_AddBank from "./RBH_BANKERS/RBH_Addbank";
import RBH_ListBank from "./RBH_BANKERS/RBH_Listbank";
import RBH_Training from "./RBH_TRAINING/RBH_Training";

import LoanVideoList from "./RBH_TRAINING/LoanVideoList";
import ProfileList from "./RBH_TRAINING/ProfileList";
import SeminarsList from "./RBH_TRAINING/SeminarsList";
import PolicyList from "./RBH_TRAINING/PolicyList";
import OffersList from "./RBH_TRAINING/OffersList";
import NewsList from "./RBH_TRAINING/NewsList";
import PolicyImagesList from "./RBH_TRAINING/PolicyImagesList";


const RBH_Routes = () => {
  return (
    <>
      <Route path="/marketing/rbh/dashboard" element={<RBH_Dashboard />} />
       <Route path="/marketing/rbh/empinfo" element={<RBH_Emp_Info />} />
       <Route path="/marketing/rbh/worklinks" element={<RBH_WorkLinks />} />
       <Route path="/marketing/rbh/work-icon-list" element={<RBH_WorkIconList/>} />
       <Route path="/marketing/rbh/teamworklinks" element={<RBH_TeamWorklinks/>} />
       <Route path="/marketing/rbh/payout" element={<RBH_Payout/>} />
       <Route path="/marketing/rbh/dsacode" element={<RBH_Dsa_Code/>} />
       <Route path="/marketing/rbh/addbank" element={<RBH_AddBank/>} />
       <Route path="/marketing/rbh/listbank" element={<RBH_ListBank/>} />
       <Route path="/marketing/rbh/training" element={<RBH_Training/>} />
       <Route path="/marketing/rbh/loan-video-list" element={<LoanVideoList/>} />
       <Route path="/marketing/rbh/profile-list" element={<ProfileList/>} />
       <Route path="/marketing/rbh/seminars-list" element={<SeminarsList/>} />
       <Route path="/marketing/rbh/policy-list" element={<PolicyList/>} />
       <Route path="/marketing/rbh/offers-list" element={<OffersList/>} />
       <Route path="/marketing/rbh/news-list" element={<NewsList/>} />
       <Route path="/marketing/rbh/policy-images-list" element={<PolicyImagesList/>} />

       
    </>
  );
};

export default RBH_Routes;