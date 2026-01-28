import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocketConnection } from '../hooks/useAdminSocket';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useSocketConnection(user);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/jobs', label: 'Jobs', icon: '💼' },
      { path: '/schemes', label: 'Schemes', icon: '📋' },
      { path: '/users', label: 'Users', icon: '👥' },
    ];

    if (user?.role === 'ADMIN') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        ...baseItems,
        { path: '/subadmins', label: 'Subadmins', icon: '👤' },
        { path: '/audit-logs', label: 'Audit Logs', icon: '📝' },
      ];
    } else if (user?.role === 'SUBADMIN') {
      return [
        { path: '/subadmin-dashboard', label: 'Dashboard', icon: '📊' },
        ...baseItems,
      ];
    }
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">RojgaAlert Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <span className="text-sm text-gray-700 mr-2">
                  {user?.adminProfile?.name || user?.mobileNumber}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-800">
                  {user?.role === 'ADMIN' ? 'Admin' : 'Subadmin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;