import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Manager_Sidebar.css";
import logoImage from "../../../../../assets/vedhika.jpeg";
// Separate CSS file

import {
  HouseFill,
  PlusCircle,
  PeopleFill,
  PersonBadge,
  Building,
  Diagram3,
  Briefcase,
  CashStack,
  Book,
  PersonPlusFill,
  FileEarmarkTextFill,
  CalendarCheckFill,
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

function Manager_Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState(["Manager Dashboard"]);
  const [activeMenu, setActiveMenu] = useState("Manager Dashboard");
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
      path: '/finance/manager/dashboard',
      children: []
    },
    {
      id: 2,
      name: 'Emp Links',
      icon: <PeopleFill />,
      path: '/finance/manager/emplinks',
      children: []
    },
    {
      id: 3,
      name: 'DSA - Code',
      icon: <PersonBadge />,
      path: '/finance/manager/dsa-code',
      children: []
    },
    {
      id: 4,
      name: 'Bankers',
      icon: <Building />,
      path: '/finance/manager/bankers',
      children: [{ id: 41, name: 'Add', icon: <PlusCircle />, path: '/finance/manager/addbank' },
      { id: 42, name: 'list', icon: <List />, path: '/finance/manager/listbank' },
      ]
    },
    {
      id: 5,
      name: 'Employees',
      icon: <PeopleFill />,
      path: '/finance/manager/employees',
      children: []
    },
    {
      id: 6,
      name: 'SDSA',
      icon: <Diagram3 />,
      path: '/finance/manager/sdsa',
      children: []
    },
    {
      id: 7,
      name: 'Partners',
      icon: <Briefcase />,
      path: '/finance/manager/partners',
      children: []
    },
    {
      id: 8,
      name: 'Payout',
      icon: <CashStack />,
      path: '/finance/manager/payout',
      children: []
    },
    {
      id: 9,
      name: 'Training',
      icon: <Book />,
      path: '/finance/manager/training',
      children: []
    },

  ];

  return (
    <div className="hr-sidebar">
      <div className="hr-sidebar-header">
        <div className="sidebar-logo">
          <a href="/finance/manager/dashboard" className="logo-container">
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

export default Manager_Sidebar;