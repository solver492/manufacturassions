
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Home,
  Calendar,
  Building2,
  Clipboard,
  Users,
  Truck,
  Receipt,
  BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";

const Sidebar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState(() => {
    if (location === "/") return "dashboard";
    if (location === "/calendar") return "calendar";
    if (location === "/sites") return "sites";
    if (location === "/prestations") return "prestations";
    if (location === "/employees") return "employees";
    if (location === "/vehicles") return "vehicles";
    if (location === "/billing") return "billing";
    if (location === "/reports") return "reports";
    return "dashboard";
  });

  const isActive = (page: string) => activePage === page;
  const [, navigate] = useLocation();

  const handleNavigation = (path: string, page: string) => {
    setActivePage(page);
    navigate(path);
  };

  return (
    <div className="h-full flex flex-col">
      <nav className="mt-5 flex-1 px-2 space-y-1">
        <button
          onClick={() => handleNavigation("/", "dashboard")}
          className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive("dashboard")
              ? "bg-blue-50 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Home className="mr-3 h-6 w-6" />
          Dashboard
        </button>

        <button
          onClick={() => handleNavigation("/calendar", "calendar")}
          className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive("calendar")
              ? "bg-blue-50 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Calendar className="mr-3 h-6 w-6" />
          Calendrier
        </button>

        <button
          onClick={() => handleNavigation("/sites", "sites")}
          className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive("sites")
              ? "bg-blue-50 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Building2 className="mr-3 h-6 w-6" />
          Sites Clients
        </button>

        <button
          onClick={() => handleNavigation("/prestations", "prestations")}
          className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive("prestations")
              ? "bg-blue-50 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Clipboard className="mr-3 h-6 w-6" />
          Prestations
        </button>

        <button
          onClick={() => handleNavigation("/employees", "employees")}
          className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive("employees")
              ? "bg-blue-50 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users className="mr-3 h-6 w-6" />
          Employés
        </button>

        <button
          onClick={() => handleNavigation("/vehicles", "vehicles")}
          className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive("vehicles")
              ? "bg-blue-50 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Truck className="mr-3 h-6 w-6" />
          Véhicules
        </button>

        <button
          onClick={() => handleNavigation("/billing", "billing")}
          className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive("billing")
              ? "bg-blue-50 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Receipt className="mr-3 h-6 w-6" />
          Facturation
        </button>

        <button
          onClick={() => handleNavigation("/reports", "reports")}
          className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            isActive("reports")
              ? "bg-blue-50 text-primary"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BarChart3 className="mr-3 h-6 w-6" />
          Rapports
        </button>
      </nav>
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 bg-primary">
              <AvatarFallback>
                {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-700">{user?.username || "Admin User"}</p>
            <button
              onClick={logout}
              className="text-xs font-medium text-primary hover:text-primary-dark"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
