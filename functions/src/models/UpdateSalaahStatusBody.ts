interface SalaahStatus {
    date: string,
    fajr: boolean,
    thur: boolean,
    asr: boolean,
    magrieb: boolean,
    isha: boolean,
}

interface UserSalaahStatus {
    [date: string]: SalaahStatus
}

export interface UpdateSalaahStatusBody {
    userID: string,
    salaahHistory: UserSalaahStatus,
}
