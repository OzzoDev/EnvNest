import NewTemplateForm from "@/components/templates/NewTemplateForm";
import TemplateList from "@/components/templates/TemplateList";

const TemplatesPage = () => {
  return (
    <div className="flex flex-col-reverse lg:grid grid-cols-[2fr_8fr] gap-y-20 pt-6 px-6 lg:px-20">
      <div>
        <h4 className="text-lg text-text-color">Your templates</h4>
        <TemplateList />
      </div>

      <div className="flex flex-col items-center lg:px-20">
        <h2 className="mb-16 mt-12 text-xl text-text-color">
          Create a template to easily and quickly set up <code>.env</code> files in your project.
          Choose a visibility option to keep the template private or share it within your
          organization.
        </h2>
        <h3 className="mb-20 self-start text-destructive">
          Warning: Do not include any sensitive or secret values in the template, as its content is
          not encrypted and can be viewed in plain text.
        </h3>
        <NewTemplateForm />
      </div>
    </div>
  );
};

export default TemplatesPage;
