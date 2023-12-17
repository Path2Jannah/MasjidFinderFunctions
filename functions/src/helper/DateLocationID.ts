/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/* eslint-disable indent */


import * as crypto from "crypto";

/**
 * Creates a unique ID for salaah time entry.
 * @param {string} date - The current date
 * @param {string} location - The needed location
 * @return {string} The ID token.
 */
export function createUniqueID(date: string, location: string): string {
  const formattedDate: string = date.slice(0, 10);
  const combinedComponents = `${formattedDate}_${location}`;
  const uniqueID: string = crypto.createHash("sha256").update(combinedComponents).digest("hex");
  return uniqueID;
}
