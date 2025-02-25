import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LocalstoragedataService } from "./../commons/local-storage-data.service";

export interface WalletObjResponse {
  accountId: number;
  walletId: number;
  description: string | null;
  accountName: string | null;
  accountNumber: string | null;
  exp: string | null;
  cvv: string | null;
  billingZip: string | null;
  billingAddress: string | null;
  isAMEXCard: boolean;
  accountType: string | null;
  checkType: string | null;
  isPrimary: boolean;
  walletType: string | null;
  routingNumber: string | null;
  token: string | null;
}

@Injectable({
  providedIn: "root",
})
export class DonorService {
  version = "v1/";
  version2 = "v2/";
  DONOR_MAIN_URL = "donor";
  DONORWALLET_MAIN_URL = "donorWallet";
  DONOR_LIST_URL = `${this.version}${this.DONOR_MAIN_URL}/GetDonors`;
  DONOR_SAVE_URL = `${this.version}${this.DONOR_MAIN_URL}/SaveDonor`;
  DONOR_SAVEEMAIL_URL = `${this.version}${this.DONOR_MAIN_URL}/SaveDonorEmail`;
  DONOR_SAVEPHONE_URL = `${this.version}${this.DONOR_MAIN_URL}/SaveDonorPhone`;
  DONOR_GET_URL = `${this.version}${this.DONOR_MAIN_URL}/GetDonor`;
  DONOR_GETEMAILLIST_URL = `${this.version}${this.DONOR_MAIN_URL}/GetDonorEmails`;
  DONOR_GETPHONELIST_URL = `${this.version}${this.DONOR_MAIN_URL}/GetDonorPhones`;
  DONOR_GETACCOUNTEMAIL_URL = `${this.version}${this.DONOR_MAIN_URL}/GetDonorEmailByAccountEmailID`;
  DONOR_GETACCOUNTPHONE_URL = `${this.version}${this.DONOR_MAIN_URL}/GetDonorPhoneByAccountPhoneID`;
  DONOR_DELETEEMAIL_URL = `${this.version}${this.DONOR_MAIN_URL}/DeleteDonorEmail`;
  DONOR_DELETEPHONE_URL = `${this.version}${this.DONOR_MAIN_URL}/DeleteDonorPhone`;
  DELETE_DONORLOCATION_URL = `${this.version}${this.DONOR_MAIN_URL}/DeleteDonorLocation`;
  DONOR_DELETEADDRESS_URL = `${this.version}${this.DONOR_MAIN_URL}/DeleteAddress`;
  DONOR_BULKINACTIVE_URL = `${this.version}${this.DONOR_MAIN_URL}/BulkUpdateDonorStatus`;
  DONOR_REPORTBYDONOR_URL = `${this.version}${this.DONOR_MAIN_URL}/GetAliyesReportByDonor`;
  DONOR_REPORTBYDATE_URL = `${this.version}${this.DONOR_MAIN_URL}/GetAliyesReportByDate`;

  DONOR_UPDATE_URL = `${this.version}${this.DONOR_MAIN_URL}/UpdateDonor`;

  //Wallet API Link
  DONOR_SAVEWALLET_URL = `${this.version}${this.DONORWALLET_MAIN_URL}/Save`;
  DONOR_GETWALLETBYACCOUNTID_URL = `${this.version}${this.DONORWALLET_MAIN_URL}/GetDonorWallets`;
  DONOR_GETWALLETBYID_URL = `${this.version}${this.DONORWALLET_MAIN_URL}/GetDonorWallet`;
  DONOR_DELETEWALLET_URL = `${this.version}${this.DONORWALLET_MAIN_URL}/DeleteDonorWallet`;
  DONOR_DELETE_URL = `${this.version}${this.DONOR_MAIN_URL}/Delete`;

  DONOR_GET_MERGE_URL = `${this.version}${this.DONOR_MAIN_URL}/GetMergeDonors`;
  DONOR_SAVE_MERGE_URL = `${this.version}${this.DONOR_MAIN_URL}/MergeDonors`;

