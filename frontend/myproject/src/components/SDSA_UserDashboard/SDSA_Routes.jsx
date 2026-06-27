import { Route } from "react-router-dom";
import SDSA_Dashboard from "./SDSA_Dashboard";
import Worklinks from "./SDSA_WorkLinks/Worklinks";
import Add_Emp from "./EMP_MASTER/Add_Emp";
import Active_EmpList from "./EMP_MASTER/Active_Emplist";
import Inactive_EmpList from "./EMP_MASTER/Inactive_EmpList";
import SDSA_Payout from "./SDSA_PAYOUT/SDSA_Payout";
import Dsa_Code from "./DSA-CODE/Dsa_Code";
import SDSA_AddBank from "./BANKERS/SDSA_AddBank";
import SDSA_ListBank from "./BANKERS/SDSA_ListBank";
import Vehicle_Insurance from "./Vehicle_Insurance/vehicle_insurance";
import Health_Insurance from "./Health_Insurance/Health_Insurance";
import Training from "./TRAINING/Training";



const SDSA_Routes = () => {
  return (
    <>
      <Route path="/sdsa/dashboard" element={<SDSA_Dashboard />} />
      <Route path="/sdsa/worklinks" element={<Worklinks />} />
      <Route path="/sdsa/addemp" element={<Add_Emp />} />
      <Route path="/sdsa/activeemployee" element={<Active_EmpList />} />
      <Route path="/sdsa/inactiveemployee" element={<Inactive_EmpList />} />
      <Route path="/sdsa/payout" element={<SDSA_Payout />} />
      <Route path="/sdsa/dsacode" element={<Dsa_Code />} />
      <Route path="/sdsa/addbank" element={<SDSA_AddBank />} />
      <Route path="/sdsa/listbank" element={<SDSA_ListBank />} />
      <Route path="/sdsa/vehicleinsurance" element={<Vehicle_Insurance />} />
      <Route path="/sdsa/healthinsurance" element={<Health_Insurance />} />
      <Route path="/sdsa/training" element={<Training />} />
  
    </>
  );
};

export default SDSA_Routes;