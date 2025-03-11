import { adminAxiosInstance } from "../../../utils/axios";

export async function search(entity, query) {
  try {
    const response = await adminAxiosInstance.get(`/api/search/${entity}?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (err) {
    throw new Error(`Search failed: ${err.response?.statusText || err.message}`);
  }
}
