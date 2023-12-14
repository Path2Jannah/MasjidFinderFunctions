import AxiosService from "./services/AxiosService";

export class HadithRequest {
    private axiosService = new AxiosService("https://api.sunnah.com/v1/");
    private headers = {
        "X-API-Key": "SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk",
      };

    public async getHadith(): Promise<HadithCollection> {
        try {
            const res = await this.axiosService.get(
                "hadiths/random",
                this.headers,
            )
            return res.data
        } catch(error) {
            console.error("Error: ", error as string);
            throw error;
        }
    }
}