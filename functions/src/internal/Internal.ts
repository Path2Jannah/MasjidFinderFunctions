export class Internal {
    constructor() {

    }

    public async createAreaGeolocationTable(listOfAreas) {
        const areaInLowercase = await getAreaList();
        const resultJson: { areas: AreaGeolocation[] } = {areas: []};
      await Promise.all(
          areaInLowercase.map(async (str) => {
            try {
              const location = await geolocationService.getCoordinates(str);
              const areaJson: AreaGeolocation = {
                area: str,
                lat: location.latitude,
                long: location.longitude,
              };
              resultJson.areas.push(areaJson);
            } catch (error) {
              console.error(error as string);
              const areaJson: AreaGeolocation = {
                area: str,
                lat: 1,
                long: 1,
              };
              resultJson.areas.push(areaJson);
            }
          })
      );
    return resultJson
    }
}