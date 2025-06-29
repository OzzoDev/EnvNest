import { auditLogRouter } from "./routes/audit-log-router";
import { collaboratorRouter } from "./routes/collaborator-router";
import { environmentRouter } from "./routes/environment-router";
import { githubRouter } from "./routes/github-router";
import { organizationRouter } from "./routes/organization-router";
import { profileRouter } from "./routes/profile-router";
import { projectRouter } from "./routes/project-router";
import { secretRouter } from "./routes/secret-router";
import { templateRouter } from "./routes/template-router";
import { router } from "./trpc";

export const appRouter = router({
  profile: profileRouter,
  project: projectRouter,
  secret: secretRouter,
  environment: environmentRouter,
  auditLog: auditLogRouter,
  template: templateRouter,
  github: githubRouter,
  collaborator: collaboratorRouter,
  organization: organizationRouter,
});

export type AppRouter = typeof appRouter;
