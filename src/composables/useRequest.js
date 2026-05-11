import { HttpRequest } from "@/api/HttpService";
import { computed, ref } from "vue";

/**
 * Vue composable for handling a request defined via HttpService.defineRequest.
 * @param {HttpRequest} axiosRequest - An HttpRequest instance from HttpService.
 * @returns Reactive properties and methods that wrap the request.
 */
export function useRequest(axiosRequest, options = { defaultData: null }) {
  if (!(axiosRequest instanceof HttpRequest)) {
    throw new Error("Use HttpService.defineRequest() to define a request.");
  }

  const errorCallBack = new Set();
  const { defaultData } = options;
  const isLoading = computed(() => pengingPromises.value.size > 0);
  const isFinished = computed(
    () => !isLoading.value && data.value !== defaultData,
  );
  const data = ref(defaultData);
  const pengingPromises = ref(new Set());

  /**
   * Send the request.
   * @param {Object} urlParams
   * @param {Object} bodyData
   * @returns
   */
  async function send(urlParams, bodyData) {
    if (isLoading.value) {
      axiosRequest.abort("Resend request.");
      pengingPromises.value.clear();
    }

    let requestPromise = axiosRequest.send(urlParams, bodyData);
    pengingPromises.value.add(requestPromise);
    data.value = defaultData;

    try {
      const result = await requestPromise;
      data.value = result;
    } catch (error) {
      // Resend and abort will not throw an error
      if (error.code == "ERR_CANCELED") {
        return;
      }

      // If no errorCallBack is registered, just rethrow
      if (errorCallBack.size == 0) {
        throw error;
      }

      for (let callback of errorCallBack) {
        await callback(error);
      }
    } finally {
      pengingPromises.value.delete(requestPromise);
    }
  }

  /**
   * Register an errorCallBack.
   * @param {Function} callback
   */
  function onError(callback) {
    errorCallBack.add(callback);
  }

  return {
    isLoading,
    isFinished,
    data,
    send,
    stop: axiosRequest.abort,
    onError,
  };
}
