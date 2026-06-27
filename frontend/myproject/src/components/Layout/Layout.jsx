// // src/components/Layout/Layout.jsx
// import React from 'react';
// import './Layout.css';

// const Layout = ({ children, user = { name: 'KRAJESHK', role: 'Superadmin' } }) => {
//   const menuItems = [
//     { id: 1, name: 'Dashboard', icon: '📊', active: true },
//     { id: 2, name: 'Users', icon: '👥' },
//     { id: 3, name: 'Performance', icon: '📈' },
//     { id: 4, name: 'Settings', icon: '⚙️' },
//     { id: 5, name: 'Security', icon: '🔒' },
//     { id: 6, name: 'Offers', icon: '🎁' },
//     { id: 7, name: 'News', icon: '📰' },
//     { id: 8, name: 'Policy', icon: '📋' },
//   ];

//   return (
//     <div className="layout">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <div className="sidebar-logo">
//           <h2>Admin Panel</h2>
//         </div>
//         <div className="sidebar-menu">
//           {menuItems.map((item) => (
//             <div 
//               key={item.id} 
//               className={`menu-item ${item.active ? 'active' : ''}`}
//             >
//               <span className="menu-icon">{item.icon}</span>
//               <span className="menu-text">{item.name}</span>
//             </div>
//           ))}
//         </div>
//         <div className="sidebar-user">
//           <div className="user-avatar">{user.name.charAt(0)}</div>
//           <div className="user-info">
//             <p className="user-name">{user.name}</p>
//             <p className="user-role">{user.role}</p>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="main-content">
//         {children}
//       </div>
//     </div>
//   );
// };

// export default Layout;