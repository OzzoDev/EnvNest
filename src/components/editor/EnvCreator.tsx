import { EnvironmentMap } from "@/types/types";
import Combobox from "../utils/Combobox";
import { ENVIRONMENTS } from "@/config";
import { useState } from "react";
import { Button } from "../ui/button";

const EnvCreator = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentMap | null>(null);

  return (
    <>
      <form>
        <p className="font-medium text-text-color mb-4">Create .env file</p>
        <div className="flex gap-x-4">
          <Combobox<EnvironmentMap, "label", "value", "value">
            data={ENVIRONMENTS}
            value={selectedEnvironment}
            labelKey="label"
            valueKey="value"
            mapKey="value"
            searchMessage="Search environments..."
            selectMessage="Select an enviornment"
            emptyMessage="No environment found"
            setValue={setSelectedEnvironment}
          />
          {selectedEnvironment && (
            <Button type="submit" variant="secondary">
              Create
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default EnvCreator;
