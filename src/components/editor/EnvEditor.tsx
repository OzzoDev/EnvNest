import { useProjectStore } from "@/store/projectStore";

type EnvEditorProps = {};

const EnvEditor = () => {
  const secret = useProjectStore((state) => state.secret);

  console.log("secret: ", secret);

  console.log("Secret in env editor: ", secret ? secret.content.split("&&") : "");

  return <p>Env editor</p>;
};

export default EnvEditor;
