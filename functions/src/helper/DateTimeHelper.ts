import {Format, Locale} from "./DateEnums";
import moment from "moment-timezone";

/**
 * Helper class for all things relating to date and time.
 */
export class DateTimeHelper {
  /**
     * Get the current date.
     *
     * @param {Locale} locale - The specific locale we want to generate with.
     * @param {string} timezone -
     * The specific timezone we want to generate with.
     * @param {Format} format -
     * The specific format we want to generate with.
     * @return {string} The current date.
     */
  public getDate(
      locale:Locale,
      timezone:string,
      format:Format
  ): string {
    moment.tz.setDefault("GMT");
    return moment().tz(timezone).locale(locale).format(format);
  }
}

export default DateTimeHelper;
