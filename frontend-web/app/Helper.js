import axios from "axios";
import BASE_API_URL from "./api-config";

// --------------------Api Helpers Function -------------------
export async function genericPostApi(endpoint, params) {
  try {
    const { data } = await axios.post(`${BASE_API_URL}${endpoint}`, params, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Post request", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericGetApi(endpoint, params) {
  try {
    const { data } = await axios.get(`${BASE_API_URL}${endpoint}`, {
      params: params,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Get request");
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericPostApiWithFile(endpoint, formData) {
  try {
    const { data } = await axios.post(`${BASE_API_URL}${endpoint}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Post request with file", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericPutApiWithFile(endpoint, formData) {
  try {
    const { data } = await axios.put(`${BASE_API_URL}${endpoint}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Put request with file", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericPutApi(endpoint, params) {
  try {
    const { data } = await axios.put(`${BASE_API_URL}${endpoint}`, params, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Put request", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export async function genericDeleteApi(endpoint, params) {
  try {
    const { data } = await axios.delete(`${BASE_API_URL}${endpoint}`, {
      data: params,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Delete request", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}

export const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
};

export const getYouTubeId = (url) => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};
