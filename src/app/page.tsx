import { getProfiles } from "@/api/db/profile";
import { Profile } from "@/types/types";

const Home = async () => {
  const profiles = await getProfiles();

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
