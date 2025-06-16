import OrganizationForm from "@/components/collaboration/OrganizationForm";
import OrganizationList from "@/components/collaboration/OrganizationList";
import ProjectAccessHandler from "@/components/collaboration/ProjectAccessHandler";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CollaborationPage = () => {
  return (
    <div className="p-20">
      <Tabs defaultValue="Accesss">
        <TabsList>
          <TabsTrigger value="Accesss">Project Accesss</TabsTrigger>
          <TabsTrigger value="Organizations">Organizations</TabsTrigger>
        </TabsList>
        <TabsContent value="Accesss" className="p-10">
          <ProjectAccessHandler />
        </TabsContent>
        <TabsContent value="Organizations" className="p-10">
          <div className="flex gap-32">
            <div className="flex flex-col gap-4">
              <p className="text-lg">Your organizations</p>
              <div className="pl-2">
                <OrganizationList />
              </div>
            </div>
            <OrganizationForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationPage;
