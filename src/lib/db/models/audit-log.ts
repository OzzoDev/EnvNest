import { AuditLogTable } from "@/types/types";
import { executeQuery } from "../db";

const auditLogs = {
  get: async () => {
    return await executeQuery<AuditLogTable>(`
        S                     
    `);
  },
  create: async () => {},
};

export default auditLogs;
