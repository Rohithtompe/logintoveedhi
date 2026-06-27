import { BrowserRouter, Routes, Route } from "react-router-dom";

// login routes
import Login from "./pages/Login";

// Admin Dashboard routes
import AdminDashboard from "../src/components/AdminDashboard/AdminDashboard";

// Employee Master routes
import AddEmployee from "./components/AdminDashboard/EmpMaster/AddEmployee";
import ActiveEmpList from "./components/AdminDashboard/EmpMaster/ActiveEmpList";
import InactiveEmpList from "./components/AdminDashboard/EmpMaster/InactiveEmpList";
import EmpDepartment from "./components/AdminDashboard/EmpMaster/EmpDepartment";
import EmpDesignation from "./components/AdminDashboard/EmpMaster/EmpDesignation";
import EmpView from './components/AdminDashboard/EmpMaster/EmpView';
import EmpWorkIcons from "./components/AdminDashboard/EmpMaster/EmpWorkIcons";
import EmpWorkIconsAdd from "./components/AdminDashboard/EmpMaster/EmpWorkIconsAdd";
import WorkPermission from "./components/AdminDashboard/EmpMaster/WorkPermission";
import PayoutPermission from "./components/AdminDashboard/EmpMaster/PayoutPermission";


// Location Master routes
import State from "./components/AdminDashboard/LocationMaster/State";
import Location from "./components/AdminDashboard/LocationMaster/Location";
import SubLocation from "./components/AdminDashboard/LocationMaster/SubLocation";
import Pincode from "./components/AdminDashboard/LocationMaster/Pincode";
import BranchState from "./components/AdminDashboard/LocationMaster/BranchState";
import BranchLocation from "./components/AdminDashboard/LocationMaster/BranchLocation";


// Bank Master routes
import Bank from "./components/AdminDashboard/BankMaster/Bank";
import VendorBanks from "./components/AdminDashboard/BankMaster/VendorBanks";
import AccountType from "./components/AdminDashboard/BankMaster/AccountType";
import BankDesignations from "./components/AdminDashboard/BankMaster/BankDesignations";

// DSA-Code Master routes
import AddDsa from "./components/AdminDashboard/DSA/AddDsa";
import DsaList from "./components/AdminDashboard/DSA/DsaList";
import DsaName from "./components/AdminDashboard/DSA/DsaName";
import LoanType from "./components/AdminDashboard/DSA/LoanType";

// Bankers routes
import AddBanker from "./components/AdminDashboard/Bankers/AddBanker";
import BankersList from "./components/AdminDashboard/Bankers/BankersList";

// Payout routes
import PayoutCategory from "./components/AdminDashboard/Payout/PayoutCategory";
import PayoutType from "./components/AdminDashboard/Payout/PayoutType";
import Payout from "./components/AdminDashboard/Payout/Payout";


// Training routes
import Training from "./components/AdminDashboard/Training/Training";
import NewsList from "./components/AdminDashboard/Training/NewsList";
import OfferList from "./components/AdminDashboard/Training/OfferList";
import PolicyImageList from "./components/AdminDashboard/Training/PolicyImageList";
import LoanVideo from "./components/AdminDashboard/Training/LoanVideo";
import LoanVideoList from "./components/AdminDashboard/Training/LoanVideoList";
import Policy from "./components/AdminDashboard/Training/Policy";
import PolicyList from "./components/AdminDashboard/Training/PolicyList";
import Profile from "./components/AdminDashboard/Training/Profile";
import ProfileList from "./components/AdminDashboard/Training/ProfileList";
import Seminar from "./components/AdminDashboard/Training/Seminar";
import SeminarList from "./components/AdminDashboard/Training/SeminarList";



// SDSA routes
import Add_SDSA from "./components/AdminDashboard/SdsaMaster/Add_SDSA";
import Active_SDSA_List from "./components/AdminDashboard/SdsaMaster/Active_SDSA_List";
import Inactive_SDSA_List from "./components/AdminDashboard/SdsaMaster/Inactive_SDSA_List";
import SDSA_View from "./components/AdminDashboard/SdsaMaster/SDSA_View";
import Sdsa_WorkPermission from "./components/AdminDashboard/SdsaMaster/Sdsa_WorkPermission";
import Sdsa_PayoutPermission from "./components/AdminDashboard/SdsaMaster/Sdsa_PayoutPermission";



// Partner routes
import TypeOfPartner from "./components/AdminDashboard/PartnerMaster/TypeOfPartner";
import AddPartner from "./components/AdminDashboard/PartnerMaster/AddPartner";
import PartnerActiveList from "./components/AdminDashboard/PartnerMaster/PartnerActiveList";
import PartnerInactiveList from "./components/AdminDashboard/PartnerMaster/PartnerInactiveList";
import Partner_WorkPermission from "./components/AdminDashboard/PartnerMaster/Partner_WorkPermission";
import Partner_PayoutPermission from "./components/AdminDashboard/PartnerMaster/Partner_PayoutPermission";
import Partner_View from "./components/AdminDashboard/PartnerMaster/Partner_View";




