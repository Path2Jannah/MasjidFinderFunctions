interface SalaahHistory {
    [date: string]: {
      fajr: boolean;
      dhuhr: boolean;
      asr: boolean;
      maghrib: boolean;
      isha: boolean;
    };
  }

  interface UserData {
    userID: string;
    salaahHistory: SalaahHistory;
  }

/**
* This function is to validate that the date is given in the correct format.
* @param {string} dateString - The input date from the client.
* @return {boolean} true if the input data is valid, otherwise false.
*/
function isValidDateFormat(dateString: string): boolean {
// Define a regular expression pattern to match the date format (DD-MM-YYYY)
  console.log("Validation on: ", dateString);
  const dateFormatPattern = /^\d{2}-\d{2}-\d{4}$/;
  return dateFormatPattern.test(dateString);
}

/**
 * This function is to validate the data from the client.
 * @param {any} data - The input data from the client.
 * @return {boolean} true if the input data is UserData, otherwise false.
 */
export function validateSalaahHistoryRequest(data: any): data is UserData {
  console.log("Validation on: ", data);
  console.log("Validation on userID: ", data.userID);
  console.log("Validation on salaahHistory object: ", data.salaahHistory);
  if (
    typeof data === "object" &&
    data !== null &&
    "userID" in data &&
    "salaahHistory" in data &&
    typeof data.userID === "string" &&
    typeof data.salaahHistory === "object" &&
      Object.keys(data.salaahHistory).every((date) => {
        const entry = data.salaahHistory[date];
        console.log("Validation on: ", entry.fajr);
        console.log("Validation on: ", entry.dhuhr);
        console.log("Validation on: ", entry.asr);
        console.log("Validation on: ", entry.maghrib);
        console.log("Validation on: ", entry.isha);

        return (
          typeof entry === "object" &&
          typeof entry.fajr === "boolean" &&
          typeof entry.dhuhr === "boolean" &&
          typeof entry.asr === "boolean" &&
          typeof entry.maghrib === "boolean" &&
          typeof entry.isha === "boolean" &&
          isValidDateFormat(date) // Check if the date format is valid
        );
      })
  ) {
    return true;
  } else {
    return false;
  }
}
