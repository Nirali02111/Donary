import { formatDate } from "@angular/common";
import { Inject, LOCALE_ID, Pipe, PipeTransform } from "@angular/core";
import { LocalstoragedataService } from "./local-storage-data.service";
import * as moment_tz from "moment-timezone";

type formatType =
  | "short"
  | "medium"
  | "medium-sort"
  | "long"
  | "long-medium"
  | "name"
  | "name-long"
  | "describe"
  | string;

/**
 *
 * Donary Date Format based on User login Currency Event.
 *
 * Total 5 Types of Format is used. `short`, `medium`, `medium-sort`, `long`, `long-medium`, `name`, `name-long`, `describe` and custom string format if needed
 *
 * For USA:
 *
 * `short`, will be `MM/dd/yyyy`
 * (Example: `08/07/2024`)
 *
 * `medium`: will be `MM/dd/yyyy hh:mm:ss`
 * (Example: `08/07/2024 03:08:04`)
 *
 * `medium-sort`: will be `MM/dd/yyyy hh:mm`
 * (Example: `08/07/2024 03:08`)
 *
 * `long`: will be `MM/dd/yyyy hh:mm:ss a`
 * (Example: `08/07/2024 03:08:04 PM`)
 *
 * `long-medium`: will be `MM/dd/yyyy hh:mm a`
 * (Example: `08/07/2024 03:08 PM`)
 * 
 * `name`: will be `MMMM dd, yyyy`
 * (Example: `August 08 2024`)
 * 
 * `name-long`: will be `MMMM dd, yyyy hh:mm a`
 * (Example: `August 08, 2024 03:08 PM`)
 * 
 * `describe`: will be `EEEE, MMMM d, y, hh:mm:ss a`
 * (Example: `Thursday, August 8, 2024, 08:25:21 PM`)
 * 
 * For Non USA Location:
 *
 * `short`, will be `dd/MM/yyyy`
 * (Example: `07/08/2024`)
 *
 * `medium`: will be `dd/MM/yyyy hh:mm:ss`
 * (Example: `07/08/2024 03:08:04`)
 *
 * `medium-sort`: will be `dd/MM/yyyy hh:mm`
 * (Example: `07/08/2024 03:08`)
 *
 * `long`: will be `dd/MM/yyyy hh:mm:ss a`
 * (Example: `07/08/2024 03:08:04 PM`)
 *
 * `long-medium`: will be `dd/MM/yyyy hh:mm a`
 * (Example: `07/08/2024 03:08 PM`)
 * 
 * `name`: will be `dd MMMM, yyyy`
 * (Example: `08 August, 2024`)
 * 
 * `name-long`: will be `dd MMMM, yyyy hh:mm a`
 * (Example: `08 August, 2024 03:08 PM`)
 * 
 * `describe`: will be `EEEE, dd MMMM, yyyy hh:mm:ss a`
 * (Example: `Thursday, 08 August, 2024 08:25:21 PM`)
 */

@Pipe({
  name: "donaryDateFormat",
  standalone: true,
  pure: true,
})
export class DonaryDateFormatPipe implements PipeTransform {
  /**
   * For USA default Format
   */
  private forUSA = "MM/dd/yyyy";

  /**
   * For other location Other then USA
   */
  private otherThenUSA = "dd/MM/yyyy";

  /**
   * naming For USA default Format
   */
  private nameForUSA = "MMMM dd, yyyy";

  /**
   * naming format For other location Other then USA
   */
  private nameForOther = "dd MMMM, yyyy";

  constructor(
    private localStorageDataService: LocalstoragedataService,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  /**
   *
   * @param value
   * @param formatType The format, "short" | "medium" | "medium-sort" | "long" | "long-medium" | "name" | "name-long" | "describe" | string
   * @param fromTimeZone
   * @returns
   */
  transform(
    value: string | number | Date | null,
    formatType: formatType = "short",
    fromTimeZone: boolean = false
  ): string {
    try {
      if (!value) {
        return;
      }

      const eventCurrency = this.localStorageDataService.getUserEventCurrency();

      const format = this.getFormate(eventCurrency, formatType.trim());

      const _timezoneOffset = fromTimeZone
        ? this.getTimeZoneOffset(eventCurrency)
        : undefined;

      const v = formatDate(value, format, this.locale, _timezoneOffset);

      return v;
    } catch (error) {}
  }

  private getTimeZoneOffset(eventCurrency: string) {
    const timezone = this.getTimeZone(eventCurrency);
    return moment_tz().tz(timezone).utcOffset().toString();
  }

  private getTimeZone(eventCurrency: string) {
    if (eventCurrency == "USD") {
      return "America/New_York";
    }

    if (eventCurrency == "CAD") {
      return "America/Toronto";
    }

    if (eventCurrency == "EUR") {
      return "Europe/Paris";
    }

    if (eventCurrency == "GBP") {
      return "Europe/London";
    }

    if (eventCurrency == "ILS") {
      return "Asia/Jerusalem";
    }

    return "America/New_York";
  }

  private getFormate(eventCurrency: string, formatType: formatType) {
    const isUSA = eventCurrency === "USD";

    if (formatType === "short") {
      if (isUSA) {
        return this.forUSA;
      }

      return this.otherThenUSA;
    }

    if (formatType === "medium" || formatType === "medium-sort") {
      const time = this.getTimeFormat(formatType === "medium-sort");

      if (isUSA) {
        return `${this.forUSA} ${time}`;
      }

      return `${this.otherThenUSA} ${time}`;
    }

    if (formatType === "long" || formatType === "long-medium") {
      const time = this.getTimeFormat(formatType === "long-medium");

      if (isUSA) {
        return `${this.forUSA} ${time} a`;
      }

      return `${this.otherThenUSA} ${time} a`;
    }

    if (formatType === "name") {
      if (isUSA) {
        return this.nameForUSA;
      }

      return this.nameForOther;
    }

    if (formatType === "name-long") {

      const time = this.getTimeFormat(true);

      if (isUSA) {
        return `${this.nameForUSA}, ${time} a`;
      }

      return `${this.nameForOther}, ${time} a`;
    }

    if (formatType === "describe") {

      const time = this.getTimeFormat(true);

      if (isUSA) {
        return `EEEE, ${this.nameForUSA}, ${time} a`;
      }

      return `EEEE, ${this.nameForOther}, ${time} a`;
    }

    return formatType;
  }


  /**
   * Get Hour Minutes and seconds format
   * 
   * 
   * @param withoutSeconds boolean - if parameter is true it will return with seconds format
   * @returns 
   */
  private getTimeFormat(withoutSeconds: boolean) {
    const defaultFormat = `hh:mm`;
    return withoutSeconds ? defaultFormat : `${defaultFormat}:ss`;
  }
}
