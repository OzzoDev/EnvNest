"use client";

import { trpc } from "@/trpc/client";
import { Profile } from "@/types/types";

const Home = () => {
  const { data: profiles } = trpc.profile.getAll.useQuery();

  return (
    <div>
      <h1>Profiles: </h1>
      <ul>
        {profiles?.map((profile: Profile) => (
          <li key={profile.id}>{profile.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
