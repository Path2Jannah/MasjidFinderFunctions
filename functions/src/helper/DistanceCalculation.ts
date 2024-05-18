/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

/**
 * Calculates the distance (in kms) between point A and B using earth's radius as the spherical surface
 * @param pointA Coordinates from Point A
 * @param pointB Coordinates from Point B
 * Based on https://www.movable-type.co.uk/scripts/latlong.html
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radius = 6371; // Earth radius in km

  // convert latitude and longitude to radians
  const deltaLatitude = (lat2 - lat1) * Math.PI / 180;
  const deltaLongitude = (lon2 - lon1) * Math.PI / 180;

  const halfChordLength = Math.cos(
      lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(deltaLongitude/2) * Math.sin(deltaLongitude/2) +
        Math.sin(deltaLatitude/2) * Math.sin(deltaLatitude/2);

  const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLength), Math.sqrt(1 - halfChordLength));

  return radius * angularDistance;
}
