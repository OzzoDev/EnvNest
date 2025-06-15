import AccessHandler from "@/components/collaboration/AccessHandler";
import InviteForm from "@/components/collaboration/InviteForm";

const CollaborationPage = () => {
  return (
    <div className="p-20">
      <AccessHandler />
      <InviteForm />
    </div>
  );
};

export default CollaborationPage;
