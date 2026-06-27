import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SDSA_Sidebar.css"; // Separate CSS file
import logoImage from "../../../assets/vedhika.jpeg";

import {
    HouseFill,
    PlusCircle,
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

function SDSA_Sidebar() {
    const [expandedMenus, setExpandedMenus] = useState(["SDSA Dashboard"]);
    const [activeMenu, setActiveMenu] = useState("SDSA Dashboard");
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
            name: 'SDSA Dashboard',
            icon: <HouseFill />,
            path: '/sdsa/dashboard',
            children: []
        },
        {
            id: 2,
            name: 'WorkLinks',
            icon: <HouseFill />,
            path: '/sdsa/worklinks',
            children: []
        },
        {
            id: 3,
            name: 'Emp Master',
            icon: <HouseFill />,
            path: '/sdsa/empmaster',
            children: [{ id: 31, name: 'Add Emp', icon: <PlusCircle />, path: '/sdsa/addemp' },
            { id: 32, name: 'Active Emplist', icon: <PlusCircle />, path: '/sdsa/activeemployee' },
            { id: 33, name: 'Inactive Emplist', icon: <PlusCircle />, path: '/sdsa/inactiveemployee' },

            ]
        },
        {
            id: 4,
            name: 'Payout',
            icon: <HouseFill />,
            path: '/sdsa/payout',
            children: []
        },
        {
            id: 5,
            name: 'Dsa-Code',
            icon: <HouseFill />,
            path: '/sdsa/dsacode',
            children: []
        },
        {
            id: 6,
            name: 'Bankers',
            icon: <HouseFill />,
            path: '/sdsa/bankers',
            children: [{ id: 61, name: 'Add', icon: <PlusCircle />, path: '/sdsa/addbank' },
            { id: 62, name: 'list', icon: <List />, path: '/sdsa/listbank' },
            ]
        },
        {
            id: 7,
            name: 'Vehicle Insurance',
            icon: <HouseFill />,
            path: '/sdsa/vehicleinsurance',
            children: []
        },
        {
            id: 8,
            name: 'Health Insurance',
            icon: <HouseFill />,
            path: '/sdsa/healthinsurance',
            children: []
        },
        {
            id: 9,
            name: 'Training',
            icon: <HouseFill />,
            path: '/sdsa/training',
            children: []
        },


    ];

    return (
        <div className="hr-sidebar">
            <div className="hr-sidebar-header">
                <div className="sidebar-logo">
                    <a href="/sdsa/dashboard" className="logo-container">
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

export default SDSA_Sidebar;