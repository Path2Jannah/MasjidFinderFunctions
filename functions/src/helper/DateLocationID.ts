/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/* eslint-disable indent */
import {Buffer} from "buffer";

/**
 * Creates a unique ID for salaah time entry.
 * @param {string} date - The current date
 * @param {string} location - The needed location
 * @return {string} The ID token.
 */
export function createUniqueID(date: string, location: string): string {
  const jsonStringToEncode = {"date": date, "location": location};
  const jsonString = JSON.stringify(jsonStringToEncode);
  const buffer = Buffer.from(jsonString, "utf-8");
  const encodedJsonString = buffer.toString("base64");
  return encodedJsonString;
}
