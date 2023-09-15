export enum PredefinedLocations {
    CAPE_TOWN = "CAPE_TOWN",
}

/**
 * Helper function for mapping the location received from
 * the user to one of the PredefinedLocations that is supported.
 *
 * @param {string} input - The input location.
 *
 * @return {PredefinedLocations | undefined} Either a PredefinedLocations
 * or undefined if the input string doesn't match a supported location.
 */
export function mapToLocation(input: string): PredefinedLocations | undefined {
  switch (input) {
    case "CAPE_TOWN":
      return PredefinedLocations.CAPE_TOWN;
    default:
      return undefined;
  }
}
