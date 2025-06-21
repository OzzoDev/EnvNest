import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { ProjectControllerProvider } from "@/components/providers/ProjectControllerProvider";
import { SidebarControllerProvider } from "@/components/providers/SidebarControllerProvider";

const DashboardLayout = async ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const defaultOpen = JSON.parse(
    cookieStore.get("sidebar_state")?.value ?? "true"
  );

  if (!session?.accessToken) {
    redirect("/auth");
  }

  return (
    <ProjectControllerProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "20rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <SidebarControllerProvider>
          <Dashboard>{children}</Dashboard>
        </SidebarControllerProvider>
      </SidebarProvider>
    </ProjectControllerProvider>
  );
};

export default DashboardLayout;
