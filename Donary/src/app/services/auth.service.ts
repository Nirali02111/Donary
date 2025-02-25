import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  version = 'v1/';
  version2 = 'v2/';
  AUTHENTICATION_URL = `${this.version}authentication`;
  AUTHENTICATION_URL_2 =`${this.version2}authentication`;
  LOGIN_URL = this.AUTHENTICATION_URL_2 + '/login';
  REFRESH_TOKEN_URL = this.AUTHENTICATION_URL + '/refreshtoken';
  TEST_URL = this.AUTHENTICATION_URL + '/test';
  GOOGLE_LOGIN_URL=this.AUTHENTICATION_URL + '/GoogleLogin';
  SEND_FORGOT_PASSWORD_EMAIL_URL=this.AUTHENTICATION_URL+'/SendForgotPasswordEmail';
  RESET_PASSWORD_URL=this.AUTHENTICATION_URL+'/ResetPassword';
  SET_PASSWORD_URL=this.AUTHENTICATION_URL+'/SetPassword';
  UPLOAD_IMAGE_URL=this.AUTHENTICATION_URL+'/UploadImageToBlob';
  RECAPTCHA_URL = this.AUTHENTICATION_URL_2+'/login';
  constructor(private http: HttpClient) { }

  login(formdata: any): Observable<any> {
    return this.http.post(this.LOGIN_URL, formdata).pipe(response => {
      return response;
    });
  }


  recaptcha(formdata: any): Observable<any> {
    return this.http.post(this.LOGIN_URL, formdata).pipe(response => {
      return response;
    });
  }  
  refreshToken(modelData: any) {
    return this.http.post(this.REFRESH_TOKEN_URL, modelData).pipe(response => {
      return response;
    });

  }

  googleLogin(modelData: any) {
    return this.http.post(this.GOOGLE_LOGIN_URL, modelData).pipe(response => {
      return response;
    });

  }
  sendForgotPasswordEmail(email: string) {
    return this.http.get(this.SEND_FORGOT_PASSWORD_EMAIL_URL+"?email="+email).pipe(response => {
      return response;
    });
  }
  resetPassword(modelData: any) {
    return this.http.post(this.RESET_PASSWORD_URL, modelData).pipe(response => {
      return response;
    });
  }

  setPassword(modelData: any) {
    return this.http.post(this.SET_PASSWORD_URL, modelData).pipe(response => {
      return response;
    });
  }

  uploadImageToBlob(formdata: any): Observable<any> {
    return this.http.post(this.UPLOAD_IMAGE_URL, formdata).pipe(response => {
      return response;
    });
  }
}
