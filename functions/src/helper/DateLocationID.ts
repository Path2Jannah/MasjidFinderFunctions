import * as crypto from 'crypto';

/**
 * Creates a unique ID for salaah time entry.
 * @param {string} date - The current date
 * @param {string} location - The needed location
 * @return {string} The ID token.
 */
export function createUniqueID(date: string, location: string): string {
    // Format date
    const formattedDate: string = date.slice(0, 10);
  
    // Combine date and location components
    const combinedComponents: string = `${formattedDate}_${location}`;
  
    // Hash the combined components using SHA-256
    const uniqueID: string = crypto.createHash('sha256').update(combinedComponents).digest('hex');
  
    return uniqueID;
}
