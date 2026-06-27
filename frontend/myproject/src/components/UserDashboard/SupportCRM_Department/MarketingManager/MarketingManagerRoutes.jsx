import { Route } from "react-router-dom";
import MarketingManagerDashboard from "./MarketingManagerDashboard";
import Add_Emp from "./EMP_MASTER/Add_Emp";
import Active_EmpList from "./EMP_MASTER/Active_EmpList";
import Inactive_Emplist from "./EMP_MASTER/Inactive_Emplist";
import State from "./LOCATION_MASTER/State";
import Location_L from "./LOCATION_MASTER/Location_L";
import Sublocation from "./LOCATION_MASTER/Sublocation";
import Pincode from "./LOCATION_MASTER/Pincode";
import Branch_State from "./LOCATION_MASTER/Branch_State";
import Branch_Location from "./LOCATION_MASTER/Branch_Location";
import Dsa_Code from "./DSA_CODE/Dsa_Code";
import AddBank from "./BANKERS/AddBank";
import ListBank from "./BANKERS/ListBank";
import Training from "./TRAINING/Training";
import Vehicle_Insurance from "./VEHICLEINSURNACE/Vehicle_Insurance";

import LoanVideoList from "./TRAINING/LoanVideoList";
import ProfileList from "./TRAINING/ProfileList";
import SeminarsList from "./TRAINING/SeminarsList";
import PolicyList from "./TRAINING/PolicyList";
import OffersList from "./TRAINING/OffersList";
import NewsList from "./TRAINING/NewsList";
import PolicyImagesList from "./TRAINING/PolicyImagesList";


const MarketingManagerRoutes = () => {
  return (
    <>
      <Route path="/support-crm/marketing-manager/dashboard" element={<MarketingManagerDashboard />} />
      <Route path="/support-crm/marketing-manager/addemp" element={<Add_Emp />} />
      <Route path="/support-crm/marketing-manager/active-employee" element={<Active_EmpList />} />
      <Route path="/support-crm/marketing-manager/inactive-employee" element={<Inactive_Emplist />} />
      <Route path="/support-crm/marketing-manager/state" element={<State />} />
      <Route path="/support-crm/marketing-manager/location_L" element={<Location_L />} />
      <Route path="/support-crm/marketing-manager/sublocation" element={<Sublocation />} />
      <Route path="/support-crm/marketing-manager/pincode" element={<Pincode />} />
      <Route path="/support-crm/marketing-manager/branchstate" element={<Branch_State />} />
      <Route path="/support-crm/marketing-manager/branchlocation" element={<Branch_Location />} />
      <Route path="/support-crm/marketing-manager/dsacode" element={<Dsa_Code />} />
      <Route path="/support-crm/marketing-manager/addbanker" element={<AddBank />} />
      <Route path="/support-crm/marketing-manager/listbanker" element={<ListBank />} />
      <Route path="/support-crm/marketing-manager/training" element={<Training />} />
      <Route path="/support-crm/marketing-manager/loan-video-list" element={<LoanVideoList />} />
      <Route path="/support-crm/marketing-manager/profile-list" element={<ProfileList />} />
      <Route path="/support-crm/marketing-manager/seminars-list" element={<SeminarsList />} />
      <Route path="/support-crm/marketing-manager/policy-list" element={<PolicyList />} />
      <Route path="/support-crm/marketing-manager/offers-list" element={<OffersList />} />
      <Route path="/support-crm/marketing-manager/news-list" element={<NewsList />} />
      <Route path="/support-crm/marketing-manager/policy-images-list" element={<PolicyImagesList />} />
      <Route path="/support-crm/marketing-manager/vehicle-insurance" element={<Vehicle_Insurance />} />
    </>
  );
};

export default MarketingManagerRoutes;