// Vehicle Master routes
import VehicleMake from "./components/AdminDashboard/VehicleMaster/VehicleMake";
import VehicleModel from "./components/AdminDashboard/VehicleMaster/VehicleModel";
import ManufactureYear from "./components/AdminDashboard/VehicleMaster/ManufactureYear";
import CompanyName from "./components/AdminDashboard/VehicleMaster/CompanyName";
import CustomerType from "./components/AdminDashboard/VehicleMaster/CustomerType";
import IndustryType from "./components/AdminDashboard/VehicleMaster/IndustryType";
import BusinessType from "./components/AdminDashboard/VehicleMaster/BusinessType";
import VehicleInsurance from "./components/AdminDashboard/VehicleMaster/VehicleInsurance";
import Add_Insurance from "./components/AdminDashboard/VehicleMaster/Add_Insurance";
import My_InsuranceList from "./components/AdminDashboard/VehicleMaster/My_InsuranceList";
import Insurance_Team from "./components/AdminDashboard/VehicleMaster/Insurance_Team";
import Vehicle_View from "./components/AdminDashboard/VehicleMaster/Vehicle_View";



// Health Insurance routes
import HealthInsurance from "./components/AdminDashboard/HealthInsuranceMaster/HealthInsurance";
import InsuranceCompany from "./components/AdminDashboard/HealthInsuranceMaster/InsuranceCompany";
import TypeOfPolicy from "./components/AdminDashboard/HealthInsuranceMaster/TypeOfPolicy";
import Age from "./components/AdminDashboard/HealthInsuranceMaster/Age";
import NumberOfPerson from "./components/AdminDashboard/HealthInsuranceMaster/NumberOfPerson";
import Add_HealthInsurance from "./components/AdminDashboard/HealthInsuranceMaster/Add_HealthInsurance";
import My_HealthInsuranceList from "./components/AdminDashboard/HealthInsuranceMaster/My_HealthInsuranceList";
import Health_InsuranceTeam from "./components/AdminDashboard/HealthInsuranceMaster/Health_InsuranceTeam";
import Health_View from "./components/AdminDashboard/HealthInsuranceMaster/Health_View";



//user dashboard routes

import AsstManagerRoutes from "./components/UserDashboard/FinanceDepartment/AsstManager/AsstManagerRoutes";
import ManagerRoutes from "./components/UserDashboard/FinanceDepartment/Manager/ManagerRoutes";
import HR_ManagerRoutes from "./components/UserDashboard/HR_Department/HR_Manager/HR_ManagerRoutes";
import MarketingHeadRoutes from "./components/UserDashboard/SupportCRM_Department/MarketingHead/MarketingHeadRoutes";
import MarketingManagerRoutes from "./components/UserDashboard/SupportCRM_Department/MarketingManager/MarketingManagerRoutes";
import DirectorRoutes from "./components/UserDashboard/ManagementDepartment/Director/DirectorRoutes";
import ManagingDirectorRoutes from "./components/UserDashboard/ManagementDepartment/ManagingDirector/ManagingDirectorRoutes";
import BH_Routes from "./components/UserDashboard/MarketingDepartment/BH/BH_Routes";
import RBH_Routes from "./components/UserDashboard/MarketingDepartment/RBH/RBH_Routes";
import CBO_Routes from "./components/UserDashboard/MarketingDepartment/CBO/CBO_Routes";




// SDSA user routes
import SDSA_Routes from "./components/SDSA_UserDashboard/SDSA_Routes";
// Partner user routes
import PartnerRoutes from "./components/PartnerDashboard/PartnerRoutes";




