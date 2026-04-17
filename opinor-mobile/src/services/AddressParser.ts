/**
 * Utility to parse complex address strings and extract components like City.
 * Assumes a format like "City, Street address" or "Street address, City".
 * If no comma is present, returns the whole string as the city for safety.
 */
export const getCityFromAddress = (address: string | undefined): string => {
  if (!address) return '';
  
  const parts = address.split(',');
  if (parts.length < 2) return address.trim();
  
  // Usually, "City, Morocco" or "123 St, City".
  // Let's assume the first part is often the city/area in our app's context (Casablanca, ...).
  return parts[0].trim();
};

/**
 * Extracts and removes the city from the address to get the street/specific part.
 */
export const getStreetFromAddress = (address: string | undefined): string => {
  if (!address) return '';
  
  const parts = address.split(',');
  if (parts.length < 2) return '';
  
  return parts.slice(1).join(',').trim();
};
