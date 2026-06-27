import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PartnerSidebar.css"; // Separate CSS file
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

function PartnerSidebar() {
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
            name: 'Dashboard',
            icon: <HouseFill />,
            path: '/partner/dashboard',
            children: []
        },
        {
            id: 2,
            name: 'worklinks',
            icon: <PersonBadgeFill />,
            path: '/partner/worklinks',
            children: []
        },
        {
            id: 3,
            name: 'payout',
            icon: <PersonBadgeFill />,
            path: '/partner/payout',
            children: []
        },
        {
            id: 4,
            name: 'DSA Code',
            icon: <PersonBadgeFill />,
            path: '/partner/dsa-code',
            children: []
        },
        {
            id: 5,
            name: 'Bankers',
            icon: <HouseFill />,
            path: '/partner/bankers',
            children: [{ id: 51, name: 'Add', icon: <PlusCircle />, path: '/partner/addbanker' },
            { id: 52, name: 'list', icon: <List />, path: '/partner/listbankers' },
            ]
        },
        {
            id: 6,
            name: 'Vehicle Insurance',
            icon: <PersonBadgeFill />,
            path: '/partner/vehicle-insurance',
            children: []
        },
        {
            id: 7,
            name: 'Health Insurance',
            icon: <PersonBadgeFill />,
            path: '/partner/health-insurance',
            children: []
        },
        {
            id: 8,
            name: 'Training',
            icon: <PersonBadgeFill />,
            path: '/partner/training',
            children: []
        },
    ];

    return (
        <div className="hr-sidebar">
            <div className="hr-sidebar-header">
                <div className="sidebar-logo">
                    <a href="/partner/dashboard" className="logo-container">
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

export default PartnerSidebar;