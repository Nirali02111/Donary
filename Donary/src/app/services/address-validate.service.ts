import { Injectable } from "@angular/core";

interface CityStateZipObj {
  city: string;
  state: string;
  zip: string;
}

@Injectable({
  providedIn: "root",
})
export class AddressValidateService {
  constructor() {}

  protected getAddressXMLNode(id : string,address: string, city: string, state: string, zip:string) :string {
    return `<Address ID="${id}"><Address1></Address1><Address2>${address}</Address2><City>${city}</City><State>${state}</State><Zip5>${zip}</Zip5><Zip4></Zip4></Address>`
  }


  protected formateAddressValue(address: string): string {
    return address.replace("#", "");
  }

  protected formateCityStateZipValue(cityStateZip: string): CityStateZipObj {
    let addressArray = cityStateZip.split(" ");
    if (addressArray.length == 3) {
      return {
        city: addressArray[0],
        state: addressArray[1],
        zip: addressArray[2],
      };
    }

    if (addressArray.length > 3) {
      let state = addressArray[addressArray.length - 2];
      let zip = addressArray[addressArray.length - 1];

      addressArray.pop();
      addressArray.pop();

      let city = addressArray.join(" ");

      return {
        city: city,
        state: state,
        zip: zip,
      };
    }

    if (addressArray.length < 3) {
      return {
        city: addressArray[0] || "",
        state: addressArray[1] || "",
        zip: "",
      };
    }
  }

  public validateAddress(address: string): string {
    if (!address) {
      return "";
    }
    return this.formateAddressValue(address);
  }

  public validateCityStateAndZip(cityStateZip: string): CityStateZipObj {
    if (!cityStateZip) {
      return {
        city: "",
        state: "",
        zip: "",
      };
    }
    return this.formateCityStateZipValue(cityStateZip);
  }


  public getSimpleAddressXMLNode(address: string, city: string, state: string, zip:string) :string {
    return this.getAddressXMLNode("1", address, city, state, zip)
  }

  public getUniqAddressXMLNode(id: string, address:string, city: string, state: string, zip:string) {
    return this.getAddressXMLNode(id, address, city, state, zip)
  }

  public getAddressValidateRequestPayload(xmlsNodes: string): string {
    return `<AddressValidateRequest USERID="812DONAR5245">${xmlsNodes}</AddressValidateRequest>`;
  }
}
