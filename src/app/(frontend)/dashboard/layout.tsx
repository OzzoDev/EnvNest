import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import ProjectWatcher from "@/components/dashboard/ProjectWatcher";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const DashboardLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const defaultOpen = JSON.parse(cookieStore.get("sidebar_state")?.value ?? "true");

  if (!session?.accessToken) {
    redirect("/auth");
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "20rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }>
      <Sidebar />
      <div className="flex flex-col gap-y-12 p-6 min-h-screen w-full max-w-screen overflow-x-hidden">
        {children}
      </div>
      <ProjectWatcher />
    </SidebarProvider>
  );
};

export default DashboardLayout;
