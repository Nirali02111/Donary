import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderdeviceService {

  version = 'v1/';
  ORDER_DEVICE_MAIN_URL = 'Orderdevice';
  ORDER_DEVICE_UPDATE_DEVICE_OPTIONS_URL = `${this.version}${this.ORDER_DEVICE_MAIN_URL}/UpdateDeviceOptions`;
  ORDER_DEVICE_BULK_UPDATE_DEVICE_OPTIONS_URL = `${this.version}${this.ORDER_DEVICE_MAIN_URL}/BulkUpdateDeviceOptions`;

    constructor(private http: HttpClient) { }

    // UpdateDeviceOptions(pin:string, updatedBy:number, optionId:number)
    // {
    //   let url= this.ORDER_DEVICE_UPDATE_DEVICE_OPTIONS_URL+'?pin=' + pin+ '&updatedBy=' + updatedBy+ '&optionId=' + optionId
    //     return this.http.put(url,null).pipe(response => {
    //       return response;
    //     });
    //   }
    UpdateDeviceOptions(formData: any)
    {
        return this.http.put(this.ORDER_DEVICE_UPDATE_DEVICE_OPTIONS_URL,formData).pipe(response => {
          return response;
        });
      }
  bulkUpdateDeviceOptions(formData: any) {
    return this.http.put(this.ORDER_DEVICE_BULK_UPDATE_DEVICE_OPTIONS_URL, formData).pipe(response => {
      return response;
    });
  }
}
