import { Route } from "react-router-dom";
import ManagingDirectorDashboard from "./ManagingDirectorDashboard";
import EMP_ActiveEmpList from "./EMP-INFO/EMP_ActiveEmpList";
import Worklinks from "./WorkLinks/Worklinks.jsx";
import WorkIconList from "./WorkLinks/WorkIconList.jsx";
import Payout from "./PAYOUT/Payout.jsx";
import Dsa_Code from "./DSACODE/Dsa_Code.jsx";
import Addbank from "./BANKERS/Addbank.jsx";
import Listbank from "./BANKERS/Listbank.jsx";
import Training from "./TRAINING/Training.jsx";
import SeminarsList from "./TRAINING/SeminarsList.jsx";
import PolicyList from "./TRAINING/PolicyList.jsx";
import OffersList from "./TRAINING/OffersList.jsx";
import NewsList from "./TRAINING/NewsList.jsx";
import PolicyImagesList from "./TRAINING/PolicyImagesList.jsx";
import LoanVideoList from "./TRAINING/LoanVideoList.jsx";
import ProfileList from "./TRAINING/ProfileList.jsx";

import Health_Insurance from "./HEALTHINSURANCE/Health_Insurance.jsx";
import Vehicle_Insurance from "./VEHICLEINSURANCE/Vehicle_Insurance.jsx";




const ManagingDirectorRoutes = () => {
  return (
    <>
      <Route path="/management/managing-director/dashboard" element={<ManagingDirectorDashboard />} />
       <Route path="/management/Managing-director/activeemplist" element={<EMP_ActiveEmpList />} />
      <Route path="/management/Managing-director/worklinks" element={<Worklinks />} />
      <Route path="/management/Managing-director/work-icons-list" element={<WorkIconList />} />

      <Route path="/management/Managing-director/payout" element={<Payout />} />
      <Route path="/management/Managing-director/dsacode" element={<Dsa_Code />} />
      <Route path="/management/Managing-director/addbank" element={<Addbank />} />
      <Route path="/management/Managing-director/listbank" element={<Listbank />} />
      <Route path="/management/Managing-director/training" element={<Training />} />

      <Route path="/management/managing-director/loan-video-list" element={<LoanVideoList />} />
      <Route path="/management/Managing-director/profile-list" element={<ProfileList />} />
      <Route path="/management/Managing-director/seminars-list" element={<SeminarsList />} />
      <Route path="/management/Managing-director/policy-list" element={<PolicyList />} />
      <Route path="/management/Managing-director/offers-list" element={<OffersList />} />
      <Route path="/management/Managing-director/news-list" element={<NewsList />} />
      <Route path="/management/Managing-director/policy-images-list" element={<PolicyImagesList />} />

      <Route path="/management/Managing-director/health-insurance" element={<Health_Insurance />} />
      <Route path="/management/Managing-director/vehicle-insurance" element={<Vehicle_Insurance />} />
    </>
  );
};

export default ManagingDirectorRoutes;