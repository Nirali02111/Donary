import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";



@Injectable({
  providedIn: "root",
})
export class ToiremService {
  version = "v1/";
  TOIREM_MAIN_URL = "Toirem";

  SAVECHARGE_TRAN_URL = `${this.version}${this.TOIREM_MAIN_URL}/SaveChargeTran`;
  constructor(private http: HttpClient) {}

  saveChargeTrans(formData: any): Observable<any> {
    return this.http
      .post(this.SAVECHARGE_TRAN_URL, formData)
      .pipe((response) => {
        return response;
      });
  }
}