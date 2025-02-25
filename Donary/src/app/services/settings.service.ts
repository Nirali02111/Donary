import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  version = "v1/";
  SETTINGS_MAIN_URL = "Settings";
  GET_SETTINGS_URL = `${this.version}${this.SETTINGS_MAIN_URL}/GetSettings`;
  SAVE_SETTINGS_URL=`${this.version}${this.SETTINGS_MAIN_URL}/Save`;
  constructor(private http: HttpClient) { }
  getSettings(eventGuId): Observable<any> {
    return this.http.get(this.GET_SETTINGS_URL+ "?eventGuId=" + eventGuId).pipe((response) => {
      return response;
    });
  }
  saveSettings(formData: any): Observable<any> {
    return this.http.post(this.SAVE_SETTINGS_URL, formData).pipe((response) => {
      return response;
    });
  }
}
