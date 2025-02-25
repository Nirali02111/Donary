import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocationService {

    version = 'v1/';
    LOCATION_MAIN_URL = 'Location';
   LOCATION_GET_LIST_URL = `${this.version}${this.LOCATION_MAIN_URL}/GetLocations`;
   LOCATION_CARD_URL = `${this.version}${this.LOCATION_MAIN_URL}/GetLocationCard`;
   LOCATION_GET_URL = `${this.version}${this.LOCATION_MAIN_URL}/GetLocation`;
   LOCATION_SAVE_URL = `${this.version}${this.LOCATION_MAIN_URL}/Save`;
   LOCATION_DELETE_URL=`${this.version}${this.LOCATION_MAIN_URL}/DeleteLocation`;
   LOCATION_GET_REPORT_URL=`${this.version}${this.LOCATION_MAIN_URL}/GetLocationsReport`;


    constructor(private http: HttpClient) { }

    getLocationList(formdata: any): Observable<any> {
        return this.http.post(this.LOCATION_GET_LIST_URL,formdata).pipe(response => {
          return response;
        });
      }

    getLocationCard(formdata: any): Observable<any> {
        return this.http.post(this.LOCATION_CARD_URL, formdata).pipe(response => {
          return response;
        });
      }

      saveLocation(formdata: any): Observable<any> {
        return this.http.post(this.LOCATION_SAVE_URL, formdata).pipe(response => {
          return response;
        });
      }

    getLocation(locationId:number,eventGuid: string,macAddress:string): Observable<any> {
        return this.http.get(this.LOCATION_GET_URL + '?locationid=' + locationId + '&&eventGuId=' + eventGuid + "&&macAddress=" + macAddress).pipe(response => {
          return response;
        });
      }
    deleteLocation(locationId:number,eventGuid: string,macAddress:string,deletedBy:number): Observable<any> {
        return this.http.get(this.LOCATION_DELETE_URL + '?locationid=' + locationId + '&&eventGuId=' + eventGuid + "&&macAddress=" + macAddress + "&&deletedBy=" + deletedBy).pipe(response => {
          return response;
        });
      }
      getLocationsReport(formdata: any): Observable<any> {
        return this.http.post(this.LOCATION_GET_REPORT_URL, formdata).pipe(response => {
          return response;
        });
      }
}