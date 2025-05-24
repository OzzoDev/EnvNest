import { profileRouter } from "./routes/profile-router";
import { router } from "./trpc";

export const appRouter = router({
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
