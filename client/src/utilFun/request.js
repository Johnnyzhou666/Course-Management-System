
// General-purpose HTTP request helper function
// Used to send GET / POST / PUT / DELETE requests with optional authentication and form data
export async function request(
  url,
  method = "GET",
  data = null,
  isForm = false
) {
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      ...(token && { Authorization: "Bearer " + token }),
    },
  };
 // Set JSON content type if not sending form data
  if (!isForm) {
    options.headers["Content-Type"] = "application/json";
  }
// Attach request body if data is provided
  if (data) {
    if (isForm) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  }
  // Send HTTP request
  const res = await fetch(url, options);

  let loginoutcome;
  try {
    loginoutcome = await res.json();
  } catch (err) {
    throw new Error("Server did not return valid JSON.");
  }

  if (!res.ok) {
    throw new Error(loginoutcome?.message || "Server error");
  }

  if (loginoutcome.success === false) {
    throw new Error(loginoutcome.message || "Operation failed");
  }

  return loginoutcome;
}
