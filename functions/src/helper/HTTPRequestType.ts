/**
 * Asserts that the incomining HTTP request is the correct method.
 * @param {string} incoming - The incoming data
 * @param {HTTPType} type - The needed type
 * @return {boolean} true if the validation passes, otherwise false
 */
export function validateHttpRequest(incoming: string, type: HTTPType): boolean {
  if (incoming !== type) {
    return false;
  } else {
    return true;
  }
}

export enum HTTPType {
    GET = "GET",
    POST = "POST",
}
