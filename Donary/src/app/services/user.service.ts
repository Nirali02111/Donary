import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GoogleLoginModel } from "../models/google-login-model";

export interface PostUserBodyData {
  UserId: number;
  LoginUserId: number;
  Username: string;
  Password: string;
  Email: string;
  Firstname: string;
  Lastname: string;
  Title: string;
  Phone: string;
  PlanTypeId: number;
  EventGuid: string;
  lstPermissionModel: [
    {
      PermissionId: number;
      IsActive: boolean;
    }
  ];
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  version = "v1/";
  USERS_MAIN_URL = "user";

  GET_USERS_URL = `${this.version}${this.USERS_MAIN_URL}/GetUsers`;
  GET_USER_URL = `${this.version}${this.USERS_MAIN_URL}/GetUser`;
  SAVE_USERS_URL = `${this.version}${this.USERS_MAIN_URL}/SaveUser`;
  SAVE_USERS_GOOGLE_URL = `${this.version}${this.USERS_MAIN_URL}/SaveGoogleToken`;
  DELETE_USERS_URL = `${this.version}${this.USERS_MAIN_URL}/DeleteUser`;
  GETINVITE_USERS_URL = `${this.version}${this.USERS_MAIN_URL}/GetInvite`;
  INVITE_USERS_URL = `${this.version}${this.USERS_MAIN_URL}/InviteUser`;
  constructor(private http: HttpClient) {}

  getUsersList(eventGuid: string): Observable<any> {
    return this.http
      .get(this.GET_USERS_URL, {
        params: {
          eventGuid,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getUser(userId: string, eventGuid: string): Observable<any> {
    return this.http
      .get(this.GET_USER_URL + "?userId=" + userId + "&&eventGuid=" + eventGuid)
      .pipe((response) => {
        return response;
      });
  }

  saveUser(formData: any) {
    return this.http.post(this.SAVE_USERS_URL, formData).pipe((response) => {
      return response;
    });
  }
  public userGoogle: GoogleLoginModel = new GoogleLoginModel();
  saveGoogleToken(userGoogle: any) {
    return this.http
      .post(this.SAVE_USERS_GOOGLE_URL, userGoogle)
      .pipe((response) => {
        return response;
      });
  }
  DeleteUser(userId: any) {
    return this.http
      .delete(this.DELETE_USERS_URL + "?userId=" + userId)
      .pipe((response) => {
        return response;
      });
  }

  getInvite(inviteId: string): Observable<any> {
    return this.http
      .get(this.GETINVITE_USERS_URL + "?inviteId=" + inviteId)
      .pipe((response) => {
        return response;
      });
  }

  inviteUser(formData: any) {
    return this.http.post(this.INVITE_USERS_URL, formData).pipe((response) => {
      return response;
    });
  }
}
