import axios from "axios";

/**
 * Create an Axios instance and return an HttpService for HTTP requests.
 * @param {import('axios').CreateAxiosDefaults} axiosConfig - Axios config object
 * @returns {HttpService} HttpService instance
 */
export function createAxios(axiosConfig) {
  return new HttpService(axiosConfig);
}

/**
 * HttpService — wraps Axios to handle HTTP requests.
 */
export default class HttpService {
  /**
   * The axios instance
   * @type {import('axios').AxiosInstance}
   */
  axios;

  /**
   * The JWT instance
   * @type {JWT}
   */
  jwt;

  constructor(axiosConfig) {
    this.axios = this.#initAxios(axiosConfig);
  }

  /**
   * Define a request.
   * @param {import('axios').AxiosRequestConfig} axiosRequestConfig - Axios request config
   * @returns {HttpRequest} HttpRequest instance
   */
  defineRequest(axiosRequestConfig) {
    return new HttpRequest(this.axios, axiosRequestConfig);
  }

  /**
   * Define a GET request.
   * @param {string} uri - Request URI
   * @param {import('axios').AxiosRequestConfig} axiosRequestConfig - Axios request config
   * @returns {HttpRequest} HttpRequest instance
   */
  defineGet(uri, axiosRequestConfig = {}) {
    return new HttpRequest(this.axios, {
      ...axiosRequestConfig,
      method: "get",
      url: uri,
    });
  }

  /**
   * Define a POST request.
   * @param {string} uri - Request URI
   * @param {import('axios').AxiosRequestConfig} axiosRequestConfig - Axios request config
   * @returns
   */
  definePost(uri, axiosRequestConfig = {}) {
    return new HttpRequest(this.axios, {
      ...axiosRequestConfig,
      method: "post",
      url: uri,
    });
  }

  /**
   * Configure JWT (JSON Web Token). Refresh is enabled once
   * HttpService.jwt.initToken() is called.
   * @param {string} refreshUri - The URI for token refreshing.
   * @param {function} refreshStrategy - The strategy function for token refreshing.
   * @returns {JWT} JWT instance
   */
  setJWT(refreshUri, refreshStrategy) {
    this.jwt = new JWT(refreshUri, refreshStrategy, this.axios);

    this.axios.interceptors.request.use((config) => {
      if (this.jwt.getToken()) {
        config.headers.Authorization = `Bearer ${this.jwt.getToken()}`;
      }
      return config;
    });

    return this.jwt;
  }

  /**
   * Initialise the axios instance.
   * @param {*} axiosConfig
   * @returns @type {import('axios').AxiosInstance}
   */
  #initAxios(axiosConfig) {
    const axiosInstance = axios.create(axiosConfig);

    // unwrap AxiosResponse to original response
    axiosInstance.interceptors.response.use((response) => {
      if (response.config.responseType === "blob") {
        return response;
      } else {
        return response.data;
      }
    });

    return axiosInstance;
  }
}

/**
 * HttpRequest — sends Axios requests with abort support.
 */
export class HttpRequest {
  #controller = new AbortController();

  /**
   * axios
   * @type {import('axios').AxiosInstance}
   */
  #axios;

  /**
   * axiosConfig
   * @type {import('axios').AxiosRequestConfig}
   */
  config;

  #restfulPattern = "{.+?}";
  #isRestful = false;

