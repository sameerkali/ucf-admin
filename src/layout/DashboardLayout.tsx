import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
// import Topbar from '../components/Topbar';

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        {/* <Topbar /> */}
        <main className="">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
