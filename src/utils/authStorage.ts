export const setTokenMemorySafe = (token: string) => {
  sessionStorage.setItem("accessToken", token);
};

export const getTokenMemorySafe = () => {
  return sessionStorage.getItem("accessToken");
};

export const clearTokenMemorySafe = () => {
  sessionStorage.removeItem("accessToken");
};
