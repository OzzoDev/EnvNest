import axios from "axios";

const api = {
  fetchAllPages: async (
    url: string,
    headers: {
      Authorization: string;
      Accept: string;
    }
  ) => {
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
  },
};

export default api;
