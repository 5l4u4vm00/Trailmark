import { JWT, createAxios } from "@/api/HttpService";
import { getRouter } from "@/router";

// Initialise Axios
const http = createAxios({
  baseURL: `${import.meta.env.BASE_URL}api`,
});

// Configure JWT and try to initialise it from localStorage
// http.setJWT('/Auth/RefreshToken', JWT.refreshOnDelay);

export default http;