function App() {
  const designation = localStorage.getItem("designation");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin Dashboard with nested routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />}>
          {/* <Route index element={null} /> */}
          <Route path="emp/add" element={<AddEmployee />} />
          <Route path="emp/active" element={<ActiveEmpList />} />
          <Route path="emp/inactive" element={<InactiveEmpList />} />
          <Route path="emp/department" element={<EmpDepartment />} />
          <Route path="emp/designation" element={<EmpDesignation />} />
          <Route path="emp/work-icons" element={<EmpWorkIcons />} />
          <Route path="emp/work-icons/add" element={<EmpWorkIconsAdd />} />
          <Route path="/admin-dashboard/emp/view/:id" element={<EmpView />} />
          <Route path="/admin-dashboard/emp/work-permission/:userId?" element={<WorkPermission />} />
          <Route path="/admin-dashboard/emp/payout-permission/:userId?" element={<PayoutPermission />} />
          {/* location master routes */}

          <Route path="location/state" element={<State />} />
          <Route path="location/location" element={<Location />} />
          <Route path="location/sublocation" element={<SubLocation />} />
          <Route path="location/pincode" element={<Pincode />} />
          <Route path="location/branch-state" element={<BranchState />} />
          <Route path="location/branch-location" element={<BranchLocation />} />



          {/* SDSA Master routes */}
          <Route path="sdsa/add" element={<Add_SDSA />} />
          <Route path="sdsa/active" element={<Active_SDSA_List />} />
          <Route path="sdsa/inactive" element={<Inactive_SDSA_List />} />
          <Route path="sdsa/view/:id" element={<SDSA_View />} />
          <Route path="sdsa/work-permission/:userId?" element={<Sdsa_WorkPermission />} />
          <Route path="sdsa/payout-permission/:userId?" element={<Sdsa_PayoutPermission />} />



          {/* DSA-Code Master routes */}

          <Route path="dsa/add" element={<AddDsa />} />
          <Route path="dsa/list" element={<DsaList />} />
          <Route path="dsa/name" element={<DsaName />} />
          <Route path="dsa/loantype" element={<LoanType />} />





          {/* Bank Master routes */}

          <Route path="bank/bank" element={<Bank />} />
          <Route path="bank/vendor" element={<VendorBanks />} />
          <Route path="bank/account-type" element={<AccountType />} />
          <Route path="bank/designations" element={<BankDesignations />} />




          {/* Bankers routes */}

          <Route path="bankers/add" element={<AddBanker />} />
          <Route path="bankers/list" element={<BankersList />} />



          {/* Partner Master */}

          <Route path="partner/type" element={<TypeOfPartner />} />
          <Route path="partner/add" element={<AddPartner />} />
          <Route path="partner/active" element={<PartnerActiveList />} />
          <Route path="partner/inactive" element={<PartnerInactiveList />} />
          <Route path="partner/view/:id" element={<Partner_View />} />
          <Route path="partner/work-permission/:userId?" element={<Partner_WorkPermission />} />
          <Route path="partner/payout-permission/:userId?" element={<Partner_PayoutPermission />} />




          {/* Payout routes */}
          <Route path="payout/category" element={<PayoutCategory />} />
          <Route path="payout/type" element={<PayoutType />} />
          <Route path="payout/payout" element={<Payout />} />





          {/* Vehicle Master */}

          <Route path="vehicle/make" element={<VehicleMake />} />
          <Route path="vehicle/model" element={<VehicleModel />} />
          <Route path="vehicle/year" element={<ManufactureYear />} />
          <Route path="vehicle/company" element={<CompanyName />} />
          <Route path="vehicle/customer" element={<CustomerType />} />
          <Route path="vehicle/industry" element={<IndustryType />} />
          <Route path="vehicle/business" element={<BusinessType />} />
          <Route path="vehicle/insurance" element={<VehicleInsurance />} />
          <Route path="vehicle/add-insurance" element={<Add_Insurance />} />
          <Route path="vehicle/insurance-list" element={<My_InsuranceList />} />
          <Route path="vehicle/insurance-team" element={<Insurance_Team />} />
          <Route path="vehicle/view/:id" element={<Vehicle_View />} />





          {/* Health Insurance Master */}

          <Route path="health/insurance" element={<HealthInsurance />} />
          <Route path="health/company" element={<InsuranceCompany />} />
          <Route path="health/policy-type" element={<TypeOfPolicy />} />
          <Route path="health/age" element={<Age />} />
          <Route path="health/persons" element={<NumberOfPerson />} />
          <Route path="health/add-health-insurance" element={<Add_HealthInsurance />} />
          <Route path="health/insurance-list" element={<My_HealthInsuranceList />} />
          <Route path="health/insurance-team" element={<Health_InsuranceTeam />} />
          <Route path="health/view/:id" element={<Health_View />} />




          {/* Training routes */}

          <Route path="training" element={<Training />} />
          <Route path="training/news-list" element={<NewsList />} />
          <Route path="training/offer-list" element={<OfferList />} />
          <Route path="training/policy-image-list" element={<PolicyImageList />} />
          <Route path="training/loan-video" element={<LoanVideo />} />
          <Route path="training/loan-video-list" element={<LoanVideoList />} />
          <Route path="training/policy" element={<Policy />} />
          <Route path="training/policy-list" element={<PolicyList />} />
          <Route path="training/profile" element={<Profile />} />
          <Route path="training/profile-list" element={<ProfileList />} />
          <Route path="training/seminar" element={<Seminar />} />
          <Route path="training/seminar-list" element={<SeminarList />} />


        </Route>
        {designation === "RBH" && RBH_Routes()}
        {designation === "BH" && BH_Routes()}
        {designation === "CBO" && CBO_Routes()}
        {designation === "Director" && DirectorRoutes()}
        {designation === "Managing Director" && ManagingDirectorRoutes()}
        {designation === "HR Manager" && HR_ManagerRoutes()}
        {designation === "Marketing Head" && MarketingHeadRoutes()}
        {designation === "Marketing Manager" && MarketingManagerRoutes()}
        {designation === "Asst Manager" && AsstManagerRoutes()}
        {designation === "Manager" && ManagerRoutes()}
        {/* {designation === "SDSA" && SDSA_Routes()} */}
        {/* {designation === "Partner" && PartnerRoutes()} */}
        {SDSA_Routes()}
        {PartnerRoutes()}



        {/* Optional Unauthorized Page */}
        <Route path="*" element={<h2>Unauthorized or Page Not Found</h2>} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
