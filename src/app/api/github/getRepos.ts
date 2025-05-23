import axios from "axios";

export const fetchAllPages = async (url: string, headers: any) => {
  let results: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await axios.get(`${url}?per_page=${perPage}&page=${page}`, {
      headers,
    });

    results = results.concat(response.data);

    if (response.data.length < perPage) {
      break;
    }

    page++;
  }

  return results;
};

export const getRepos = async (accessToken: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    };

    const userRepos = await fetchAllPages("https://api.github.com/user/repos", headers);

    const orgResponse = await axios.get("https://api.github.com/user/orgs", { headers });
    const orgs = orgResponse.data;

    const orgReposResults = await Promise.all(
      orgs.map((org: any) =>
        fetchAllPages(`https://api.github.com/orgs/${org.login}/repos`, headers)
      )
    );

    const orgRepos = orgReposResults.flat();

    return [...userRepos, ...orgRepos];
  } catch (err) {
    console.log(err);
    throw err;
  }
};
