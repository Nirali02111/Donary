import { Injectable } from "@angular/core";

export interface MagneticStripeCardData {
  isSwipe: boolean;
  cardNumber: string;
  expDate: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: "root",
})
export class CreditCardService {
  constructor() {}

  protected sixTeenMask: string = "0000-0000-0000-0000";
  protected fifTeenMask: string = "0000-0000-0000-000";
  protected amexMask: string = "0000-000000-00000";
  protected fourTeenMask: string = "0000-000000-000099";

  getDefaultMask(isFifteen: boolean = false): string {
    return isFifteen ? this.fifTeenMask : this.sixTeenMask;
  }

  getAmexMask() {
    return this.amexMask;
  }

  getDinersMask(isFourteen: boolean = false) {
    return isFourteen ? this.fourTeenMask : this.sixTeenMask;
  }

  luhnCheck(cardNo: string): boolean {
    var s = 0;
    var doubleDigit = false;
    for (var i = cardNo.length - 1; i >= 0; i--) {
      var digit = +cardNo[i];
      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      s += digit;
      doubleDigit = !doubleDigit;
    }
    return s % 10 == 0;
  }

  // valid only for 16 digits
  oldluhnCheck(sixteenDigitString) {
    var numSum = 0;
    var value;
    for (var i = 0; i < 16; ++i) {
      if (i % 2 == 0) {
        value = 2 * sixteenDigitString[i];
        if (value >= 10) {
          value = Math.floor(value / 10) + (value % 10);
        }
      } else {
        value = +sixteenDigitString[i];
      }
      numSum += value;
    }
    return numSum % 10 == 0;
  }

  parseMagneticStrip(cardstringVal: string): MagneticStripeCardData {
    //  cardstringVal = '%B4263982640269299^FISCH/JOEL^24062011906875870000000000000000?;4263982640269299=240620119067941700000?+?'

    // %B8628241406803648^ORG/MATBIA^28123214321987?;8628241406803648=2812321432187?'
    // %B8628243785214868^ORG/MATBIA^28123214321987?;?+?
    const details1 = cardstringVal.split("^");
    if (details1.length === 0) {
      return {
        isSwipe: false,
        cardNumber: "",
        expDate: "",
        firstName: "",
        lastName: "",
      };
    }

    // console.log(details1)

    try {
      let cardNumber = details1[0];
      cardNumber = cardNumber.substring(2);

      const names = details1[1].split("/");
      const firstName = names[1];
      const lastName = names[0];

      /*
    const details2 = details1[2].split(";");
    const details2Second = details2[1].split("=");

    let expDate = details2Second[1];
    expDate = expDate.substring(0, expDate.length - 1);
    expDate = expDate.substring(2, 4) + "/" + expDate.substring(0, 2);*/

      let expDate = details1[2];
      expDate = expDate.substring(0, expDate.length - 1);
      expDate = expDate.substring(2, 4) + "/" + expDate.substring(0, 2);

      return {
        isSwipe: true,
        cardNumber,
        expDate,
        firstName,
        lastName,
      };
    } catch (error) {
      return {
        isSwipe: false,
        cardNumber: "",
        expDate: "",
        firstName: "",
        lastName: "",
      };
    }
  }

  private cardsList = [
    {
      name: "VISA",
      pattern: [4],
      mask: `${this.sixTeenMask}`,
      CVV: "000",
    },
    {
      name: "MASTERCARD",
      pattern: [[51, 55], [2221, 2229], [223, 229], [23, 26], [270, 271], 2720],
      mask: `${this.sixTeenMask}`,
      CVV: "000",
    },
    {
      name: "AMERICAN_EXPRESS",
      pattern: [34, 37],
      mask: `${this.amexMask}`,
      CVV: "0000",
    },
    {
      name: "DINER",
      pattern: [36, 309, [300, 305], [38, 39]],
      mask: `0000-000000-0000||${this.sixTeenMask}`,
      CVV: "000",
    },

    {
      name: "DISCOVER_CARD",
      pattern: [6011, [622126, 622925], [644, 649], 65],
      mask: `${this.sixTeenMask}`,
      CVV: "000",
    },
    {
      name: "MATBIA_CARD",
      pattern: [86],
      mask: `${this.sixTeenMask}`,
      CVV: "0000",
    },
    {
      name: "OJC_CARD",
      pattern: [],
      mask: `${this.sixTeenMask}`,
      CVV: "000",
    },
    {
      name: "DONOR_FUND_CARD",
      pattern: [659999],
      mask: `${this.sixTeenMask}`,
      CVV: "000",
    },
    {
      name: "PLEDGE_CARD",
      pattern: [],
      mask: `${this.sixTeenMask}`,
      CVV: "000",
    },
  ];

  // https://github.com/polvo-labs/card-type/blob/master/src/cards.js
  identifyCard(card): { name: string; mask: string; CVV: string } {
    const bin = this.getBin(card);
    const detectedTypes = [];

    this.cardsList.forEach((card) => {
      card.pattern.forEach((pattern) => {
        if (this.checkCard(bin, pattern)) {
          const { pattern, ...restCard } = card;
          detectedTypes.unshift(restCard);
        }
      });
    });

    return detectedTypes[0] || "";
  }

  private getBin(value) {
    return value.toString().replace(/\D/g, "").substr(0, 6);
  }

  private checkCard(bin, pattern: number | number[]) {
    return Array.isArray(pattern)
      ? this.checkRange(bin, pattern)
      : this.checkPattern(bin, pattern);
  }

  private checkPattern(bin, pattern) {
    if (pattern instanceof RegExp) {
      return pattern.test(bin);
    }

    pattern = pattern.toString();
    return bin.substr(0, pattern.length) === pattern;
  }

  private checkRange(bin, [min, max]: number[]) {
    const length = min.toString().length;
    const value = parseInt(bin.substr(0, length));

    return value >= min && value <= max;
  }
}
