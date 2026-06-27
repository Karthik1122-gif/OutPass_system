import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Shield,
  ClipboardList,
  History,
  CheckCircle,
  ScanLine,
  FileText,
  LogOut,
  User,
  GraduationCap,
  Building2,
  Lock
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getRoleBasedNavigation = (role) => {
  const studentNav = [
    { title: "Dashboard", url: createPageUrl("StudentDashboard"), icon: ClipboardList },
    { title: "Apply Pass", url: createPageUrl("ApplyPass"), icon: FileText },
    { title: "History", url: createPageUrl("PassHistory"), icon: History },
    { title: "Profile", url: createPageUrl("Profile"), icon: User },
  ];

  const hodNav = [
    { title: "Dashboard", url: createPageUrl("HODDashboard"), icon: ClipboardList },
    { title: "Approvals", url: createPageUrl("HODApproval"), icon: CheckCircle },
  ];

  const adminNav = [
    { title: "Dashboard", url: createPageUrl("AdminDashboard"), icon: ClipboardList },
    { title: "Approvals", url: createPageUrl("HODApproval"), icon: CheckCircle },
    { title: "Verify Pass", url: createPageUrl("SecurityVerify"), icon: ScanLine },
    { title: "Exit Logs", url: createPageUrl("ExitLogs"), icon: History },
  ];

  if (role === "admin") return adminNav;
  if (role === "user") return studentNav;
  return hodNav;
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navigationItems = user ? getRoleBasedNavigation(user.role) : [];
  const roleLabel = user?.role === "user" ? "Student" : user?.role === "admin" ? "Admin" : "HOD";
  const roleIcon = user?.role === "user" ? GraduationCap : user?.role === "admin" ? Lock : Building2;
  const RoleIcon = roleIcon;

  return (
    <SidebarProvider>
                <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar className="border-r border-gray-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Campus Gate</h2>
                <p className="text-xs text-gray-500">Pass System</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            {user && (
              <div className="mb-4 p-4 bg-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow">
                    <AvatarFallback className="bg-slate-700 text-white font-semibold">
                      {user.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {user.full_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <RoleIcon className="w-3 h-3 text-slate-600" />
                                                  <p className="text-xs text-slate-600 font-medium">{roleLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`mb-1 transition-all duration-200 ${
                                                        location.pathname === item.url
                                                          ? "bg-slate-800 text-white hover:bg-slate-900"
                                                          : "hover:bg-slate-100 text-gray-700"
                                                      }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 rounded-lg">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}