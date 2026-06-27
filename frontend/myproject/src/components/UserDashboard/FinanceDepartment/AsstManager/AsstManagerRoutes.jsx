import { Route } from "react-router-dom";
import AsstManagerDashboard from "./AsstManagerDashboard";
import AManager_Dsa_Code from "./AManager_DSACODE/AManager_Dsa_Code";
import AManager_Add from "./AManager_BANKERS/AManager_Add";
import AManager_List from "./AManager_BANKERS/AManager_List";
import AManager_Payout from "./AManager_PAYOUT/AManager_Payout";
import AManager_Training from "./AManager_TRANING/AManager_Training";
import LoanVideoList from "./AManager_TRANING/LoanVideoList";
import ProfileList from "./AManager_TRANING/ProfileList";
import SeminarList from "./AManager_TRANING/SeminarsList";
import PolicyList from "./AManager_TRANING/PolicyList";
import NewsList from "./AManager_TRANING/NewsList";
import OfferList from "./AManager_TRANING/OffersList";
import PolicyImageList from "./AManager_TRANING/PolicyImagesList";




const AsstManagerRoutes = () => {
  return (
    <>
      <Route path="/finance/asst-manager/dashboard" element={<AsstManagerDashboard />} />
      <Route path="/finance/asst-manager/Dsa-Code" element={<AManager_Dsa_Code />} />
       <Route path="/finance/asst-manager/Add" element={<AManager_Add />} />
       <Route path="/finance/asst-manager/List" element={<AManager_List />} />
       <Route path="/finance/asst-manager/payout" element={<AManager_Payout/>} />
       <Route path="/finance/asst-manager/training" element={<AManager_Training/>} />
       <Route path="/finance/asstmanager/loan-video-list" element={<LoanVideoList />} />
       <Route path="/finance/asstmanager/profile-list" element={<ProfileList />} />
       <Route path="/finance/asstmanager/seminars-list" element={<SeminarList />} />
       <Route path="/finance/asstmanager/policy-list" element={<PolicyList />} />
       <Route path="/finance/asstmanager/news-list" element={<NewsList />} />
       <Route path="/finance/asstmanager/offers-list" element={<OfferList />} />
       <Route path="/finance/asstmanager/policy-images-list" element={<PolicyImageList />} />
     
   
    </>
  );
};

export default AsstManagerRoutes;