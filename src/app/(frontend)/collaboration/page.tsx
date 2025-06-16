import OrganizationForm from "@/components/collaboration/OrganizationForm";
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
          <OrganizationForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationPage;
