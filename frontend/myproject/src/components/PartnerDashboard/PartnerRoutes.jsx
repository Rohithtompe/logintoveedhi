import { Route } from "react-router-dom";
import PartnerDashboard from "./PartnerDashboard";
import PartnerWorklinks from "./PartnerWorkLink/PartnerWorklinks";
import PartnerPayout from "./PartnerPayout/PartnerPayout";
import DSA_Code from "./PartnerDSACode/DSA_Code";
import AddBank from "./PartnerBankers/AddBank";
import ListBank from "./PartnerBankers/ListBank";
import VehicleInsurance from "./VehicleInsurance/VehicleInsurance";
import HealthInsurance from "./HealthInsurance/HealthInsurance";
import Training from "./Training/Training";



const PartnerRoutes = () => {
  return (
    <>
      <Route path="/partner/dashboard" element={<PartnerDashboard />} />
      <Route path="/partner/worklinks" element={<PartnerWorklinks />} />
      <Route path="/partner/payout" element={<PartnerPayout />} />
      <Route path="/partner/dsa-code" element={<DSA_Code />} />
      <Route path="/partner/addbanker" element={<AddBank />} />
      <Route path="/partner/listbankers" element={<ListBank />} />
      <Route path="/partner/vehicle-insurance" element={<VehicleInsurance />} />
      <Route path="/partner/health-insurance" element={<HealthInsurance />} />
      <Route path="/partner/training" element={<Training />} />
    </>
  );
};

export default PartnerRoutes;