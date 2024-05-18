/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

import * as fs from "fs";

export interface JsonObject {
    [key: string]: any;
}

export function saveJsonToFile(jsonBlob: JsonObject, filePath: string): void {
  try {
    const jsonString = JSON.stringify(jsonBlob, null, 2); // 2 is the number of spaces for indentation

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      // If the file doesn't exist, create it
      fs.writeFileSync(filePath, "", {flag: "wx"});
    }

    // Write JSON data to the file
    fs.writeFileSync(filePath, jsonString);
    console.log(`JSON data saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving JSON data to ${filePath}:`, error);
  }
}
