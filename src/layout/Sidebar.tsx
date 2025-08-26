import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ShoppingCart,
  Users,
  LogOut,
  X
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../reducers/store";
import { logout } from "../reducers/auth.reducer";

const navItems = [
  { name: "POS", path: "/", icon: <ShoppingCart /> },
  { name: "Farmer", path: "/farmer", icon: <Users /> },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    dispatch(logout());
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <>
      <aside className="w-80 bg-white min-h-screen flex flex-col justify-between shadow-sm" role="navigation">
        <div>
          <div className="w-full py-8 text-center text-4xl font-bold">
            UCF Admin Panel
          </div>

          <nav className="flex flex-col gap-2 text-center" role="menu">
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <div key={item.path} className="relative">
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-2 bg-green-600 rounded-r-full" />
                  )}

                  <NavLink
                    to={item.path}
                    role="menuitem"
                    className={`flex items-center w-64 ml-8 rounded-xl px-6 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isActive
                        ? "bg-[#F6EFD7] text-primary-green font-bold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-lg mr-3" aria-hidden="true">{item.icon}</span>
                    <span className="text-base">{item.name}</span>
                  </NavLink>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-200">
          {user && (
            <div className="mb-4 text-sm text-gray-600">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogoutClick}
            onKeyDown={(e) => handleKeyDown(e, handleLogoutClick)}
            className="w-full bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Logout from application"
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleLogoutCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-description"
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="logout-title" className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h2>
              <button
                onClick={handleLogoutCancel}
                onKeyDown={(e) => handleKeyDown(e, handleLogoutCancel)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>
            
            <p id="logout-description" className="text-gray-600 mb-6">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                onKeyDown={(e) => handleKeyDown(e, handleLogoutCancel)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                onKeyDown={(e) => handleKeyDown(e, handleLogoutConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
