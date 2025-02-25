import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MinyanimService {
    version = "v1/";
    MINYANIM = "Minyanim";
    MINYANIM_LIST_URL = `${this.version}${this.MINYANIM}/GetRooms`;
    MINYANIM_SAVEROOMS_URL = `${this.version}${this.MINYANIM}/SaveRoom`;
    MINYANIM_DELETEROOM_URL = `${this.version}${this.MINYANIM}/DeleteRoom`;
    GET_TIMES_URL = `${this.version}${this.MINYANIM}/GetTimes`;
    GET_GROUPS_URL = `${this.version}${this.MINYANIM}/GetGroups`;
    GET_ROOMS_URL = `${this.version}${this.MINYANIM}/GetRooms`;
    Save_Times_URL = `${this.version}${this.MINYANIM}/SaveTimes`;
    Delete_Times_URL = `${this.version}${this.MINYANIM}/DeleteTimes`;

  constructor(
    private http: HttpClient
  ) { }
  getRoomsList(macaddress:string, eventGuid: string,): Observable<any> {
    return this.http.get(this.MINYANIM_LIST_URL, {
      params: { macaddress, eventGuid},
    }).pipe(response => {
      return response;
    });
  }

  save(formdata: any): Observable<any> {
    return this.http
      .post(this.MINYANIM_SAVEROOMS_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  delete(roomId){
    return this.http.put(this.MINYANIM_DELETEROOM_URL + '?roomId=' + roomId,null).pipe(response => {
      return response;
    });
  }
  getTimesList(eventGuid: string,): Observable<any> {
    return this.http
      .get(this.GET_TIMES_URL+
        "?eventGuid=" +
        eventGuid)
      .pipe((response) => {
        return response;
      });
  }
  GetGroups(eventGuid: string) {
    return this.http
      .get(
        this.GET_GROUPS_URL +
          "?eventGuid=" +
          eventGuid
      )
      .pipe((response) => {
        return response;
      });
  }
  GetRooms(eventGuid: string,macaddress: string,roomId:string) {
    return this.http
      .get(
        this.GET_ROOMS_URL +
          "?eventGuid=" +
          eventGuid+"&&macaddress="+macaddress+"&&roomId="+roomId
      )
      .pipe((response) => {
        return response;
      });
  }
  saveTimes(formData: any): Observable<any> {
    return this.http
      .post(this.Save_Times_URL, formData)
      .pipe((response) => {
        return response;
      });
  }

  deleteTimes(data){
    return this.http.put(this.Delete_Times_URL, data).pipe((response) => {
      return response;
    });

  }
}

