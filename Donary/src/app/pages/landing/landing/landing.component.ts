import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { LocalstoragedataService } from '../../../commons/local-storage-data.service';
import { PageRouteVariable } from '../../../commons/page-route-variable';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
    standalone: true,
    imports: [RouterLink, TranslateModule]
})
export class LandingComponent implements OnInit,OnDestroy {

  orgLogin_url: string = '/' + PageRouteVariable.Auth_Main_url + '/' + PageRouteVariable.Auth_Login_url;
  pledgePaymentlogin_url: string = '/' + PageRouteVariable.DonorPledgePaymentPay_url;
  showMenu:boolean=false;

  private destroy$: Subject<void> = new Subject<void>();
   

  constructor(private localstoragedataService: LocalstoragedataService,private router: Router) { }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login_footer');
    // reset local storage
    this.localstoragedataService.setLoginUserDataandToken(null, "0");
    // this.router.navigate(['/auth/login']);
  }

  ShowNavBar()
  {
   
    if(!this.showMenu)
    {
      this.showMenu=true;
      const ul = document.getElementsByTagName('ul')[0];
     ul.classList.add('show-menuitem');
    }
    else{
      this.showMenu=false;
      const ul = document.getElementsByTagName('ul')[0];
      ul.classList.remove('show-menuitem');
    }

  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
