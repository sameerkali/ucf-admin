import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  BarChart3,
  Clock,
  HelpCircle,
  FileText,
  Library,
  LogOut
} from "lucide-react";
import { useAppDispatch } from "../reducers/store";
import { logout } from "../reducers/auth.reducer";

const navItems = [
  { name: "Dashboard", path: "/", icon: <Home /> },
  { name: "Curriculum", path: "/curriculum", icon: <BookOpen /> },
  { name: "Insights", path: "/insights", icon: <BarChart3 /> },
  { name: "Assign Time", path: "/assign-time", icon: <Clock /> },
  { name: "Generate Questions", path: "/generate-questions", icon: <HelpCircle /> },
  { name: "Assignment", path: "/assignment", icon: <FileText /> },
  { name: "Library", path: "/library", icon: <Library /> },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="w-80 bg-white min-h-screen flex flex-col justify-between shadow-sm">
      <div>
        <div className="w-full py-8 text-center text-4xl font-bold">
          UCF Admin Panel
        </div>

        <nav className="flex flex-col gap-2 text-center">
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
                  className={`flex items-center w-64 ml-8 rounded-xl px-6 py-3 transition-colors ${
                    isActive
                      ? "bg-[#F6EFD7] text-primary-green font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="text-base">{item.name}</span>
                </NavLink>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-200 transition flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
