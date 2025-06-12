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
  getOwnAndPublic: async (profileId: number): Promise<TemplateTable[]> => {
    return await executeQuery<TemplateTable>(
      `
        SELECT * 
        FROM template
        WHERE visibility = 'public' OR profile_id = $1            
    `,
      [profileId]
    );
  },
  create: async (
    profileId: number,
    name: string,
    template: string,
    visibility: TemplateVisibility
  ): Promise<TemplateTable | null> => {
    return (
      (
        await executeQuery<TemplateTable>(
          `
            INSERT INTO template (profile_id, name, template, visibility)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (name) DO NOTHING
            RETURNING *; 
          `,
          [profileId, name, template, visibility]
        )
      )[0] ?? null
    );
  },
};

export default template;
