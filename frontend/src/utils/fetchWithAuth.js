// lib/fetchWithAuth.js (or any utility folder/file you want)
export async function fetchWithAuth(url, options = {}) {
    // 1. Grab the token from wherever you store it (e.g. localStorage)
    const token = localStorage.getItem("adminToken");
    
    // 2. Build headers
    const authHeaders = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  
    // 3. Merge into the final fetch options
    const finalOptions = {
      ...options,
      headers: authHeaders
    };
  
    // 4. Perform the request
    const response = await fetch(url, finalOptions);
  
    // 5. If not ok, handle or throw an error
    if (!response.ok) {
      // We can throw an error with status & text:
      const msg = await response.text();
      throw new Error(`Request failed (${response.status}): ${msg}`);
    }
    
    // 6. Return the parsed JSON (or you can return the raw response if needed)
    return response.json();
  }
  