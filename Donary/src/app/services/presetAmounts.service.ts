import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";



@Injectable({
  providedIn: "root",
})
export class PresetAmountService {
  version = "v1/";
  PRESETAMOUNT_MAIN_URL = "PresetAmounts";

  GET_PRESETAMOUNT_URL = `${this.version}${this.PRESETAMOUNT_MAIN_URL}/Get`;
  SAVE_PRESETAMOUNT_URL = `${this.version}${this.PRESETAMOUNT_MAIN_URL}/Save`;  
  constructor(private http: HttpClient) {}

  getPresetAmount(): Observable<any> {
    return this.http
      .get(this.GET_PRESETAMOUNT_URL)
      .pipe((response) => {
        return response;
      });
  }

  saveSavePresetAmount(formData: any) {
    return this.http.post(this.SAVE_PRESETAMOUNT_URL, formData).pipe((response) => {
      return response;
    });
  }  
}