  DONOR_GET_CITY_STATE_ZIP_URL = `${this.version}${this.DONOR_MAIN_URL}/GetCityStateZip`;

  DONOR_GET_COLUMN_URL = `${this.version}${this.DONOR_MAIN_URL}/GetColumns`;
  DONOR_GET_LABEL_URL = `${this.version}${this.DONOR_MAIN_URL}/GetLabels`;

  PLEDGE_GET_BALNCE = `${this.version}${this.DONOR_MAIN_URL}/GetPledgeBalance`;
  DONOR_GET_REPORT = `${this.version}${this.DONOR_MAIN_URL}/GetDonorsReport`;
  DONOR_IMPORT = `${this.version2}${this.DONOR_MAIN_URL}/Import`;
  TOKEN_IMPORT = `${this.version}${this.DONORWALLET_MAIN_URL}/Import`;
  DONOR_DOWNLOAD_TEMPLATE = `${this.version2}${this.DONOR_MAIN_URL}/DonwloadTemplate`;
  DONOR_TOKEN_DOWNLOAD_TEMPLATE = `${this.version}${this.DONORWALLET_MAIN_URL}/DonwloadTemplate`;
  GET_OPEN_STATEMENTS = `${this.version}${this.DONOR_MAIN_URL}/GetOpenStatements`;
  GET_DEFAULT_WALLETS = `${this.version}${this.DONORWALLET_MAIN_URL}/GetDefaultWallets`;
  constructor(
    private http: HttpClient,
    private localstoragedataService: LocalstoragedataService
  ) {}
  accessToken = this.localstoragedataService.getloginUserAccessToken();
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.accessToken,
      Accept: "application/json",
    }),
  };
  getDonorList(formdata: any): Observable<any> {
    return this.http.post(this.DONOR_LIST_URL, formdata).pipe((response) => {
      return response;
    });
  }

  SaveDonor(formdata: any): Observable<any> {
    return this.http.post(this.DONOR_SAVE_URL, formdata).pipe((response) => {
      return response;
    });
  }

  UpdateDonor(formdata: any): Observable<any> {
    return this.http.post(this.DONOR_UPDATE_URL, formdata).pipe((response) => {
      return response;
    });
  }

  BulkInactiveDonor(formdata: any): Observable<any> {
    return this.http
      .post(this.DONOR_BULKINACTIVE_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  SaveDonorEmail(formdata: any): Observable<any> {
    return this.http
      .post(this.DONOR_SAVEEMAIL_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  SaveDonorPhone(formdata: any): Observable<any> {
    return this.http
      .post(this.DONOR_SAVEPHONE_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }
  getDonorById(
    eventGuid: string,
    accountId: Int32Array,
    isGLobal: boolean = false
  ) {
    return this.http
      .get(
        this.DONOR_GET_URL +
          "?eventGuid=" +
          eventGuid +
          "&&accountId=" +
          accountId +
          "&&isGlobal=" +
          isGLobal
      )
      .pipe((response) => {
        return response;
      });
  }

  getDonorEmailList(eventGuid: string, accountId: Int32Array) {
    return this.http
      .get(
        this.DONOR_GETEMAILLIST_URL +
          "?eventGuid=" +
          eventGuid +
          "&&accountId=" +
          accountId
      )
      .pipe((response) => {
        return response;
      });
  }

  getDefaultWallet(formData: any) {
    return this.http
      .post(this.GET_DEFAULT_WALLETS, formData)
      .pipe((response) => {
        return response;
      });
  }

  getDonorPhoneList(eventGuid: string, accountId: Int32Array) {
    return this.http
      .get(
        this.DONOR_GETPHONELIST_URL +
          "?eventGuid=" +
          eventGuid +
          "&&accountId=" +
          accountId
      )
      .pipe((response) => {
        return response;
      });
  }

  getEmailByAccountEmailId(
    eventGuid: string,
    accountEmailID: Int32Array,
    loginUserId: Int32Array
  ) {
    return this.http
      .get(
        this.DONOR_GETACCOUNTEMAIL_URL +
          "?eventGuid=" +
          eventGuid +
          "&&accountEmailID=" +
          accountEmailID +
          "&&loginUserId=" +
          loginUserId,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }

  getPhoneByAccountPhoneId(
    eventGuid: string,
    accountPhoneID: Int32Array,
    loginUserId: Int32Array
  ) {
    return this.http
      .get(
        this.DONOR_GETACCOUNTPHONE_URL +
          "?eventGuid=" +
          eventGuid +
          "&&accountPhoneID=" +
          accountPhoneID +
          "&&loginUserId=" +
          loginUserId,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }

  deleteDonorEmail(
    eventGuid: string,
    accountEmailIds: Int32Array,
    loginUserId: Int32Array
  ) {
    return this.http
      .delete(
        this.DONOR_DELETEEMAIL_URL +
          "?eventGuid=" +
          eventGuid +
          "&&accountEmailIds=" +
          accountEmailIds +
          "&&loginUserId=" +
          loginUserId,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }

  deleteDonorPhone(
    eventGuid: string,
    accountPhoneID: Int32Array,
    loginUserId: Int32Array
  ) {
    return this.http
      .delete(
        this.DONOR_DELETEPHONE_URL +
          "?eventGuid=" +
          eventGuid +
          "&&accountPhoneID=" +
          accountPhoneID +
          "&&loginUserId=" +
          loginUserId,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }
  deleteDonor(formdata: any) {
    return this.http
      .request("delete", this.DONOR_DELETE_URL, { body: formdata })
      .pipe((response) => {
        return response;
      });
  }

  deleteDonorLocation(accountLocationId: Int32Array) {
    return this.http
      .delete(
        this.DELETE_DONORLOCATION_URL +
          "?accountLocationId=" +
          accountLocationId,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }
  getReportByDonor(formData: any) {
    return this.http
      .post(this.DONOR_REPORTBYDONOR_URL, formData)
      .pipe((response) => {
        return response;
      });
  }
  getReportByDate(event: any) {
    return this.http
      .post(this.DONOR_REPORTBYDATE_URL, event)
      .pipe((response) => {
        return response;
      });
  }

  //Wallet Methods
  SaveDonorWallet(formdata: any): Observable<any> {
    return this.http
      .post(this.DONOR_SAVEWALLET_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }
  getWalletByAccountId(eventGuid: string, accountId: Number) {
    return this.http
      .get(
        this.DONOR_GETWALLETBYACCOUNTID_URL +
          "?eventGuid=" +
          eventGuid +
          "&&accountId=" +
          accountId
      )
      .pipe((response) => {
        return response;
      });
  }
  getWalletById(eventGuid: string, walletId: Int32Array) {
    return this.http
      .get(
        this.DONOR_GETWALLETBYID_URL +
          "?eventGuid=" +
          eventGuid +
          "&&walletId=" +
          walletId
      )
      .pipe((response) => {
        return response;
      });
  }
  deleteDonorWallet(
    eventGuid: string,
    updatedBy: Int32Array,
    walletId: Int32Array
  ) {
    return this.http
      .delete(
        this.DONOR_DELETEWALLET_URL +
          "?eventGuid=" +
          eventGuid +
          "&&updatedBy=" +
          updatedBy +
          "&&walletId=" +
          walletId,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }

  getMergeDonors(eventGuid) {
    return this.http
      .get(this.DONOR_GET_MERGE_URL, { params: { eventGuid } })
      .pipe((response) => {
        return response;
      });
  }

  saveMergeDonors(data) {
    return this.http.put(this.DONOR_SAVE_MERGE_URL, data).pipe((response) => {
      return response;
    });
  }

  getDonorCityStateZip(eventGuid) {
    return this.http
      .get(this.DONOR_GET_CITY_STATE_ZIP_URL + "?eventGuid=" + eventGuid)
      .pipe((response) => {
        return response;
      });
  }

  getDonorColumns(formData) {
    return this.http
      .post(this.DONOR_GET_COLUMN_URL, formData)
      .pipe((response) => {
        return response;
      });
  }

  getDonorLabels(formData) {
    return this.http
      .post(this.DONOR_GET_LABEL_URL, formData)
      .pipe((response) => {
        return response;
      });
  }
  getPledgeBalance(formData) {
    return this.http.post(this.PLEDGE_GET_BALNCE, formData).pipe((response) => {
      return response;
    });
  }
  getDonarsReport(formData) {
    return this.http.post(this.DONOR_GET_REPORT, formData).pipe((response) => {
      return response;
    });
  }
  deleteMultipleDonorEmail(
    eventGuid: string,
    accountEmailIds: string,
    loginUserId: Int32Array
  ) {
    return this.http
      .delete(
        this.DONOR_DELETEEMAIL_URL +
          "?eventGuid=" +
          eventGuid +
          accountEmailIds +
          "&&loginUserId=" +
          loginUserId,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }
  //  deleteDonorAddress(accountAddressId: Int32Array, loginUserId: Int32Array,eventGuid: string,macAddress:string) {
  //   return this.http.delete(this.DONOR_DELETEADDRESS_URL + "?accountAddressId=" + accountAddressId  + "&&loginUserId=" + loginUserId + '&&eventGuid=' + eventGuid + '&&macAddress='+ macAddress,this.httpOptions).pipe(response => {
  //   return response;
  // });
  //   }
  deleteMultipleDonorAddress(
    accountAddressIds: string,
    loginUserId: Int32Array,
    eventGuid: string,
    macAddress: string
  ) {
    return this.http
      .delete(
        this.DONOR_DELETEADDRESS_URL +
          "?" +
          accountAddressIds +
          "&&loginUserId=" +
          loginUserId +
          "&&eventGuid=" +
          eventGuid +
          "&&macAddress=" +
          macAddress,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }
  deleteMultipleDonorPhone(
    eventGuid: string,
    accountPhoneIds: string,
    loginUserId: Int32Array
  ) {
    return this.http
      .delete(
        this.DONOR_DELETEPHONE_URL +
          "?eventGuid=" +
          eventGuid +
          accountPhoneIds +
          "&&loginUserId=" +
          loginUserId,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }

  donarImport(formData) {
    return this.http.post(this.DONOR_IMPORT, formData).pipe((response) => {
      return response;
    });
  }
  downloadDonarTemplate(): Observable<any> {
    return this.http
      .get(this.DONOR_DOWNLOAD_TEMPLATE, { responseType: "blob" })
      .pipe((response) => {
        return response;
      });
  }
  deleteDonorAddress(
    accountAddressId: string,
    loginUserId: Int32Array,
    eventGuid: string,
    macAddress: string
  ) {
    return this.http
      .delete(
        this.DONOR_DELETEADDRESS_URL +
          "?accountAddressId=" +
          accountAddressId +
          "&&loginUserId=" +
          loginUserId +
          "&&eventGuid=" +
          eventGuid +
          "&&macAddress=" +
          macAddress,
        this.httpOptions
      )
      .pipe((response) => {
        return response;
      });
  }
  downloadTokenTemplate(): Observable<any> {
    return this.http
      .get(this.DONOR_TOKEN_DOWNLOAD_TEMPLATE, { responseType: "blob" })
      .pipe((response) => {
        return response;
      });
  }
  tokenImport(formData) {
    return this.http.post(this.TOKEN_IMPORT, formData).pipe((response) => {
      return response;
    });
  }
  // downloadfile(payload: any){
  //  return this.http.post(this.DONOR_REPORTBYDONOR_URL, payload)
  // }

  GetOpenStatements(formData) {
    return this.http
      .post(this.GET_OPEN_STATEMENTS, formData)
      .pipe((response) => {
        return response;
      });
  }
}
