import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";



@Injectable({
  providedIn: "root",
})
export class EventService {
  version = "v1/";
  EVENT_MAIN_URL = "Event";

  GETSETTING_URL = `${this.version}${this.EVENT_MAIN_URL}/GetSettings`;
  constructor(private http: HttpClient) {}

  GetSetting(eventGuId :any,isStartUp:boolean): Observable<any> {
    return this.http
      .get(this.GETSETTING_URL+ "?eventGuid=" +eventGuId+"&&isStartUp=" +isStartUp)
      .pipe((response) => {
        return response;
      });
  }
}
