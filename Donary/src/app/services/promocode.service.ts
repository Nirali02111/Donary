import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PromocodeService {
  version = 'v1/';
  PROMOCODE_MAIN_URL = 'Promocode';
  PROMOCODE_VALIDATE_URL = `${this.version}${this.PROMOCODE_MAIN_URL}/v1/Validate`;
  constructor(private http: HttpClient) { }
  getValidate(promoCode: string): Observable<any> {
    return this.http.get(this.PROMOCODE_VALIDATE_URL + '?promoCode=' + promoCode).pipe(response => {
      return response;
    });
  }
}
