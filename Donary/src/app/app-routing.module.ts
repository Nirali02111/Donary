import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { RoleAccessGuard } from './commons/guards/role-access.guard';
import { NeedAuthGuardGuard } from './commons/need-auth-guard.guard';
import { PageRouteVariable } from './commons/page-route-variable';
import { LoginComponent } from './pages/authentication/login/login/login.component';

import { SetPasswordComponent } from './pages/authentication/set-password/set-password.component';

const routes: Routes = [
  { path: PageRouteVariable.Auth_Login_url, component: LoginComponent, pathMatch: 'full' },
  { path: PageRouteVariable.Auth_SetPassword_url, component: SetPasswordComponent, pathMatch: 'full' },
 
  {
    path: PageRouteVariable.Dashboard_url,
    canActivate: [NeedAuthGuardGuard,RoleAccessGuard],
    loadChildren: () => import('./pages/dashboard/dashboard.module')
      .then(m => m.DashboardModule),
  },
  {
    path: PageRouteVariable.Auth_Main_url,
    loadChildren: () => import('./pages/authentication/authentication.module')
      .then(m => m.AuthenticationModule),
  },
  
  {
    path: PageRouteVariable.DonorPledgePaymentPay_url,
    loadChildren: () => import('./pages/pledge-payment/pledge-payment.module')
      .then(m => m.PledgePaymentModule),
  },
  {
    path: PageRouteVariable.DonorProductPlans_url,
    loadChildren: () => import('./pages/product-plans/product-plans.module')
      .then(m => m.ProductPlansModule),
  },
  {
    path: PageRouteVariable.Notification_url,
    loadChildren: () => import('./pages/notifications/notification.module')
      .then(m => m.NotificationModule),
  },
  /*{
    path: PageRouteVariable.DonorDrm_url,
    loadChildren: () => import('./pages/product-plans/drm/drm.module')
      .then(m => m.DrmModule),
  },
  {
    path: PageRouteVariable.DonorMobileDevice_url,
    loadChildren: () => import('./pages/product-plans/mobile-device/mobile-device.module')
      .then(m => m.MobileDeviceModule),
  },*/
  {
    path: PageRouteVariable.ProductCheckout_url,
    loadChildren: () => import('./pages/product-checkout/product-checkout.module')
      .then(m => m.ProductCheckoutModule),
  },
  {
    path: PageRouteVariable.DonorPledgePaymentPay_url + '/:accountId',
    loadChildren: () => import('./pages/pledge-payment/pledge-payment.module')
      .then(m => m.PledgePaymentModule),
  },
  {
    path: PageRouteVariable.DonorPledgePaymentPay_url + '/:accountId/:phonenumber',
    loadChildren: () => import('./pages/pledge-payment/pledge-payment.module')
      .then(m => m.PledgePaymentModule),
  },
  {
    path: PageRouteVariable.TransactionPage_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/transaction/transaction.module')
      .then(m => m.TransactionModule),
  },
  {
    path: PageRouteVariable.DonorPay_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/donor/donor.module')
      .then(m => m.DonorModule),
  },
   {
    path: PageRouteVariable.Report_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/report/report.module')
      .then(m => m.ReportModule),
  },
  {
    path: PageRouteVariable.Reason_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/reason/reason.module')
      .then(m => m.ReasonModule),
  },
  {
    path: PageRouteVariable.Campaign_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/campaign/campaign.module')
      .then(m => m.CampaignModule),
  },
  {
    path: PageRouteVariable.Location_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/location/location.module')
      .then(m => m.LocationModule),
  },
  {
    path: PageRouteVariable.Collector_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/collector/collector.module')
      .then(m => m.CollectorModule),
  },
  {
    path: PageRouteVariable.Source_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/source/source.module')
      .then(m => m.SourceModule),
  },
  {
    path: PageRouteVariable.ListPage_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/lists/list.module')
      .then(m => m.ListModule),
  },
  {
    path: PageRouteVariable.Admin_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/admin/admin.module')
      .then(m => m.AdminModule),
  },
  {
    path: PageRouteVariable.Finance_url,
    canActivate: [NeedAuthGuardGuard],
    loadChildren: () => import('./pages/finance/finance.module')
      .then(m => m.FinanceModule),
  },
  {
    path: PageRouteVariable.DonaryUpdates_url,
    loadChildren: () => import('./pages/release-updates/release-updates.module')
      .then(m => m.ReleaseUpdatesModule),
  },
  {
    path: '**', redirectTo: PageRouteVariable.Auth_Login_url
  }
];

const config: ExtraOptions = {
    useHash: false,
    anchorScrolling: "enabled"
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
