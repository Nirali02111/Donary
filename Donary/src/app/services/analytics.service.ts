import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
declare const gtag;
type gaCampaignEventPayload = {
  campaign_id?: string;
  campaign: string;
  source: string;
  medium: string;
  term?: string;
  content?: string;
};

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  protected readonly SCRIPT_ID = "donaryGoogleAnalyticsApiScript"
  constructor() {
    this.load().then(() => {
      console.log("Analytics Initialized")
    })
   }
  
  private loadScript(id: string, src: string,onload: any){
    if(typeof document !== 'undefined' && !document.getElementById(id)){
      let signInJS = document.createElement('script');
      signInJS.async = true;
      signInJS.src = src;
      signInJS.onload = onload;
      document.head.appendChild(signInJS);
    }
  }

  load(): Promise<void>{
    return new Promise((resolve,reject) => {
      try {
        const measurementKey: string = environment.GA_MEASUREMENT_ID;
        this.loadScript(this.SCRIPT_ID,`https://www.googletagmanager.com/gtag/js?id=${measurementKey}`,()=>{
          gtag('js', new Date());
          gtag('config', measurementKey,{send_page_view: false});
          resolve();
        })
      } catch (error) {
        console.log(error);
        reject(error); 
      }
    })
  }

  private pushEvent(name, eventData){
    gtag('event',name,{
      ...eventData
    })
  }

  //#region pages visited events
  
  visitedUserPasswordLogin() {
    this.pushEvent('visited_user_password', {});
  }
  
  visitedGoogleLogin() {
    this.pushEvent('visited_google_login', {});
  }
  
  visitedDashboard() {
    this.pushEvent('visited_dashboard', {});
  }
  
  visitedDonors() {
    this.pushEvent('visited_donors', {});
  }
  
  visitedCampaigns() {
    this.pushEvent('visited_campaigns', {});
  }
  
  visitedReasons() {
    this.pushEvent('visited_reasons', {});
  }
  
  visitedCollectors() {
    this.pushEvent('visited_collectors', {});
  }
  
  visitedLocations() {
    this.pushEvent('visited_locations', {});
  }
  
  visitedSources() {
    this.pushEvent('visited_sources', {});
  }
  
  visitedSeats() {
    this.pushEvent('visited_seats', {});
  }
  
  visitedPayment() {
    this.pushEvent('visited_payment', {});
  }
  
  visitedPledges() {
    this.pushEvent('visited_pledges', {});
  }
  
  visitedSchedulePayment() {
    this.pushEvent('visited_schedule_payment', {});
  }
  
  visitedSchedulePledges() {
    this.pushEvent('visited_schedule_pledges', {});
  }
  
  visitedStandardReports() {
    this.pushEvent('visited_standard_reports', {});
  }
  
  visitedAlerts() {
    this.pushEvent('visited_alerts', {});
  }
  
  visitedReminders() {
    this.pushEvent('visited_reminders', {});
  }
  
  visitedProfile() {
    this.pushEvent('visited_profile', {});
  }
  
  visitedBranding() {
    this.pushEvent('visited_branding', {});
  }
  
  visitedUsers() {
    this.pushEvent('visited_users', {});
  }
  
  visitedAPI() {
    this.pushEvent('visited_API_Keys', {});
  }
  
  visitedMinyanim() {
    this.pushEvent('visited_minyanim', {});
  }

  visitedAdminSeats(){
    this.pushEvent('visited_admin_seats', {});
  }
  
  visitedAdminSettings() {
    this.pushEvent('visited_admin_kssettings', {});
  }
  
  visitedAdvancedFields() {
    this.pushEvent('visited_advanced_fields', {});
  }
  
  visitedFinance() {
    this.pushEvent('visited_finance', {});
  }
  
  //#endregion pages visited events

  //#region Create events  
  createdDonor() {
    this.pushEvent('created_donor', {});
  }
  
  createdCampaign() {
    this.pushEvent('created_campaign', {});
  }
  
  createdReason() {
    this.pushEvent('created_reason', {});
  }
  
  createdCollector() {
    this.pushEvent('created_collector', {});
  }
  
  createdLocation() {
    this.pushEvent('created_location', {});
  }
  
  createdPayment() {
    this.pushEvent('created_payment', {});
  }
  
  createdPledge() {
    this.pushEvent('created_pledge', {});
  }
  
  createdSchedulePayment() {
    this.pushEvent('created_schedule_payment', {});
  }
  
  createdSchedulePledge() {
    this.pushEvent('created_schedule_pledge', {});
  }
  
  createdAlertRule() {
    this.pushEvent('created_alert_rule', {});
  }
  
  createdReminder() {
    this.pushEvent('created_reminder', {});
  }
  
  createdAPIKey() {
    this.pushEvent('created_API', {});
  }
  
  createdDefaultKey() {
    this.pushEvent('created_default_key', {});
  }
  
  createdAdvancedKey() {
    this.pushEvent('created_advanced_key', {});
  }
  
  createdMinyanim() {
    this.pushEvent('created_minyanim', {});
  }
  
  createdSeatMapCopy() {
    this.pushEvent('created_seat_map_copy', {});
  }
  
  createdSeatMapNew() {
    this.pushEvent('created_seat_map_new', {});
  }
  
  createdAdvancedField() {
    this.pushEvent('created_advanced_field', {});
  }
  
  createdTag() {
    this.pushEvent('created_tag', {});
  }
  
  closedBatch() {
    this.pushEvent('closed_batch', {});
  }

  //#endregion Create Events

  //#region Edit events

  editedDonor() {
    this.pushEvent('edited_donor', {});
  }
  
  editedCampaign() {
    this.pushEvent('edited_campaign', {});
  }
  
  editedReason() {
    this.pushEvent('edited_reason', {});
  }
  
  editedCollector() {
    this.pushEvent('edited_collector', {});
  }
  
  editedLocation() {
    this.pushEvent('edited_location', {});
  }
  
  editedSources() {
    this.pushEvent('edited_sources', {});
  }
  
  editedSeats() {
    this.pushEvent('edited_seats', {});
  }
  
  editedPayment() {
    this.pushEvent('edited_payment', {});
  }
  
  editedPledge() {
    this.pushEvent('edited_pledge', {});
  }
  
  editedSchedulePayment() {
    this.pushEvent('edited_schedule_payment', {});
  }
  
  editedSchedulePledge() {
    this.pushEvent('edited_schedule_pledge', {});
  }
  
  editedStandardReport() {
    this.pushEvent('edited_standard_report', {});
  }
  
  editedAlertStatus() {
    this.pushEvent('edited_alert_status', {});
  }
  
  editedReminderStatus() {
    this.pushEvent('edited_reminder_status', {});
  }
  
  editedProfile() {
    this.pushEvent('edited_profile', {});
  }
  
  editedBranding() {
    this.pushEvent('edited_branding', {});
  }
  
  editedUser() {
    this.pushEvent('edited_user', {});
  }
  
  editedAPI() {
    this.pushEvent('edited_API', {});
  }
  
  editedDefaultKey() {
    this.pushEvent('edited_default_key', {});
  }
  
  editedAdvancedKey() {
    this.pushEvent('edited_advanced_key', {});
  }
  
  editedMinyanim() {
    this.pushEvent('edited_minyanim', {});
  }
  
  editedSettings() {
    this.pushEvent('edited_settings', {});
  }

  editedSettingsPreset() {
    this.pushEvent('edited_settings_preset', {});
  }
  
  editedSettingsSMS() {
    this.pushEvent('edited_settings_SMS', {});
  }
  
  editedSettingsDisableEmail() {
    this.pushEvent('edited_settings_disable_email', {});
  }
  
  editedAdvancedFields() {
    this.pushEvent('edited_advanced_fields', {});
  }
  
  editedTag() {
    this.pushEvent('edited_tag', {});
  }
  
  editedClosedBatch() {
    this.pushEvent('edited_closed_batch', {});
  }
  
  DepositedBatch() {
    this.pushEvent('batch_deposited', {});
  }
  
  ArchivedBatch() {
    this.pushEvent('batch_archived', {});
  }
  

  //#endregion Edit events

  //#region Bulk edit 
  bulkEditedPayment() {
    this.pushEvent('bulk_edited_payment', {});
  }
  
  bulkVoidPayment() {
    this.pushEvent('bulk_void_payment', {});
  }
  
  bulkPrintPayment() {
    this.pushEvent('bulk_print_payment', {});
  }
  
  bulkEmailPayment() {
    this.pushEvent('bulk_email_payment', {});
  }
  
  bulkMailPayment() {
    this.pushEvent('bulk_mail_payment', {});
  }
  
  bulkSMSPayment() {
    this.pushEvent('bulk_SMS_payment', {});
  }
  
  bulkAdvancedPayment() {
    this.pushEvent('bulk_advanced_payment', {});
  }

  bulkEditedPledge() {
    this.pushEvent('bulk_edited_pledge', {});
  }
  
  bulkVoidPledge() {
    this.pushEvent('bulk_void_pledge', {});
  }
  
  bulkPrintPledge() {
    this.pushEvent('bulk_print_pledge', {});
  }
  
  bulkEmailPledge() {
    this.pushEvent('bulk_email_pledge', {});
  }
  
  bulkMailPledge() {
    this.pushEvent('bulk_mail_pledge', {});
  }
  
  bulkSMSPledge() {
    this.pushEvent('bulk_SMS_pledge', {});
  }
  
  bulkAdvancedPledge() {
    this.pushEvent('bulk_advanced_pledge', {});
  }
  

  bulkAddTagsDonor() {
    this.pushEvent('bulk_add_tags_donor', {});
  }
  
  bulkStatementAdvancedDonor() {
    this.pushEvent('bulk_statement_advanced_donor', {});
  }
  
  bulkStatementsPrintDonor() {
    this.pushEvent('bulk_statements_print_donor', {});
  }
  
  bulkChargeDonor() {
    this.pushEvent('bulk_charge_donor', {});
  }
  
  //#endregion Bulk edit 
  
  initCampaignDetails(
    campaignName: string,
    campaignDetailsData: gaCampaignEventPayload
  ) {
    gtag('set', campaignName, {
      ...campaignDetailsData,
    });
  }
}