  /**
   * @param {import('axios').AxiosInstance} axios - Axios instance
   * @param {import('axios').AxiosRequestConfig} axiosRequestConfig - Axios request config
   */
  constructor(axios, axiosRequestConfig) {
    this.#axios = axios;
    this.config = axiosRequestConfig;
    this.#isRestful = new RegExp(this.#restfulPattern).test(
      axiosRequestConfig.url,
    );
  }

  /**
   * Send the request.
   * @param {Object} urlParams
   * @param {Object} bodyData
   * @returns
   */
  send = (urlParams, bodyData) => {
    const { signal } = this.#controller;

    if (import.meta.env.DEV) {
      signal.onabort = (event) => {
        console.log(
          `${this.config.url} aborted, reason: ${event.target.reason}`,
        );
      };
    }

    let config = {
      signal: this.#controller.signal,
      ...this.config,
      params: urlParams,
      data: bodyData,
    };

    if (this.#isRestful) {
      config = this.#replaceDynamicPath(config);
    }

    return this.#axios.request(config);
  };

  /**
   * Download a blob file.
   * @param {Object} urlParams
   * @param {Object} bodyData
   * @param {String?} fileName
   */
  download = async (urlParams, bodyData, fileName = null) => {
    const { signal } = this.#controller;

    if (import.meta.env.DEV) {
      signal.onabort = (event) => {
        console.log(
          `${this.config.url} aborted, reason: ${event.target.reason}`,
        );
      };
    }

    let config = {
      signal: this.#controller.signal,
      ...this.config,
      params: urlParams,
      data: bodyData,
      responseType: "blob",
    };

    if (this.#isRestful) {
      config = this.#replaceDynamicPath(config);
    }

    let result = await this.#axios.request(config);

    if (fileName === null) {
      fileName = extractFileName(result.headers["content-disposition"]);
    }

    let blob = result.data;
    let link = document.createElement("a");
    link.setAttribute("download", fileName);
    link.href = URL.createObjectURL(blob);
    link.click();

    /**
     * [regex reference](https://stackoverflow.com/questions/23054475/javascript-regex-for-extracting-filename-from-content-disposition-header)
     * @param {String} header [content-disposition](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)
     * @returns
     */
    function extractFileName(header) {
      const regex =
        /(filename[^;\n]*)=\s*(UTF-\d['"]*)?((['"]).*?[.]$\2|[^;\n]*)?/gi;

      let contentDispositionValue = {
        fileName: null,
        fileNameStar: null,
      };

      let m;
      while ((m = regex.exec(header)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        if (m[1] === "filename*") {
          contentDispositionValue.fileNameStar = decodeURI(m[3]);
          break;
        } else if (m[1] === "filename") {
          contentDispositionValue.fileName = m[3];
        }
      }

      return (
        contentDispositionValue.fileNameStar || contentDispositionValue.fileName
      );
    }
  };

  /**
   * Abort the request.
   */
  abort = (reason = "Manually aborted.") => {
    this.#controller.abort(reason);
    this.#controller = new AbortController();
  };

  /**
   * Move parameters from urlParams into the dynamic path.
   *
   * example: api/post/{id} --> api/post/1
   *
   * @param {import('axios').AxiosRequestConfig} requestConfig
   * @returns {import('axios').AxiosRequestConfig}
   */
  #replaceDynamicPath(requestConfig) {
    const regex = new RegExp(this.#restfulPattern, "g");
    let { url, params } = requestConfig;

    let m;
    while ((m = regex.exec(requestConfig.url)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match) => {
        // trim '{' and '}'
        const key = match.replace(new RegExp("[{}]", "g"), "");

        if (import.meta.env.DEV && params[key] == undefined) {
          console.warn(`value of '${key}' is undefined`);
        }

        url = url.replace(match, params[key]);
        delete params[key];
      });
    }

    requestConfig.url = url;
    requestConfig.params = params;

    return requestConfig;
  }
}

export class JWT {
  #axios;
  #refreshHandler;
  #refreshStrategy;
  #_401Interceptor;
  #token;

  constructor(refreshUri, refreshStrategy, axios) {
    this.#setRefreshHandler(refreshUri, refreshStrategy);
    this.#axios = axios;
  }

  /**
   * Initialise token refresh after a login API returns a JWT.
   * @param {string} accessToken - The access token to set.
   * @returns {Promise}
   */
  async initToken(accessToken) {
    this.#setToken(accessToken);

    try {
      // Refresh immediately after injecting the token, then enable auto-refresh (this.#refreshStrategy)
      await this.#refreshHandler.refresh();
      this.#refreshHandler = this.#refreshStrategy(this.#refreshHandler);
    } catch (error) {
      throw error;
    } finally {
      // After initialising the token, install the 401 interceptor.
      if (!this.#_401Interceptor) {
        this.#_401Interceptor = this.#axios.interceptors.response.use(
          (response) => response,
          this.#intercept401,
        );
      }
    }
  }

  #expiredToken = null;
  #intercept401 = async (error) => {
    const {
      response: { status, headers },
      config: {
        headers: { Authorization },
      },
    } = error;

    if (
      status === 401 && // expired tokens come back as 401
      headers["www-authenticate"]?.includes("JWT expired") && // only intercept JWT expired
      Authorization !== this.#expiredToken // fire on401Error at most once per Authorization value
    ) {
      this.#expiredToken = Authorization;
      await this.on401Error();
    }

    return Promise.reject(error);
  };

  /**
   * Handler invoked after JWT authentication fails.
   * @returns
   */
  on401Error = async () =>
    console.error(
      `JWT unauthorized. ( baseUrl: ${this.#axios.defaults.baseURL} )`,
    );

  /**
   * Try to read a JWT from localStorage and initialise token refresh.
   * @param {function} on401Error Handler invoked after JWT auth fails. e.g. redirect to login.
   * @returns
   */
  async tryInitToken(on401Error) {
    this.on401Error = on401Error || this.on401Error;
    let serverUrl = this.#axios.defaults.baseURL;
    let accessToken = window.localStorage.getItem(`${serverUrl}.jwt`);

    if (accessToken == null) {
      return false;
    }

    try {
      await this.initToken(accessToken);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set the JWT.
   * @param {string} accessToken - The access token to set.
   * @returns {void}
   */
  #setToken(accessToken) {
    this.#token = accessToken;
    let serverUrl = this.#axios.defaults.baseURL;
    window.localStorage.setItem(`${serverUrl}.jwt`, accessToken);
  }

  /**
   * Clear the JWT.
   * @returns {void}
   */
  clearToken() {
    this.#token = null;
    let serverUrl = this.#axios.defaults.baseURL;
    window.localStorage.removeItem(`${serverUrl}.jwt`);
  }

  /**
   * Get the JWT.
   * @returns {string|null} - The JWT token or null if it doesn't exist.
   */
  getToken() {
    return this.#token;
  }

  /**
   * Read a value from the JWT payload.
   * @param {string} key - The key to read from the JWT payload.
   * @returns {any|null} - The value associated with the key or null if the token is invalid or key doesn't exist.
   */
  readPayload(key) {
    if (!this.#token) return null;

    try {
      const [, payload] = this.#token.split(".");
      if (!payload) throw new Error("Invalid token format");

      const jsonPayload = this.#parsePayloadToJson(payload);

      return typeof key === "string" && key in jsonPayload
        ? jsonPayload[key]
        : jsonPayload;
    } catch (error) {
      console.error("Error parsing token:", error.message);
      return null;
    }
  }

  /**
   * Decode the JWT payload and parse it as JSON.
   * @param {string} payload - The payload of the JWT.
   * @returns {object} - The parsed payload object.
   * @throws {Error} - If the payload is invalid.
   */
  #parsePayloadToJson(payload) {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const binaryString = atob(base64);
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    const jsonString = new TextDecoder("utf-8").decode(bytes);
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      throw new Error("Failed to parse JWT payload");
    }
  }

  /**
   * Sets the refresh handler for token refreshing.
   * @param {string} refreshUri - The URI for token refreshing.
   * @param {function} refreshStrategy - The strategy function for token refreshing.
   * @returns {void}
   */
  #setRefreshHandler(refreshUri, refreshStrategy) {
    let refreshPromise = null;

    this.#refreshStrategy = refreshStrategy;
    this.#refreshHandler = {
      JWTInstance: this,
      refresh: async () => {
        refreshPromise = refreshPromise || this.#axios.post(refreshUri, null);

        try {
          const newToken = await refreshPromise;
          this.#setToken(newToken);
        } catch (error) {
          throw error;
        } finally {
          refreshPromise = null;
        }
      },
      axios: this.#axios,
    };
  }

  /**
   * Refresh the JWT on a recurring delay.
   * @param {object} refreshHandler - The refresh handler object.
   * @returns {object} - The updated refresh handler object.
   */
  static refreshOnDelay(refreshHandler) {
    const { refreshID, refresh, JWTInstance } = refreshHandler;
    if (refreshID) {
      clearTimeout(refreshID);
    }

    // Calculate delay in ms for token refresh based on token expiration time
    const expires = JWTInstance.readPayload("exp");
    const delay = expires * 1000 - Date.now();

    refreshHandler.refreshID = setTimeout(async () => {
      try {
        await refresh();
        JWT.refreshOnDelay(refreshHandler);
      } catch (error) {
        console.error("Error refreshing tokens:", error);
      }
    }, delay);

    return refreshHandler;
  }

  /**
   * On receiving 401, refresh the JWT and re-send the request.
   * @param {object} refreshHandler - The refresh handler object.
   * @returns {object} - The updated refresh handler object.
   */
  static refreshOn401(refreshHandler) {
    const { refresh, on401Interceptor, axios } = refreshHandler;

    if (on401Interceptor) {
      axios.interceptors.request.eject(on401Interceptor);
    }

    refreshHandler.on401Interceptor = axios.interceptors.response.use(
      (response) => response,
      async function (error) {
        const {
          config,
          response: { status },
        } = error;
        if (status === 401) {
          await refresh();
          return await axios.request(config);
        }
        return Promise.reject(error);
      },
    );

    return refreshHandler;
  }

  /**
   * (Not implemented) Refresh the JWT on receiving 200.
   * @param {object} refreshHandler - The refresh handler object.
   * @returns {void}
   */
  static refreshOn200(refreshHandler) {}
}
