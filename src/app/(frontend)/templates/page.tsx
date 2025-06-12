import NewTemplateForm from "@/components/templates/NewTemplateForm";

const TemplatesPage = () => {
  return (
    <div className="flex flex-col items-center w-[90%] max-w-[900px] px-6 py-20 mx-auto">
      <h2 className="mb-6 text-xl text-text-color">
        Create a template to easily and quickly set up <code>.env</code> files in your project.
        Choose a visibility option to keep the template private or share it within your
        organization.
      </h2>

      <NewTemplateForm />
    </div>
  );
};

export default TemplatesPage;
