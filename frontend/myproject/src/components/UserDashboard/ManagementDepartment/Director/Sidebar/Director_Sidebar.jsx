import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Director_Sidebar.css";
import logoImage from "../../../../../assets/vedhika.jpeg";
// Separate CSS file

import {
  HouseFill,
  PlusCircle,
  PeopleFill,
  PersonBadge,
  HeartPulse,
  CarFront,
  Book,
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

function Director_Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState(["Director Dashboard"]);
  const [activeMenu, setActiveMenu] = useState("Director Dashboard");
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
      path: '/management/director/dashboard',
      children: []
    },
    {
      id: 2,
      name: 'EMP-INFO',
      icon: <PeopleFill />,
      path: '/management/director/empinfo',
      children: [{ id: 21, name: 'ActiveEmp', icon: <List />, path: '/management/director/activeemplist' },
      ]
    },
    {
      id: 3,
      name: 'Work Links',
      icon: <Laptop />,
      path: '/management/director/worklinks',
      children: []
    },
    {
      id: 4,
      name: 'Payout',
      icon: <CashStack />,
      path: '/management/director/payout',
      children: []
    },
    {
      id: 5,
      name: 'Dsa Code',
      icon: <PersonBadge />,
      path: '/management/director/dsacode',
      children: []
    },
    {
      id: 6,
      name: 'Bankers',
      icon: <Bank />,
      path: '/management/director/bankers',
      children: [{ id: 21, name: 'Add', icon: <PlusCircle />, path: '/management/director/addbank' },
      { id: 22, name: 'list', icon: <List />, path: '/management/director/listbank' },
      ]
    },
    {
      id: 7,
      name: 'Health Insurance',
      icon: <HeartPulse />,
      path: '/management/director/health-insurance',
      children: []
    },
    {
      id: 8,
      name: 'Vehicle Insurance',
      icon: <CarFront />,
      path: '/management/director/vehicle-insurance',
      children: []
    },
    {
      id: 9,
      name: 'Training',
      icon: <Book />,
      path: '/management/director/training',
      children: []
    },
  ];

  return (
    <div className="hr-sidebar">
      <div className="hr-sidebar-header">
        <div className="sidebar-logo">
          <a href="/management/director/dashboard" className="logo-container">
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

export default Director_Sidebar;