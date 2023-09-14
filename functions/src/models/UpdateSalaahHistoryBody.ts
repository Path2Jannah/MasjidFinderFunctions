interface SalaahHistory {
    date: string,
    fajr: boolean,
    thur: boolean,
    asr: boolean,
    magrieb: boolean,
    isha: boolean,
}

export interface UpdateDailySalaahHistoryBody {
    userID: string,
    salaahHistory: SalaahHistory,
}
