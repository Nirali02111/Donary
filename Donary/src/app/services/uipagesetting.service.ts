import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UIPageSettingService {
  version = 'v1/';
  PAGESETTING_MAIN_URL = 'UIPageSetting';
  PAGESETTING_SAVE_URL = `${this.version}${this.PAGESETTING_MAIN_URL}/Save`;
  PAGESETTING_GET_URL = `${this.version}${this.PAGESETTING_MAIN_URL}/Get`;
  constructor(private http: HttpClient) { }

  Save(formdata: any): Observable<any> {
    return this.http.post(this.PAGESETTING_SAVE_URL,formdata).pipe(response => {
      return response;
    });
  }

  Get(formdata: any): Observable<any> {
    return this.http.post(this.PAGESETTING_GET_URL,formdata).pipe(response => {
      return response;
    });
  }
}
