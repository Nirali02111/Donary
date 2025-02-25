import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class PageRouteVariable {
    //public static LandingPage_url: string = '';

    public static Auth_Main_url: string = 'auth';
    public static Auth_Login_url: string = '';
    public static Auth_Register_url: string = 'login';
    public static Auth_SetPassword_url: string = 'set-password';

    public static Dashboard_url: string = 'dashboard';

    public static Grid_url: string = 'grid';

    public static DonorPledgePaymentLogin_url = 'login';
    public static DonorPledgePaymentPay_url = 'pay';
    public static DonorProductPlans_url = 'productandplans';
    public static DonorDrm_url = 'productandplans/drm';
    public static DonorMobileDevice_url = 'productandplans/mobiledevice';
    public static ProductCheckout_url = 'checkout';
    public static ProductCart_url = 'productandplans/cart';

    public static TransactionPage_url = 'transaction';
    public static ListPage_url='lists';
    public static DonorPay_url='donor';
    public static Report_url='report';
    public static Notification_url='notification';
    public static Reason_url='reason';
    public static Campaign_url='campaign';
    public static Location_url='location';
    public static Collector_url='collector';
    public static Source_url='source';

    public static Admin_url = 'admin';
    // Sample download file names
    public static PledgeTransSampleFileName='pledge-transaction.xlsx';

    public static DonaryDonate_url = 'donate'

    public static DonaryUpdates_url = 'update'

    public static Finance_url = 'finance';

}
