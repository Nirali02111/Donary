import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SeatMapModel } from "../models/seats-model";

export interface SeatLocationObj {
  locationId: number;
  locationName: string;
}

export interface SeatMapLocationObj {
  locationId: number;
  mapLocationId: number;
  mapName: string;
}

export interface SeatSessionObj {
  seasonId: number;
  seasonName: string;
}

export interface RateListObj {
  aisleAdditionalFee: number;
  mapLocationId: number;
  mapLocationName: string;
  rateId: number;
  seatPrice: number;
  sectionId: number;
  sectionName: string;
}

export interface SectionObj {
  sectionName: string;
  sectionID: number;
  mapLocationID: number;
}

@Injectable({
  providedIn: "root",
})
export class SeatService {
  version = "v1/";
  SEAT_MAIN_URL = "shullSeating";

  GET_SEAT_URL = `${this.version}${this.SEAT_MAIN_URL}/GetAll`;
  SAVE_SEATSALE_URL = `${this.version}${this.SEAT_MAIN_URL}/SaveSeatSale`;
  GETSEAT_URL = `${this.version}${this.SEAT_MAIN_URL}/GetSeat`;
  UPDATE_SEATSALE_URL = `${this.version}${this.SEAT_MAIN_URL}/UpdateSeatSale`;
  GETSEAT_SEASONS_URL = `${this.version}${this.SEAT_MAIN_URL}/GetSeasons`;
  GETSEAT_LOCATIONS_URL = `${this.version}${this.SEAT_MAIN_URL}/GetLocations`;
  CREATESEASON_URL = `${this.version}${this.SEAT_MAIN_URL}/CreateSeason`;
  
  GET_MAP_LOCATIONS_URL = `${this.version}${this.SEAT_MAIN_URL}/GetMapLocations`;

  GET_RATE_LIST_URL = `${this.version}${this.SEAT_MAIN_URL}/GetRateList`;
  SAVE_RATE_URL = `${this.version}${this.SEAT_MAIN_URL}/SaveRate`;

  DELETE_RATE_URL = `${this.version}${this.SEAT_MAIN_URL}/DeleteRate`;
  GET_SECTION_LIST_URL = `${this.version}${this.SEAT_MAIN_URL}/GetSections`;
  PRINT_SEAT_STICKERS = `${this.version}${this.SEAT_MAIN_URL}/PrintSeatStickers`;
  private GET_MAP_PDF_URL = `${this.version}${this.SEAT_MAIN_URL}/GetMapPdf`;

  constructor(private http: HttpClient) {}

  getSeatList(formData: any): Observable<any> {
    return this.http.post(this.GET_SEAT_URL, formData).pipe((response) => {
      return response;
    });
  }

  saveSeatSale(formData: any) {
    return this.http.post(this.SAVE_SEATSALE_URL, formData).pipe((response) => {
      return response;
    });
  }

  getSeat(formData: any): Observable<any> {
    return this.http.post(this.GETSEAT_URL, formData).pipe((response) => {
      return response;
    });
  }

  updateSeatSale(formData: any) {
    return this.http
      .post(this.UPDATE_SEATSALE_URL, formData)
      .pipe((response) => {
        return response;
      });
  }

  getSeasonsDropdown(eventGuId: string): Observable<Array<SeatSessionObj>> {
    return this.http
      .get<Array<SeatSessionObj>>(
        this.GETSEAT_SEASONS_URL + "?eventGuId=" + eventGuId
      )
      .pipe((response) => {
        return response;
      });
  }


  getRateList(eventGuId: string): Observable<Array<RateListObj>> {
    return this.http
      .get<Array<RateListObj>>(this.GET_RATE_LIST_URL, {
        params: {
          eventGuId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  saveRate(formData: any): Observable<string> {
    return this.http
      .post<string>(this.SAVE_RATE_URL, formData)
      .pipe((response) => {
        return response;
      });
  }

  getLocationsDropdown(
    eventGuId: string,
    seasonId?: number
  ): Observable<Array<SeatLocationObj>> {
    let queryParams: any = {
      eventGuId: eventGuId,
    };

    if (seasonId) {
      queryParams = {
        ...queryParams,
        seasonId: seasonId,
      };
    }

    return this.http
      .get<Array<SeatLocationObj>>(this.GETSEAT_LOCATIONS_URL, {
        params: {
          ...queryParams,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getMapLocationsDropdown(
    eventGuId: string, seasonId?: string
  ): Observable<Array<SeatMapLocationObj>> {
    let queryParams: any = {
      eventGuId: eventGuId,
     
    };
 // Include seasonId in queryParams only if it is provided
 if (seasonId) {
  queryParams.seasonId = seasonId;
}
    return this.http
      .get<Array<SeatMapLocationObj>>(this.GET_MAP_LOCATIONS_URL, {
        params: {
          ...queryParams,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  createSeason(formData: any) {
    return this.http.post(this.CREATESEASON_URL, formData).pipe((response) => {
      return response;
    });
  }

  getSectionList(apiPayload: {
    eventGuId: string;
    mapLocationID?: any;
  }): Observable<Array<SectionObj>> {
    return this.http
      .post<Array<SectionObj>>(this.GET_SECTION_LIST_URL, apiPayload)
      .pipe((response) => {
        return response;
      });
  }

  deleteRate(rateId: any): Observable<string> {
    return this.http
      .delete<string>(this.DELETE_RATE_URL, {
        params: {
          rateId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  printSeatStickers(formData: any): Observable<any> {
    return this.http.post(this.PRINT_SEAT_STICKERS, formData).pipe((response) => {
      return response;
    });
  }

  getMapPdf(mapObj: SeatMapModel){
   return this.http.post(this.GET_MAP_PDF_URL,mapObj);
  }
}
