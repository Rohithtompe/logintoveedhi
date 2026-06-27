import { Route } from "react-router-dom";
import MarketingHeadDashboard from "./MarketingHeadDashboard";
import Add_Emp from "./EMP_MASTER/Add_Emp";
import Active_EmpList from "./EMP_MASTER/Active_EmpList";
import Inactive_EmpList from "./EMP_MASTER/Inactive_EmpList";
import State from "./LOCATION_MASTER/State";
import Location from "./LOCATION_MASTER/Location";
import SubLocation from "./LOCATION_MASTER/SubLocation";
import Pincode from "./LOCATION_MASTER/Pincode";
import BranchState from "./LOCATION_MASTER/BranchState";
import BranchLocation from "./LOCATION_MASTER/BranchLocation";
import Dsa_Code from "./DSACODE/Dsa_Code";
import Add from "./BANKERS/Add";
import List from "./BANKERS/List";
import Training from "./TRAINING/Training";
import LoanVideoList from "./TRAINING/LoanVideoList";
import ProfileList from "./TRAINING/ProfileList";
import SeminarsList from "./TRAINING/SeminarsList";
import PolicyList from "./TRAINING/PolicyList";
import OffersList from "./TRAINING/OffersList";
import NewsList from "./TRAINING/NewsList";
import PolicyImagesList from "./TRAINING/PolicyImagesList";  

const MarketingHeadRoutes = () => {
  return (
    <>
      <Route path="/support-crm/marketing-head/dashboard" element={<MarketingHeadDashboard />} />
      <Route path="/support-crm/marketing-head/addemp" element={<Add_Emp />} />
      <Route path="/support-crm/marketing-head/active-employee" element={<Active_EmpList />} />
      <Route path="/support-crm/marketing-head/inactive-employee" element={<Inactive_EmpList />} />
      <Route path="/support-crm/marketing-head/state" element={<State />} />
      <Route path="/support-crm/marketing-head/location" element={<Location />} />
      <Route path="/support-crm/marketing-head/sublocation" element={<SubLocation />} />
      <Route path="/support-crm/marketing-head/pincode" element={<Pincode />} />
      <Route path="/support-crm/marketing-head/branchstate" element={<BranchState />} />
      <Route path="/support-crm/marketing-head/branchlocation" element={<BranchLocation />} />
      <Route path="/support-crm/marketing-head/dsacode" element={<Dsa_Code />} />
      <Route path="/support-crm/marketing-head/add" element={<Add />} />
      <Route path="/support-crm/marketing-head/list" element={<List />} />
      <Route path="/support-crm/marketing-head/training" element={<Training />} />

      <Route path="/support-crm/marketing-head/training" element={<Training />} />
      <Route path="/support-crm/marketing-head/loan-video-list" element={<LoanVideoList />} />
      <Route path="/support-crm/marketing-head/profile-list" element={<ProfileList />} />
      <Route path="/support-crm/marketing-head/seminars-list" element={<SeminarsList />} />
      <Route path="/support-crm/marketing-head/policy-list" element={<PolicyList />} />
      <Route path="/support-crm/marketing-head/offers-list" element={<OffersList />} />
      <Route path="/support-crm/marketing-head/news-list" element={<NewsList />} />
      <Route path="/support-crm/marketing-head/policy-images-list" element={<PolicyImagesList />} />
    </>
  );
};

export default MarketingHeadRoutes;