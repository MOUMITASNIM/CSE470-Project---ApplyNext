import React from 'react';
import { Shield, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const createIcon = (Icon, props = {}) => React.createElement(Icon, props);

const AdminLayout = ({ children, sidebarItems, activePage }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return React.createElement('div', { className: 'flex h-screen overflow-hidden bg-[#fbd7a7]/10' },
    // Sidebar
    React.createElement('aside', {
      className: `fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`,
      'aria-label': 'Sidebar'
    },
      React.createElement('div', { className: 'flex flex-col h-full bg-[#3b7e9b] border-r border-[#5cb2af]' },
        // Sidebar Header
        React.createElement('div', { className: 'h-16 flex items-center px-4 border-b border-[#5cb2af]' },
          createIcon(Shield, { className: 'h-6 w-6 text-white mr-2' }),
          React.createElement('h1', { className: 'text-lg font-semibold text-white' }, 'Admin Panel')
        ),
        // Sidebar Navigation
        React.createElement('nav', { className: 'flex-1 px-4 py-4 space-y-1 overflow-y-auto' },
          sidebarItems.map(item => 
            React.createElement('button', {
              key: item.id,
              onClick: item.onClick,
              className: `w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activePage === item.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-white hover:bg-[#5cb2af] hover:text-white'
              }`
            },
              React.createElement('span', { className: 'mr-3' }, createIcon(item.icon, { className: 'h-5 w-5' })),
              item.title
            )
          )
        ),
        // Logout Button
        React.createElement('div', { className: 'p-4 border-t border-[#5cb2af]' },
          React.createElement('button', {
            onClick: logout,
            className: 'w-full flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-[#5cb2af] rounded-md'
          },
            createIcon(LogOut, { className: 'h-5 w-5 mr-3' }),
            'Logout'
          )
        )
      )
    ),

    // Main Content Area
    React.createElement('div', { className: 'flex-1 flex flex-col overflow-hidden' },
      // Top Navigation
      React.createElement('header', { className: 'bg-[#5cb2af] border-b border-[#7dd8c3]' },
        React.createElement('div', { className: 'h-16 flex items-center justify-between px-4' },
          React.createElement('button', {
            onClick: () => setSidebarOpen(true),
            className: 'lg:hidden p-2 rounded-md text-white hover:text-[#fbd7a7]'
          },
            createIcon(Menu, { className: 'h-6 w-6' })
          ),
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('span', { className: 'text-sm text-white font-medium' }, 
              `Welcome, ${user?.name || 'Admin'}`
            )
          )
        )
      ),
      // Main Content
      React.createElement('main', { className: 'flex-1 overflow-y-auto bg-[#fbd7a7]/10' },
        React.createElement('div', { className: 'py-6 px-4 sm:px-6 lg:px-8' },
          children
        )
      )
    )
  );
};

export default AdminLayout;
