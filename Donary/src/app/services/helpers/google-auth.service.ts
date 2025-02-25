import { Injectable, Provider } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import jwt_decode from "jwt-decode";
import { environment } from "src/environments/environment";
import { DocumentRef, WindowRef } from "src/app/models/Platform";
import { Location } from "@angular/common";

abstract class APILoader {
  abstract load(): Promise<void>;
}



export interface SocialUser {
  email: string;
  jti: string;
}

@Injectable({
  providedIn: "root",
})
export class GoogleAuthService extends APILoader {
  protected _scriptLoadingPromise!: Promise<void>;
  protected _config!: any;
  protected _windowRef: WindowRef;
  protected _documentRef: DocumentRef;
  protected readonly _SCRIPT_ID: string = "donaryGoogleAuthApiScript";
  private readonly _socialUser$ = new BehaviorSubject<SocialUser | null>(null);
  private readonly _socialUserLogin$ = new BehaviorSubject<SocialUser | null>(null);

  constructor(w: WindowRef, d: DocumentRef,private location: Location) {
    super();

    this._windowRef = w;
    this._documentRef = d;
  }

  get socialUser$() {
    return this._socialUser$.asObservable();
  }

  get socialUserLogin$() {
    return this._socialUserLogin$.asObservable();
  }

  getCurrentUrl(): string {
    return this.location.path();
  }

  private loadScript(id: string, src: string, onload: any): void {
    if (typeof document !== "undefined" && !document.getElementById(id)) {
      const signInJS = this._documentRef
        .getNativeDocument()
        .createElement("script");
      signInJS.async = true;
      signInJS.src = src;
      signInJS.onload = onload;
      this._documentRef.getNativeDocument().head.appendChild(signInJS);
    }
  }

  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
    
        this.loadScript(
          this._SCRIPT_ID,
          `https://accounts.google.com/gsi/client`,
          () => {
            const key = environment.GOOGLE_AUTH_CLIENT_ID;
            const window = this._windowRef.getNativeWindow() as any;
            
            window.google.accounts.id.initialize({
              client_id: key,
              callback: ({ credential }: { credential: string }) => {
                const socialUser: SocialUser = jwt_decode(credential);
                const location = this.getCurrentUrl()
                if(location.includes("set-password")){
                  this._socialUserLogin$.next(socialUser);
                }else{
                  this._socialUser$.next(socialUser);
                }
              },
            });

            window.onGoogleLibraryLoad = () => {
              // console.log(window.google);
            };

            resolve();
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  renderGoogleButton() {
    const window = this._windowRef.getNativeWindow() as any;

    window.google.accounts.id.renderButton(
      this._documentRef.getNativeDocument().getElementById("googleButton"),
      {
        type: "standard",
        text: "login_with",
        theme: "outline",
        size: "medium",
        width: 385,
        shape: "circle",
      }
    );
  }
}
