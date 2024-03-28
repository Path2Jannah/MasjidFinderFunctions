/**
 * A function to delay any ongoing opperation.
 *
 * Example:
 *
 * await delay(2000) => We will pause the opperation for 2s.
 * @param {number} ms The time in milliseconds to delay.
 * @return {Promise} Nothing we just carry on with the opperation.
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
