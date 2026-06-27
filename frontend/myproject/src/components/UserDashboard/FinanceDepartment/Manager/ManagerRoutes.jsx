import { Route } from "react-router-dom";
import ManagerDashboard from "./ManagerDashboard";
import Manager_Training from "./Manager_TRAINING/Manager_Training";
import Manager_Payout from "./Manager_PAYOUT/Manager_Payout";
import Manager_Dsa_Code from "./Manager_DSACODE/Manager_Dsa_Code";
import Manager_AddBank from "./Manager_BANKERS/Manager_AddBank";
import Manager_ListBank from "./Manager_BANKERS/Manager_ListBank";
import LoanVideoList from "./Manager_TRAINING/LoanVideoList";
import ProfileList from "./Manager_TRAINING/ProfileList";
import SeminarsList from "./Manager_TRAINING/SeminarsList";
import PolicyList from "./Manager_TRAINING/PolicyList";
import OffersList from "./Manager_TRAINING/OffersList";
import NewsList from "./Manager_TRAINING/NewsList";
import PolicyImagesList from "./Manager_TRAINING/PolicyImagesList";



const ManagerRoutes = () => {
  return (
    <>
      <Route path="/finance/manager/dashboard" element={<ManagerDashboard />} />
      <Route path="/finance/manager/training" element={<Manager_Training />} />
      <Route path="/finance/manager/addbank" element={<Manager_AddBank/>} />
       <Route path="/finance/manager/listbank" element={<Manager_ListBank/>} />
      <Route path="/finance/manager/payout" element={<Manager_Payout />} />
      <Route path="/finance/manager/dsa-code" element={<Manager_Dsa_Code />} />
      <Route path="/finance/manager/loan-video-list" element={<LoanVideoList />} />
      <Route path="/finance/manager/profile-list" element={<ProfileList />} />
      <Route path="/finance/manager/seminars-list" element={<SeminarsList />} />
      <Route path="/finance/manager/policy-list" element={<PolicyList />} />
      <Route path="/finance/manager/offers-list" element={<OffersList />} />
      <Route path="/finance/manager/news-list" element={<NewsList />} />
      <Route path="/finance/manager/policy-images-list" element={<PolicyImagesList />} />



  
    </>
  );
};

export default ManagerRoutes;