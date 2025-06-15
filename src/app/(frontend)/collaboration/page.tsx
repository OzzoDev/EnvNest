import AccessHandler from "@/components/collaboration/AccessHandler";
import InviteForm from "@/components/collaboration/InviteForm";
import ProjectAccessHandler from "@/components/collaboration/ProjectAccessHandler";

const CollaborationPage = () => {
  return (
    <div className="p-20">
      <ProjectAccessHandler />
      {/* <AccessHandler />
      <InviteForm /> */}
    </div>
  );
};

export default CollaborationPage;
