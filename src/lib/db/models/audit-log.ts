import { AuditLogTable } from "@/types/types";
import { executeQuery } from "../db";

const auditLogs = {
  get: async () => {
    return await executeQuery<AuditLogTable>(`
        SELECT * 
        FROM audit_log                      
    `);
  },
  create: async () => {},
};

export default auditLogs;
