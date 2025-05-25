import { aesRouter } from "./routes/aes-router";
import { profileRouter } from "./routes/profile-router";
import { router } from "./trpc";

export const appRouter = router({
  profile: profileRouter,
  aes: aesRouter,
});

export type AppRouter = typeof appRouter;
