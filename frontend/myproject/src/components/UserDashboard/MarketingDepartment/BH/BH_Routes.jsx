import { Route } from "react-router-dom";
import BH_Dashboard from "./BH_Dashboard";
import BH_Emp_Info from "./MarketingBH/BH_Emp_info";
import BH_WorkLinks from "./BH_WorkLinks/BH_WorkLinks";
import BH_WorkIconList from "./BH_WorkLinks/BH_WorkIconList";
import BH_TeamWorklinks from "./BH_WorkLinks/BH_TeamWorklinks";
import BH_Payout from "./BH_PAYOUT/BH_Payout";
import BH_Dsa_Code from "./BH_DSA-CODE/BH_Dsa_Code";
import BH_AddBank from "./BH_BANKERS/BH_AddBank";
import BH_ListBank from "./BH_BANKERS/BH_ListBank";
import BH_Training from "./BH_TRAINING/BH_Training";
import LoanVideoList from "./BH_TRAINING/LoanVideoList";
import ProfileList from "./BH_TRAINING/ProfileList";
import SeminarsList from "./BH_TRAINING/SeminarsList";
import PolicyList from "./BH_TRAINING/PolicyList";
import OffersList from "./BH_TRAINING/OffersList";
import NewsList from "./BH_TRAINING/NewsList";
import PolicyImagesList from "./BH_TRAINING/PolicyImagesList";

const BH_Routes = () => {
  return (
    <>
      <Route path="/marketing/bh/dashboard" element={<BH_Dashboard />} />
      <Route path="/marketing/bh/empinfo" element={<BH_Emp_Info />} />
      <Route path="/marketing/bh/worklinks" element={<BH_WorkLinks />} />
       <Route path="/marketing/bh/work-icon-list" element={<BH_WorkIconList/>} />
      <Route path="/marketing/bh/teamworklinks" element={<BH_TeamWorklinks/>} />
      <Route path="/marketing/bh/payout" element={<BH_Payout/>} />
      <Route path="/marketing/bh/dsacode" element={<BH_Dsa_Code/>} />
        <Route path="/marketing/bh/addbank" element={<BH_AddBank/>} />
      <Route path="/marketing/bh/listbank" element={<BH_ListBank/>} />

      <Route path="/marketing/bh/training/dashboard" element={<BH_Training/>} />
      <Route path="/marketing/bh/loan-video-list" element={<LoanVideoList/>} />
      <Route path="/marketing/bh/profile-list" element={<ProfileList/>} />
      <Route path="/marketing/bh/seminars-list" element={<SeminarsList/>} />
      <Route path="/marketing/bh/policy-list" element={<PolicyList/>} />
      <Route path="/marketing/bh/offers-list" element={<OffersList/>} />
      <Route path="/marketing/bh/news-list" element={<NewsList/>} />
      <Route path="/marketing/bh/policy-images-list" element={<PolicyImagesList/>} />

      
      
    </>
  );
};

export default BH_Routes;