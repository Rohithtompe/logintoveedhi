import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../AdminDashboard.css";

import logoImage from "../../../assets/vedhika.jpeg";

import {
  HouseFill,
  PeopleFill,
  GeoAlt,
  Bank,
  PersonBadge,
  Building,
  CashStack,
  Book,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  List,
  BuildingFill,
  Map,
  PinMap,
  Postage,
  Buildings,
  GeoAltFill,
  CreditCard,
  People,
  PersonLinesFill,
  Award,
  Wallet,
  Type,
  CurrencyExchange,
  Laptop,
  BoxArrowRight,
  CarFront,
  HeartPulse,
  Diagram3,
  Truck,
  Shield,
  PersonPlus,
  PersonCheck,
  PersonX,
  FileText,
  Person,
  Briefcase,
  Calendar,
  CalendarCheck,
  FileEarmarkMedical,
  Hospital,
  CardHeading,
  Gear,
  Building as BuildingIcon
} from 'react-bootstrap-icons';

function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState(["Dashboard"]);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const navigate = useNavigate();

  const toggleMenu = (menuName) => {
    if (expandedMenus.includes(menuName)) {
      setExpandedMenus(expandedMenus.filter(item => item !== menuName));
    } else {
      setExpandedMenus([...expandedMenus, menuName]);
    }
  };

  // Fixed: Properly structured IDs with consistent numbering
  const menuItems = [
    {
      id: 1,
      name: 'Dashboard',
      icon: <HouseFill />,
      path: '/admin-dashboard',
      children: []
    },
    {
      id: 2,
      name: 'Emp Master',
      icon: <PeopleFill />,
      children: [
        { id: 201, name: 'Add employee', icon: <PlusCircle />, path: '/admin-dashboard/emp/add' },
        { id: 202, name: 'Active emp list', icon: <List />, path: '/admin-dashboard/emp/active' },
        { id: 203, name: 'In active emp list', icon: <List />, path: '/admin-dashboard/emp/inactive' },
        { id: 204, name: 'Emp Department', icon: <BuildingFill />, path: '/admin-dashboard/emp/department' },
        { id: 205, name: 'Emp Designation', icon: <Award />, path: '/admin-dashboard/emp/designation' },
        { id: 206, name: 'Emp work icons', icon: <Laptop />, path: '/admin-dashboard/emp/work-icons' },
      ]
    },
    {
      id: 3,
      name: 'Location Master',
      icon: <GeoAlt />,
      children: [
        { id: 301, name: 'State', icon: <Map />, path: '/admin-dashboard/location/state' },
        { id: 302, name: 'Location', icon: <GeoAltFill />, path: '/admin-dashboard/location/location' },
        { id: 303, name: 'Sub Location', icon: <PinMap />, path: '/admin-dashboard/location/sublocation' },
        { id: 304, name: 'Pincode', icon: <Postage />, path: '/admin-dashboard/location/pincode' },
        { id: 305, name: 'Branch State', icon: <Buildings />, path: '/admin-dashboard/location/branch-state' },
        { id: 306, name: 'Branch Location', icon: <Building />, path: '/admin-dashboard/location/branch-location' },
      ]
    },
    {
      id: 4,
      name: 'SDSA Master',
      icon: <Diagram3 />,
      children: [
        { id: 401, name: 'Add SDSA', icon: <PlusCircle />, path: '/admin-dashboard/sdsa/add' },
        { id: 402, name: 'Active SDSA List', icon: <PersonCheck />, path: '/admin-dashboard/sdsa/active' },
        { id: 403, name: 'InActive SDSA List', icon: <PersonX />, path: '/admin-dashboard/sdsa/inactive' },
      ]
    },
    {
      id: 5,
      name: 'DSA-Code Master',
      icon: <PersonBadge />,
      children: [
        { id: 501, name: 'Add Dsa', icon: <PlusCircle />, path: '/admin-dashboard/dsa/add' },
        { id: 502, name: 'DSA List', icon: <List />, path: '/admin-dashboard/dsa/list' },
        { id: 503, name: 'DSA Name', icon: <PersonBadge />, path: '/admin-dashboard/dsa/name' },
        { id: 504, name: 'Loan Type', icon: <CreditCard />, path: '/admin-dashboard/dsa/loantype' },
      ]
    },
    {
      id: 6,
      name: 'Bank Master',
      icon: <Bank />,
      children: [
        { id: 601, name: 'Banks', icon: <CreditCard />, path: '/admin-dashboard/bank/Bank' },
        { id: 602, name: 'Vendor Banks', icon: <People />, path: '/admin-dashboard/bank/vendor' },
        { id: 603, name: 'Type of Accounts', icon: <Type />, path: '/admin-dashboard/bank/account-type' },
        { id: 604, name: 'Bankers Designation', icon: <PersonLinesFill />, path: '/admin-dashboard/bank/designations' },
      ]
    },
    {
      id: 7, // Fixed: Added missing ID 7 (Bankers)
      name: 'Bankers',
      icon: <Building />,
      children: [
        { id: 701, name: 'Add', icon: <PlusCircle />, path: '/admin-dashboard/bankers/add' },
        { id: 702, name: 'List', icon: <List />, path: '/admin-dashboard/bankers/list' },
      ]
    },
    {
      id: 8, // Fixed: Changed from 8 to 8 (continuing sequence)
      name: 'Partner Master',
      icon: <Briefcase />,
      children: [
        { id: 801, name: 'Type Of Partner', icon: <Type />, path: '/admin-dashboard/partner/type' },
        { id: 802, name: 'Add Partner', icon: <PlusCircle />, path: '/admin-dashboard/partner/add' },
        { id: 803, name: 'Partner Active List', icon: <PersonCheck />, path: '/admin-dashboard/partner/active' },
        { id: 804, name: 'Partner Inactive List', icon: <PersonX />, path: '/admin-dashboard/partner/inactive' },
      ]
    },
    {
      id: 9, // Fixed: Changed from 10 to 9 (continuing sequence)
      name: 'Payout Master',
      icon: <CashStack />,
      children: [
        { id: 901, name: 'category', icon: <Wallet />, path: '/admin-dashboard/payout/category' },
        { id: 902, name: 'Payout Type', icon: <Type />, path: '/admin-dashboard/payout/type' },
        { id: 903, name: 'payout', icon: <CurrencyExchange />, path: '/admin-dashboard/payout/payout' },
      ]
    },
    {
      id: 10, // Fixed: Changed from 11 to 10 (continuing sequence)
      name: 'Vehicle Master',
      icon: <CarFront />,
      children: [
        { id: 1001, name: 'Vehical Make', icon: <CarFront />, path: '/admin-dashboard/vehicle/make' },
        { id: 1002, name: 'Vehical Modal', icon: <Truck />, path: '/admin-dashboard/vehicle/model' },
        { id: 1003, name: 'Manufacture Year', icon: <Calendar />, path: '/admin-dashboard/vehicle/year' },
        { id: 1004, name: 'Company Name', icon: <BuildingIcon />, path: '/admin-dashboard/vehicle/company' },
        { id: 1005, name: 'Customer Type', icon: <BuildingIcon />, path: '/admin-dashboard/vehicle/customer' },
        { id: 1006, name: 'Industry Type', icon: <Gear />, path: '/admin-dashboard/vehicle/industry' },
        { id: 1007, name: 'Business Type', icon: <Briefcase />, path: '/admin-dashboard/vehicle/business' },
        { id: 1008, name: 'Vehicle Insurance', icon: <Shield />, path: '/admin-dashboard/vehicle/insurance' },
      ]
    },
    {
      id: 11, // Fixed: Changed from 12 to 11 (continuing sequence)
      name: 'Health Insurance Master',
      icon: <HeartPulse />,
      children: [
        { id: 1101, name: 'Health Insurance', icon: <FileEarmarkMedical />, path: '/admin-dashboard/health/insurance' },
        { id: 1102, name: 'Insurance Company', icon: <Hospital />, path: '/admin-dashboard/health/company' },
        { id: 1103, name: 'Type of policy', icon: <CardHeading />, path: '/admin-dashboard/health/policy-type' },
        { id: 1104, name: 'Age', icon: <CalendarCheck />, path: '/admin-dashboard/health/age' },
        { id: 1105, name: 'Number of Person', icon: <People />, path: '/admin-dashboard/health/persons' },
      ]
    },
    {
      id: 12, // Fixed: Changed from 13 to 12 (continuing sequence)
      name: 'Training',
      icon: <Book />,
      path: '/admin-dashboard/training',
      children: []
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <a href="/admin-dashboard" className="logo-container">
            <img src={logoImage} alt="Company Logo" className="logo-image" />
          </a>
        </div>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-section">
            <div
              className={`menu-item ${activeMenu === item.name ? 'active' : ''}`}
              onClick={() => {
                if (item.children.length > 0) {
                  toggleMenu(item.name);
                } else {
                  setActiveMenu(item.name);
                  navigate(item.path || '#');
                }
              }}
              title={item.name}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
              {item.children.length > 0 && (
                <span className="menu-arrow">
                  {expandedMenus.includes(item.name) ? <ChevronDown /> : <ChevronRight />}
                </span>
              )}
            </div>

            {item.children.length > 0 && expandedMenus.includes(item.name) && (
              <div className="submenu">
                {item.children.map((child) => (
                  <div
                    key={child.id}
                    className={`submenu-item ${activeMenu === child.name ? 'active' : ''}`}
                    onClick={() => {
                      setActiveMenu(child.name);
                      navigate(child.path || '#');
                    }}
                    title={child.name}
                  >
                    <span className="submenu-icon">{child.icon}</span>
                    <span className="submenu-text">{child.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div
          className="menu-item logout-item"
          title="Logout"
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
        >
          <span className="menu-icon"><BoxArrowRight /></span>
          <span className="menu-text">Logout</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;