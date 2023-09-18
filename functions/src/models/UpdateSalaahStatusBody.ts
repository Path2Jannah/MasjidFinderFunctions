interface SalaahStatus {
    fajr: boolean,
    thur: boolean,
    asr: boolean,
    magrieb: boolean,
    isha: boolean,
}

interface UserSalaahStatus {
    date: SalaahStatus
}

export interface UpdateSalaahStatusRequest {
    userID: string,
    salaahHistory: UserSalaahStatus,
}

/**
 * Validates a UpdateSalaahStatusRequest.
 *
 * @param {any} obj - The object to validate.
 * @return {boolean} `true` if the object is valid, `false` otherwise.
 */
export function isUpdateSalaahStatusRequest(obj: any):
 obj is UpdateSalaahStatusRequest {
  return (
    typeof obj.userID === "string" &&
    typeof obj.salaahHistory.date.fajr === "boolean" &&
    typeof obj.salaahHistory.date.thur === "boolean" &&
    typeof obj.salaahHistory.date.asr === "boolean" &&
    typeof obj.salaahHistory.date.magrieb === "boolean" &&
    typeof obj.salaahHistory.date.isha === "boolean"
  );
}
