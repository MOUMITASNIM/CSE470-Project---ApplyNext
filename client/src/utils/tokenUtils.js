/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Get the expiry part from token
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return true; // Consider invalid tokens as expired
  }
};

/**
 * Gets the role from a JWT token
 * @param {string} token - The JWT token to check
 * @returns {string|null} The role or null if invalid
 */
export const getRoleFromToken = (token) => {
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload.role || null;
  } catch (error) {
    console.error('Token role check error:', error);
    return null;
  }
};

/**
 * Checks if a token is an admin token
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is valid and has admin role
 */
export const isAdminToken = (token) => {
  const role = getRoleFromToken(token);
  return role === 'admin';
};
