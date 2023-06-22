import AxiosService from './services/AxiosService';

export class SalaahTimeRequests {
    private axiosService = AxiosService('http://api.aladhan.com/v1/timings')

    public async getSalaahTimesDailyCapeTown(date: string): Promise<any> {
        this.axiosService.get(
            `/${date}?latitude=-33.9249&longitude=18.4241`
            ).then((response: any) => {
                console.log(response);
                return response;
            })
            .catch((error: any) => {
                console.error(error)
                throw error;
            });
    }
}