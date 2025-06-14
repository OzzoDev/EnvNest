import { TemplateTable, TemplateVisibility } from "@/types/types";
import { executeQuery } from "../db";

const template = {
  getOwnAndPublicById: async (
    profileId: number,
    templateId: number
  ): Promise<TemplateTable | null> => {
    const result = await executeQuery<TemplateTable>(
      `
        SELECT * 
        FROM template
        WHERE id = $1 AND visibility = 'public' OR profile_id = $2          
    `,
      [templateId, profileId]
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
  update: async (
    profileId: number,
    templateId: number,
    name?: string,
    template?: string,
    visibility?: TemplateVisibility
  ): Promise<TemplateTable | null> => {
    const entries = Object.entries({ name, template, visibility }).filter(
      ([_, value]) => value !== undefined
    );
    const setClause = entries.map(([key], i) => `${key} = $${i + 1}`).join(", ");
    const values = entries.map(([_, value]) => value);

    const templateIdIndex = values.length + 1;
    const profileIdIndex = values.length + 2;

    try {
      return (
        (
          await executeQuery<TemplateTable>(
            `
              UPDATE template
              SET ${setClause}
              WHERE id = $${templateIdIndex} AND profile_id = $${profileIdIndex}
              RETURNING *;
            `,
            [...values, templateId, profileId]
          )
        )[0] ?? null
      );
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "code" in err) {
        const errorCode = (err as { code?: string }).code;
        if (errorCode === "23505") {
          return null;
        }
      }
      throw err;
    }
  },
  delete: async (profileId: number, templateId: number): Promise<TemplateTable | null> => {
    return (
      (
        await executeQuery<TemplateTable>(
          `
      DELETE FROM template
      WHERE id = $1 AND profile_id = $2
      RETURNING *;      
    `,
          [templateId, profileId]
        )
      )[0] ?? null
    );
  },
};

export default template;
