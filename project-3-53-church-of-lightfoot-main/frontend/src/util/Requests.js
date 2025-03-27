const BASE_URL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_BASE_URL : "http://localhost:8000";

export const executePost = async (url, body) => {
  const request = await fetch(`${BASE_URL}/${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const response = request.status;
  return response;
};

export const executeGet = async (url) => {
  const request = await fetch(`${BASE_URL}/${url}`);
  const response = await request.json();
  return response;
};

export const executePut = async (url, body) => {
  const response = await fetch(`${BASE_URL}/${url}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.status;
};

export const executeDelete = async (url, body) => {
  const response = await fetch(`${BASE_URL}/${url}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.status;
};
