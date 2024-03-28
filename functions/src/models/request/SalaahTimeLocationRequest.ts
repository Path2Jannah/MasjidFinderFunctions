export interface SalaahTimeLocationRequest {
    location: string,
    date: string
}

/**
 * Validates a SalaahTimeLocationRequest.
 *
 * @param {any} obj - The object to validate.
 * @return {boolean} `true` if the object is valid, `false` otherwise.
 */
export function isSalaahTimeLocationRequestBody(obj: any):
 obj is SalaahTimeLocationRequest {
  return (
    typeof obj.location === "string" &&
    typeof obj.date === "string"
  );
}
