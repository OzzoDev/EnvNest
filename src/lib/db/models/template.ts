import { TemplateTable, TemplateVisibility } from "@/types/types";
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
  create: async (
    name: string,
    template: string,
    visibility: TemplateVisibility
  ): Promise<TemplateTable | null> => {
    return (
      (
        await executeQuery<TemplateTable>(
          `
            INSERT INTO template (name, template, visibility)
            VALUES ($1, $2, $3)
            ON CONFLICT (name) DO NOTHING
            RETURNING *; 
          `,
          [name, template, visibility]
        )
      )[0] ?? null
    );
  },
};

export default template;
