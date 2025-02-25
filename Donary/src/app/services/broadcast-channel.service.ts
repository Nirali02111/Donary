import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class BroadcastChannelService {
  private channel: BroadcastChannel;
 
  constructor() {
    this.channel = new BroadcastChannel('new-login');
  }
 
  sendMessage(message: any) {
    this.channel.postMessage(message);
  }
 
  getMessage() {
    return new Observable<any>(observer => {
      this.channel.onmessage = event => {
        observer.next(event.data);
      };
    });
  }
}