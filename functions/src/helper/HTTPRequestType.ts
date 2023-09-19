import {HttpsError} from "firebase-functions/v1/auth";

/**
 * Asserts that the incomining HTTP request is the correct method.
 * @param {string} incoming - The incoming data
 * @param {HTTPType} type - The needed type
 * @return {void} if the validation passes otherwise a HttpsError
 * will be thrown
 */
export function validateHttpRequest(incoming: string, type: HTTPType): void {
  if (incoming !== type) {
    throw new HttpsError("unimplemented", `Incorrect request type.
    Should be ${type}`);
  }
}

export enum HTTPType {
    GET = "GET",
    POST = "POST",
}
