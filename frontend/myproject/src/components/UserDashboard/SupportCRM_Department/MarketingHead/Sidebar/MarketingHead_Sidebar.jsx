import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MarketingHead_Sidebar.css";
import logoImage from "../../../../../assets/vedhika.jpeg";
// Separate CSS file

import {
  HouseFill,
  PlusCircle,
  PeopleFill,
  GeoAlt,
  PersonBadge,
  Building,
  Book,
  Map,
  GeoAltFill,
  PinMap,
  Postage,
  Buildings,
  PersonPlusFill,
  FileEarmarkTextFill,
  CalendarCheckFill,
  CashStack,
  AwardFill,
  BuildingFill,
  GraphUp,
  GearFill,
  ChevronDown,
  ChevronRight,
  BoxArrowRight,
  List,
  ClockHistory,
  JournalText,
  ShieldCheck,
  ClipboardData,
  Bank,
  CreditCard,
  Laptop,
  BellFill,
  ClockFill,
  CheckCircleFill,
  ExclamationCircleFill,
  PersonBadgeFill,
  CardChecklist,
  TrophyFill,
  ChatDotsFill,
  FileCheckFill
} from 'react-bootstrap-icons';

function MarketingHead_Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState(["MarketingHead Dashboard"]);
  const [activeMenu, setActiveMenu] = useState("MarketingHead Dashboard");
  const navigate = useNavigate();

  const toggleMenu = (menuName) => {
    if (expandedMenus.includes(menuName)) {
      setExpandedMenus(expandedMenus.filter(item => item !== menuName));
    } else {
      setExpandedMenus([...expandedMenus, menuName]);
    }
  };

  // HR Manager specific menu items
  const menuItems = [
    {
      id: 1,
      name: 'Dashboard',
      icon: <HouseFill />,
      path: '/support-crm/marketing-head/dashboard',
      children: []
    },
    {
      id: 2,
      name: 'Emp Master',
      icon: <PeopleFill />,
      path: '/support-crm/marketing-head/empmaster',
      children: [{ id: 21, name: 'Add Emp', icon: <PlusCircle />, path: '/support-crm/marketing-head/addemp' },
      { id: 22, name: 'Active Emplist', icon: <PlusCircle />, path: '/support-crm/marketing-head/active-employee' },
      { id: 23, name: 'Inactive Emplist', icon: <PlusCircle />, path: '/support-crm/marketing-head/inactive-employee' },

      ]
    },
    {
      id: 3,
      name: 'Location Master',
      icon: <GeoAlt />,
      path: '/support-crm/marketing-head/locationmaster',
      children: [{ id: 31, name: 'State', icon: <Map />, path: '/support-crm/marketing-head/state' },
      { id: 32, name: 'Location', icon: <GeoAltFill />, path: '/support-crm/marketing-head/location' },
      { id: 33, name: 'Sublocation', icon: <PinMap />, path: '/support-crm/marketing-head/sublocation' },
      { id: 34, name: 'Pincode', icon: <Postage />, path: '/support-crm/marketing-head/pincode' },
      { id: 35, name: 'Branch_State', icon: <Buildings />, path: '/support-crm/marketing-head/branchstate' },
      { id: 36, name: 'Branch_Location', icon: <Building />, path: '/support-crm/marketing-head/branchlocation' },

      ]
    },
   {
      id: 4,
      name: 'Dsa Code',
      icon: <PersonBadge />,
      path: '/support-crm/marketing-head/dsacode',
      children: []
    }, 
   {
      id: 5,
      name: 'Bankers',
      icon: <Building />,
      path: '/support-crm/marketing-head/bankers',
      children: [{ id: 21, name: 'Add', icon: <PlusCircle />, path: '/support-crm/marketing-head/add' },
      { id: 22, name: 'list', icon: <List />, path: '/support-crm/marketing-head/list' },
      ]
    }, 
   {
      id: 6,
      name: 'Training',
      icon: <Book />,
      path: '/support-crm/marketing-head/training',
      children: [] 
    } 

  ];

  return (
    <div className="hr-sidebar">
      <div className="hr-sidebar-header">
        <div className="sidebar-logo">
          <a href="/support-crm/marketing-head/dashboard" className="logo-container">
            <img src={logoImage} alt="Company Logo" className="logo-image" />
          </a>
        </div>

      </div>

      <div className="hr-sidebar-menu">
        {menuItems.map((item) => (
          <div key={item.id} className="hr-menu-section">
            <div
              className={`hr-menu-item ${activeMenu === item.name ? 'hr-active' : ''}`}
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
              <span className="hr-menu-icon">{item.icon}</span>
              <span className="hr-menu-text">{item.name}</span>
              {item.children.length > 0 && (
                <span className="hr-menu-arrow">
                  {expandedMenus.includes(item.name) ? <ChevronDown /> : <ChevronRight />}
                </span>
              )}
            </div>

            {item.children.length > 0 && expandedMenus.includes(item.name) && (
              <div className="hr-submenu">
                {item.children.map((child) => (
                  <div
                    key={child.id}
                    className={`hr-submenu-item ${activeMenu === child.name ? 'hr-active' : ''}`}
                    onClick={() => {
                      setActiveMenu(child.name);
                      navigate(child.path || '#');
                    }}
                    title={child.name}
                  >
                    <span className="hr-submenu-icon">{child.icon}</span>
                    <span className="hr-submenu-text">{child.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hr-sidebar-footer">
        <div
          className="hr-menu-item hr-logout-item"
          title="Logout"
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
        >
          <span className="hr-menu-icon"><BoxArrowRight /></span>
          <span className="hr-menu-text">Logout</span>
        </div>
      </div>
    </div>
  );
}

export default MarketingHead_Sidebar;