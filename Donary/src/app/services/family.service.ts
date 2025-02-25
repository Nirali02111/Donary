import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  version = 'v1/';
  FAMILY_MAIN_URL = 'Family';
  FAMILY_SAVE_URL = `${this.version}${this.FAMILY_MAIN_URL}/SaveFamily`;
  FAMILY_GET_URL = `${this.version}${this.FAMILY_MAIN_URL}/GetFamily`;
  FAMILY_DELETE_URL = `${this.version}${this.FAMILY_MAIN_URL}/DeleteFamily`;
  constructor(private http: HttpClient) { }

  Save(formdata: any): Observable<any> {
    return this.http.post(this.FAMILY_SAVE_URL,formdata).pipe(response => {
      return response;
    });
  }

  Get(accountId:number): Observable<any> {
    return this.http.get(this.FAMILY_GET_URL+ '?accountId=' + accountId).pipe(response => {
      return response;
    });
  }

  Delete(formdata:any) {
    return this.http.request('delete', this.FAMILY_DELETE_URL, { body: formdata }).pipe(response => { 
      return response;
    });    
  }

}
