import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, Subject, throwError } from "rxjs";
import { catchError, filter, map, switchMap, take } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { AuthService } from "../services/auth.service";
import { LocalstoragedataService } from "./local-storage-data.service";
import { PageRouteVariable } from "./page-route-variable";
import { WINDOW } from "./windows-provider.service";

declare var $: any;
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;
  private messagedisplayed: boolean;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  landingPage_url: string = PageRouteVariable.Auth_Login_url;
  constructor(
    private router: Router,
    private localstoragedataService: LocalstoragedataService,
    private authService: AuthService,
    @Inject(WINDOW) private window: Window
  ) {}

  getHostname() : string {
    return this.window.location.hostname;
}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accesstoken = this.localstoragedataService.getloginUserAccessToken();
    let payaccesstoken = this.localstoragedataService.getloginPayUserAccessToken()
    const baseUrl = environment.baseUrl;
    const mapUrl = "https://donarywebapicoreqa.azurewebsites.net/";
    const mapRequest = "v1/shullSeating/GetMapPdf";
    const webUrl=this.getHostname();
    //if current url is not login url
    // refreshtoken
    if (
      request.url.toLowerCase().indexOf("login") === -1 &&
      request.url.toLowerCase().indexOf("product") === -1 &&
      request.url.toLowerCase().indexOf("verify") === -1 &&
      request.url.toLowerCase().indexOf("saveuser") === -1 &&
      request.url.toLowerCase().indexOf("apigateways") === -1 &&
      request.url.toLowerCase().indexOf("getstates") === -1 &&
      request.url.toLowerCase().indexOf("organization/add") === -1 &&
      request.url.toLowerCase().indexOf("donatepage") === -1 &&
      request.url.toLowerCase().indexOf("validate") === -1 &&
      request.url.toLowerCase().indexOf("i18n")=== -1 &&
      request.url.toLowerCase().indexOf("getinvite")=== -1 

    ) {
      if ((accesstoken == null || accesstoken === "") && payaccesstoken==null) {
        this.redirectToHome();
      }
      if((request.url.toLowerCase().indexOf("savepledgepay") != -1 || request.url.toLowerCase().indexOf("getunpaidpledges") != -1 || request.url.toLowerCase().indexOf("schedulerepeattypes") !=-1) && payaccesstoken)
      {
        request = this.addTokenHeader(request, payaccesstoken);
      }
      else if(accesstoken) {
        request = this.addTokenHeader(request, accesstoken);
      }
    }
    if (!request.headers.has("Content-Type")) {
      request = request.clone({
        setHeaders: {
          //'content-type': 'application/json'
        },
      });
    }

    request = request.clone({
      headers: request.headers.set("Accept", "application/json"),
    });
    if (request.url.toLowerCase().indexOf("shippingapi") === -1) {
      request = request.clone({ url: `${baseUrl}${request.url}` });
    } else {
      request = request.clone({
        setHeaders: {
          "Content-Type": "application/xml",
          Accept: "text/xml",
        },
      });
    }
    if (request.url.indexOf("shullSeating/GetMapPdf") != -1) {
      request = request.clone({ url: `${mapUrl}${mapRequest}` });
    }

    if (request.url.toLowerCase().indexOf("i18n") != -1) {
      request = request.clone({
        url:request.url.includes('heb')?'/assets/i18n/heb.json':'/assets/i18n/en.json',
      });
    }
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
        this.messagedisplayed = false;
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const tokenexpired = error.headers.get("Token-Expired");

          if (tokenexpired != null && tokenexpired !== "") {
            return this.handle401Error(request, next);
          } else {
            this.redirectToHome();
          }
        } else {
        }
        return throwError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.refreshTokenInProgress) {
      this.refreshTokenInProgress = true;
      this.refreshTokenSubject.next(null);

      const accessToken =
        this.localstoragedataService.getloginUserAccessToken();
      const refreshToken =
        this.localstoragedataService.getloginUserRefreshToken();
      const loginUserID = this.localstoragedataService.getLoginUserId();

      const modelData: any = {
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        LoginUserID: loginUserID,
      };

      if (accessToken)
        return this.authService.refreshToken(modelData).pipe(
          switchMap((data: any) => {
            this.refreshTokenInProgress = false;

            this.localstoragedataService.setAccessToken(data.accessToken);
            this.localstoragedataService.setRefreshToken(data.refreshToken);
            this.localstoragedataService.setTokenExpiryTime(data.expiresIn);

            this.refreshTokenSubject.next(data.accessToken);

            return next.handle(this.addTokenHeader(request, data.accessToken));
          }),
          catchError((err) => {
            this.refreshTokenInProgress = false;
            this.redirectToHome();
            return throwError(err);
          })
        );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }

  private redirectToHome() {
    this.localstoragedataService.setLoginUserDataandToken(null, "0");
    this.router.navigate([this.landingPage_url]);
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: "Bearer " + token,
      },
    });
  }
}
