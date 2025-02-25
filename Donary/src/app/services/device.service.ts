import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {

    version = 'v1/';
    DEVICE_MAIN_URL = 'Device'; 
    DEVICESETTING_MAIN_URL ="DeviceSettings"          
   Device_GET_CARD_URL = `${this.version}${this.DEVICE_MAIN_URL}/GetDeviceCard`; 
   DEVICESETTING_SAVE_URL =`${this.version}${this.DEVICESETTING_MAIN_URL}/SaveDeviceSetting `;
  DEVICESETTING_GET_URL =`${this.version}${this.DEVICESETTING_MAIN_URL}/GetDeviceSettings`;
    constructor(private http: HttpClient) { }          

      getDeviceCard(formdata: any): Observable<any> {
        return this.http.post(this.Device_GET_CARD_URL, formdata).pipe(response => {
          return response;
        });
      }

      saveDeviceSetting(formdata: any): Observable<any> {
        return this.http.post(this.DEVICESETTING_SAVE_URL, formdata).pipe(response => {
          return response;
        });
      }

      getDeviceSettingById(DeviceID: number) {
        return this.http.get(this.DEVICESETTING_GET_URL + '?deviceId=' + DeviceID ).pipe(response => {
        return response;
          });
       }
}