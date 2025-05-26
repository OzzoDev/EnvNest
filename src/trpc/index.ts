import { profileRouter } from "./routes/profile-router";
import { projectRouter } from "./routes/project-router";
import { router } from "./trpc";

export const appRouter = router({
  profile: profileRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
