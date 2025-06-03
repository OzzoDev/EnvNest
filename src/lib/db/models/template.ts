import { TemplateTable } from "@/types/types";
import { executeQuery } from "../db";

const template = {
  getPublicById: async (templateId: number): Promise<TemplateTable | null> => {
    const result = await executeQuery<TemplateTable>(
      `
        SELECT * 
        FROM template
        WHERE id = $1 AND visibility = 'public'           
    `,
      [templateId]
    );

    if (result.length === 0) {
      return null;
    }

    return result[0];
  },
  getPublic: async (): Promise<TemplateTable[]> => {
    return await executeQuery<TemplateTable>(`
        SELECT * 
        FROM template
        WHERE visibility = 'public'             
    `);
  },
};

export default template;
