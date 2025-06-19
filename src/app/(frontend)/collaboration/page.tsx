"use client";

import OrganizationForm from "@/components/collaboration/OrganizationForm";
import OrganizationList from "@/components/collaboration/OrganizationList";
import OrganizationMembers from "@/components/collaboration/OrganizationMembers";
import ProjectAccessHandler from "@/components/collaboration/ProjectAccessHandler";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const CollaborationPage = () => {
  const [selectedTab, setSelectedTab] = useState<"Accesss" | "Organizations">("Accesss");

  return (
    <div className="p-6 lg:p-20">
      <h2 className="text-xl text-text-color  mb-24">
        {selectedTab === "Accesss"
          ? "Add collaborator to your projects and control thier role to allow for others to access your projects to boost team productivity"
          : "Have a team? Create an organization to use when creating projects to always allow acccess to your team members, control who has read or write access"}
      </h2>
      <Tabs
        value={selectedTab}
        onValueChange={(val) => setSelectedTab(val as "Accesss" | "Organizations")}>
        <TabsList>
          <TabsTrigger value="Accesss">Project Accesss</TabsTrigger>
          <TabsTrigger value="Organizations">Organizations</TabsTrigger>
        </TabsList>
        <TabsContent value="Accesss" className="p-4 lg:p-10">
          <ProjectAccessHandler />
        </TabsContent>
        <TabsContent value="Organizations" className="p-4 lg:p-10">
          <div className="flex flex-col-reverse lg:flex-row gap-32">
            <div className="flex flex-col gap-4">
              <p className="text-lg">Your organizations</p>
              <div className="pl-2">
                <OrganizationList />
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <OrganizationForm />
              <OrganizationMembers />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationPage;
