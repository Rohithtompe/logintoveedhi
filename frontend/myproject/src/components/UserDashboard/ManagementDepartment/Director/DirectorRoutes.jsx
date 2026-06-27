import { Route } from "react-router-dom";
import DirectorDashboard from "./DirectorDashboard";
import EMP_ActiveEmpList from "./EMP-INFO/EMP_ActiveEmpList";
import Worklinks from "./WorkLinks/Worklinks";
import WorkIconList from "./WorkLinks/WorkIconList";
import Payout from "./PAYOUT/Payout";
import Dsa_Code from "./DSACODE/Dsa_Code";
import Addbank from "./BANKERS/Addbank";
import Listbank from "./BANKERS/Listbank";
import Training from "./TRAINING/Training";
import LoanVideoList from "./TRAINING/LoanVideoList";
import ProfileList from "./TRAINING/ProfileList";
import SeminarsList from "./TRAINING/SeminarsList";
import PolicyList from "./TRAINING/PolicyList";
import OffersList from "./TRAINING/OffersList";
import NewsList from "./TRAINING/NewsList";
import PolicyImagesList from "./TRAINING/PolicyImagesList";

import Health_Insurance from "./HEALTHINSURANCE/Health_Insurance";
import Vehicle_Insurance from "./VEHICLEINSURANCE/Vehicle_Insurance";


const DirectorRoutes = () => {
  return (
    <>
      <Route path="/management/director/dashboard" element={<DirectorDashboard />} />
      <Route path="/management/director/activeemplist" element={<EMP_ActiveEmpList />} />
      <Route path="/management/director/worklinks" element={<Worklinks />} />
      <Route path="/management/director/work-icons-list" element={<WorkIconList />} />
      <Route path="/management/director/payout" element={<Payout />} />
      <Route path="/management/director/dsacode" element={<Dsa_Code />} />
      <Route path="/management/director/addbank" element={<Addbank />} />
      <Route path="/management/director/listbank" element={<Listbank />} />

      <Route path="/management/director/training" element={<Training />} />
      <Route path="/management/director/loan-video-list" element={<LoanVideoList />} />
      <Route path="/management/director/profile-list" element={<ProfileList />} />
      <Route path="/management/director/seminars-list" element={<SeminarsList />} />
      <Route path="/management/director/policy-list" element={<PolicyList />} />
      <Route path="/management/director/offers-list" element={<OffersList />} />
      <Route path="/management/director/news-list" element={<NewsList />} />
      <Route path="/management/director/policy-images-list" element={<PolicyImagesList />} />
    

      <Route path="/management/director/health-insurance" element={<Health_Insurance />} />
      <Route path="/management/director/vehicle-insurance" element={<Vehicle_Insurance />} />
    </>
  );
};

export default DirectorRoutes;