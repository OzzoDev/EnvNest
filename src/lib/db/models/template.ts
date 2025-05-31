import { Template } from "@/types/types";
import { executeQuery } from "../db";

const template = {
  getPublic: async (): Promise<Template[]> => {
    return executeQuery<Template>(`
        SELECT * 
        FROM template
        WHERE visibility = 'public'             
    `);
  },
};

export default template;
