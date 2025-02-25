import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface GetOrganizationContactResponse {
  contactId: number;
  organizationId: number;
  contactName: string;
  houseNum: number;
  streetName: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  contactEmail: string;
  contactPhone: string;
}

export interface EventBrandingDocs {
  color: string;
  eventBrandingDocumentId: number;
  eventId: number;
  filePath: string;
  fileTypeId: number;
}

export interface GetOrganizationResponse {
  organizationID: number;
  organizationName: string;
  taxID: string;

  addressInfo: string;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  validUntil: string;
  isDisable: boolean;
  organizationNameJewish: string;
  cityStateZip: string;
  phone: string;
  eventName: string;
  eventGuid: string;
  timeZone: string;
  eventPIN: number;
  apiType: number;
  eventID: number;
  currency: string;
  ccAPIkey: string;
  gateway: string;
  pin: string;
  ccMerchant: string;
  organizationContactModel: Array<GetOrganizationContactResponse>;
  eventBrandingDocumentModel: Array<EventBrandingDocs>;
}

@Injectable({
  providedIn: "root",
})
export class OrganizationService {
  private version = "v1/";
  private ORGANIZATION_MAIN_URL = "Organization";

  private GET_ORGANIZATION_CONTACT_URL = `${this.version}${this.ORGANIZATION_MAIN_URL}/GetOrgContact`;
  private ADD_ORGANIZATION_URL = `${this.version}${this.ORGANIZATION_MAIN_URL}/Add`;
  private GET_ORGANIZATION_URL = `${this.version}${this.ORGANIZATION_MAIN_URL}/GetOrganization`;
  constructor(private http: HttpClient) {}

  getOrganizationContact(
    OrganizationId: string
  ): Observable<GetOrganizationContactResponse> {
    return this.http
      .get<GetOrganizationContactResponse>(this.GET_ORGANIZATION_CONTACT_URL, {
        params: { OrganizationId },
      })
      .pipe((response) => {
        return response;
      });
  }

  AddOrganization(formData: any) {
    return this.http
      .post(this.ADD_ORGANIZATION_URL, formData)
      .pipe((response) => {
        return response;
      });
  }

  getOrganization(OrganizationId: string): Observable<GetOrganizationResponse> {
    return this.http
      .get<GetOrganizationResponse>(
        this.GET_ORGANIZATION_URL + "?OrganizationId=" + OrganizationId
      )
      .pipe((response) => {
        return response;
      });
  }
  getOrganizationAdmin(OrganizationId: string,eventGuid:string): Observable<GetOrganizationResponse> {
    return this.http
      .get<GetOrganizationResponse>(
        this.GET_ORGANIZATION_URL + "?OrganizationId=" + OrganizationId+"&&eventGuid=" +eventGuid
      )
      .pipe((response) => {
        return response;
      });
  }
}
