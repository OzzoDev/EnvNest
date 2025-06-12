import NewTemplateForm from "@/components/templates/NewTemplateForm";
import TemplateList from "@/components/templates/TemplateList";
import { CgDanger } from "react-icons/cg";

const TemplatesPage = () => {
  return (
    <div className="flex flex-col items-center w-[90%] max-w-[900px] px-6 py-20 mx-auto">
      <h2 className="mb-6 text-xl text-text-color">
        Create a template to easily and quickly set up <code>.env</code> files in your project.
        Choose a visibility option to keep the template private or share it within your
        organization.
      </h2>

      <h3 className="self-start text-destructive">
        Warning: Do not include any sensitive or secret values in the template, as its content is
        not encrypted and can be viewed in plain text.
      </h3>

      <div className="flex">
        <TemplateList />
        <NewTemplateForm />
      </div>
    </div>
  );
};

export default TemplatesPage;
