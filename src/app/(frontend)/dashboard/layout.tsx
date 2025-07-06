import { SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { DashboardProvider } from "@/components/providers/DashboardProvider";
import { authOptions } from "@/lib/authOptions";

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
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "20rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <DashboardProvider>{children}</DashboardProvider>
    </SidebarProvider>
  );
};

export default DashboardLayout;
