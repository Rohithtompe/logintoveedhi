import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HR_ManagerSidebar.css"; // Separate CSS file

import logoImage from "../../../../../assets/vedhika.jpeg";

import {
  HouseFill,
  Book,
  PeopleFill,
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

function HR_ManagerSidebar() {
  const [expandedMenus, setExpandedMenus] = useState(["HR Dashboard"]);
  const [activeMenu, setActiveMenu] = useState("HR Dashboard");
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
      name: 'HR Dashboard',
      icon: <HouseFill />,
      path: '/hr/manager/dashboard',
      children: []
    },
    {
      id: 2,
      name: 'Work-Links',
      icon: <Laptop />,
      path: '/hr/manager/work-links',
      children: []
    },
    {
      id: 3,
      name: 'Training',
      icon: <Book />,
      path: '/hr/manager/training',
      children: []
    },
  ];

  return (
    <div className="hr-sidebar">
      <div className="hr-sidebar-header">
        <div className="hr-sidebar-logo">
          <div className="sidebar-logo">
            <a href="/hr/manager/dashboard" className="logo-container">
              <img src={logoImage} alt="Company Logo" className="logo-image" />
            </a>
          </div>
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

export default HR_ManagerSidebar;