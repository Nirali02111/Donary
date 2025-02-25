import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { MessengerService } from "src/app/services/messenger.service";
import { DonorCardPopupComponent } from "../../../cards/donor-card-popup/donor-card-popup.component";

declare var $: any;
import * as _ from "lodash";
import { PaymentCardPopupComponent } from "src/app/pages/cards/payment-card-popup/payment-card-popup.component";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { PledgeCardPopupComponent } from "src/app/pages/cards/pledge-card-popup/pledge-card-popup.component";
import { PledgeService } from "src/app/services/pledge.service";
import { AnalyticsService } from "src/app/services/analytics.service";

interface AccandEmail {
  accountId: number;
  receiptNum: number;
  selectedEmail?: string;
  labelName?: string;
  paymentId: number;
}

@Component({
  selector: "app-bulk-email-receipt",
  templateUrl: "./bulk-email-receipt.component.html",
  styleUrls: ["./bulk-email-receipt.component.scss"],
  standalone: false,
})
export class BulkEmailReceiptComponent implements OnInit {
  @ViewChildren("emailspans") emailspans: QueryList<ElementRef>;

  updateEmailId = null;
  updateEmailsIndex = null;

  sendingTotalDonors: number = 0;
  isloading: boolean = false;
  modalOptions: NgbModalOptions;

  otherInfo: any;
  dateRange: any;
  dataList: any = [];
  gridFilterDataList: any = [];

  selectedAccountList: Array<AccandEmail> = [];

  selectAllNameCheckBox: boolean = false;
  selectAllEmailCheckBox: boolean = false;
  tempEmail: string = "";
  isUpdated: boolean = false;
  filterOptions: any = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "with",
      label: "Has Email Address",
    },
    {
      value: "missing",
      label: "Missing Email Address",
    },
  ];

  filterBy: string = "all";

  filterStatusOptions: any = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "sent",
      label: "Sent",
    },
    {
      value: "not sent",
      label: "Not Sent",
    },
  ];

  filterByStatus: string = "all";
  allEmailLabelsArray = [];
  recordSelectedArray = [];
  isDonarOpenClicked = false;
  analytics = inject(AnalyticsService);

  @Input() set List(datalist: any) {
    if (datalist) {
      const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.commonAPIMethodService
        .getLabelText(eventGuId)
        .subscribe((res: any) => {
          this.allEmailLabelsArray = res;
          let labelName = "Home";
          this.allEmailLabelsArray = this.allEmailLabelsArray.filter(
            (x) => x.labelType == "Email"
          );
          this.allEmailLabelsArray = this.allEmailLabelsArray.map((item) => {
            item.isLabelNameChecked = false;
            if (item.labelName.toLowerCase() == labelName.toLowerCase()) {
              item.isLabelNameChecked = true;
            }
            return item;
          });
          datalist = datalist.map((x, index) => {
            if (x.pledgeID) {
              x.receiptNum = x.pledgeNum;
              x.paymentId = x.pledgeID;
            }
            //email label logic
            if (!x.emailLabels) {
              x.emailLabels = ",";
              x.emailSentList = [];
              x.emails = [];
            }
            if (x.emailLabels) {
              let emailObj = [];
              let emailLabels = x.emailLabels.split(",");
              let emailSent =
                x.emailSentList == undefined ? [] : x.emailSentList;
              let emailList = this.getTrim(x.emails);
              emailLabels = this.getTrim(emailLabels);
              emailSent = emailSent;
              for (let index = 0; index < emailLabels.length; index++) {
                const label = emailLabels[index];
                const value = emailList[index];
                const sent = emailSent[index];
                if (label) {
                  const found = emailObj.some(
                    (el) => el.labelName.toLowerCase() == label.toLowerCase()
                  );
                  if (!found) {
                    emailObj.push({
                      labelID: index,
                      labelType: "Email",
                      labelName:
                        (label || "").charAt(0).toUpperCase() +
                        (label || "").slice(1),
                      emailValue: value,
                      emailSent: sent,
                    });
                  }
                }
              }
              this.allEmailLabelsArray.map((item) => {
                const found = emailObj.some(
                  (el) =>
                    el.labelName.toLowerCase() == item.labelName.toLowerCase()
                );
                if (!found)
                  emailObj.push({
                    labelID: item.labelID,
                    labelType: item.labelType,
                    labelName:
                      (item.labelName || "").charAt(0).toUpperCase() +
                      (item.labelName || "").slice(1),
                    emailValue: "",
                    emailSent: "0",
                  });
              });
              x.emailLabelArray = emailObj;
            }
            if (x.emailLabelArray && x.emailLabelArray.length > 0) {
              for (let j = 0; j < x.emailLabelArray.length; j++) {
                if (
                  x.emailLabelArray[j].labelName.toLowerCase() ==
                  labelName.toLowerCase()
                ) {
                  if (!this.labelNameShowHideArray.includes(labelName)) {
                    this.labelNameShowHideArray.push(labelName);
                  }
                  if (x.emailLabelArray[j].emailValue) {
                    this.selectedAccountList.push({
                      accountId: x.accountId,
                      paymentId: x.paymentId,
                      selectedEmail: x.emailLabelArray[j].emailValue,
                      receiptNum: x.receiptNum,
                      labelName: labelName,
                    });
                  }
                }
              }
            }
            return x;
          });
          this.dataList = datalist;
          this.gridFilterDataList = datalist;
        });
    }
  }

  @Input() set Duration(dateRange: boolean) {
    if (dateRange) {
      this.dateRange = dateRange;
    }
  }

  @Input() set Info(Info: any) {
    if (Info) {
      this.otherInfo = Info;
      if (Info.recordSelectedArray) {
        this.recordSelectedArray = Info.recordSelectedArray;
      }
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    private pledgeService: PledgeService,
    private messengerService: MessengerService,
    private commonAPIMethodService: CommonAPIMethodService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal_custom_header,.modal__custom_footer",
      });
    });
    this.commonMethodService.getPaymentTransactionData().subscribe((res) => {
      if (res && this.isDonarOpenClicked) {
        var resultArray = [];

        for (const item of this.recordSelectedArray) {
          let donorDetails = res.find((x) => x.paymentId == item);
          if (donorDetails) {
            let { phoneNumbers, emailAddresses, ...restdonorDetails } =
              donorDetails;

            const newDonotRcd = {
              ...restdonorDetails,
              emails:
                emailAddresses && emailAddresses.indexOf(",") > -1
                  ? emailAddresses.split(",")
                  : emailAddresses
                  ? [emailAddresses]
                  : [],
            };

            resultArray.push(newDonotRcd);
          }
        }
        let datalist = _(resultArray)
          .chain()
          .groupBy((p) => p.receiptNum)
          .map((props) => ({
            ..._.head(props),

            paymentIds: _.map(props, (p) => p.paymentId),
            emails: _.uniq(_.flatMap(_.map(props, (p) => p.emails))),
            email: "",
          }))
          .value();
        const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
        this.commonAPIMethodService
          .getLabelText(eventGuId)
          .subscribe((res: any) => {
            this.allEmailLabelsArray = res;
            this.allEmailLabelsArray = this.allEmailLabelsArray.filter(
              (x) => x.labelType == "Email"
            );
            this.allEmailLabelsArray = this.allEmailLabelsArray.map((item) => {
              item.isLabelNameChecked = this.labelNameShowHideArray.includes(
                item.labelName
              );
              return item;
            });
            datalist = datalist.map((x, index) => {
              //email label logic
              if (!x.emailLabels) {
                x.emailLabels = ",";
                x.emailSentList = [];
                x.emails = [];
              }
              if (x.emailLabels) {
                let emailObj = [];
                let emailLabels = x.emailLabels.split(",");
                let emailSent = x.emailSentList;
                let emailList = x.emails;
                emailLabels = emailLabels.map((s) => s.trim());
                emailSent = emailSent;
                for (let index = 0; index < emailLabels.length; index++) {
                  const label = emailLabels[index];
                  const value = emailList[index];
                  const sent = emailSent[index];
                  if (label) {
                    emailObj.push({
                      labelID: index,
                      labelType: "Email",
                      labelName: label,
                      emailValue: value,
                      emailSent: sent,
                    });
                  }
                }
                this.allEmailLabelsArray.map((item) => {
                  const found = emailObj.some(
                    (el) =>
                      el.labelName.toLowerCase() == item.labelName.toLowerCase()
                  );
                  if (!found)
                    emailObj.push({
                      labelID: item.labelID,
                      labelType: item.labelType,
                      labelName: item.labelName,
                      emailValue: "",
                      emailSent: "0",
                    });
                });
                x.emailLabelArray = emailObj;
              }
              return x;
            });
            this.dataList = datalist;
            this.gridFilterDataList = datalist;
            //update  checkbox
            this.selectedAccountList = [];
            this.gridFilterDataList.map((item) => {
              let accountId = item.accountId;
              let receiptNum = item.receiptNum;
              let paymentId = item.paymentId;
              if (item.emailLabelArray && item.emailLabelArray.length > 0) {
                item.emailLabelArray.map((x) => {
                  if (this.labelNameShowHideArray.includes(x.labelName)) {
                    if (x.emailValue) {
                      this.selectedAccountList.push({
                        accountId: accountId,
                        paymentId: paymentId,
                        selectedEmail: x.emailValue,
                        receiptNum: receiptNum,
                        labelName: x.labelName,
                      });
                    }
                  }
                });
              }
            });
          });
      }
    });
  }

  sentGridFilter(data: Array<any>) {
    return _.reduce(
      data,
      (filtered, option) => {
        let listArray = [];
        let sentArray = [];
        if (option.emailSentList) {
          for (let index = 0; index < option.emailSentList.length; index++) {
            const element = option.emailSentList[index];
            if (element && element == "1" && option.emails[index]) {
              listArray.push(option.emails[index]);
              sentArray.push("1");
            }
          }
          filtered.push({
            ...option,
            emails: listArray,
            emailSentList: sentArray,
          });
        }

        return filtered;
      },
      []
    );
  }

  notSentGridFilter(data: Array<any>) {
    return _.reduce(
      data,
      (filtered, option) => {
        let listArray = [];
        let sentArray = [];

        if (option.emailSentList) {
          for (let index = 0; index < option.emailSentList.length; index++) {
            const element = option.emailSentList[index];
            if (element && element == "0" && option.emails[index]) {
              listArray.push(option.emails[index]);
              sentArray.push("0");
            }
          }

          filtered.push({
            ...option,
            emails: listArray,
            emailSentList: sentArray,
          });
        }

        return filtered;
      },
      []
    );
  }

  filterGridRows(event) {
    if (this.filterBy === "missing") {
      // return empty for missing + sent
      if (this.filterByStatus === "sent") {
        this.gridFilterDataList = [];
        return;
      }

      if (this.filterByStatus === "not sent" || this.filterByStatus === "all") {
        this.gridFilterDataList = this.dataList.filter(
          (o) => o.emails.length === 0
        );
        return;
      }
    }

    if (this.filterBy === "with") {
      let filterAry = this.dataList.filter((o) => o.emails.length !== 0);

      if (this.filterByStatus === "sent") {
        let withSentResult = this.sentGridFilter(filterAry);
        this.gridFilterDataList = withSentResult.filter(
          (o) => o.emails.length !== 0
        );
        return;
      }

      if (this.filterByStatus === "not sent") {
        let withNotSentResult = this.notSentGridFilter(filterAry);
        this.gridFilterDataList = withNotSentResult.filter(
          (o) => o.emails.length !== 0
        );
        return;
      }

      if (this.filterByStatus === "all") {
        this.gridFilterDataList = filterAry;
        return;
      }
    }

    if (this.filterBy === "all") {
      if (this.filterByStatus === "sent") {
        this.gridFilterDataList = this.dataList.filter((item) => {
          if (item.emailSent && item.emailSent.length > 0) {
            if (item.emailSent.includes("1")) {
              return true;
            }
            return false;
          }
          return false;
        });
        return;
      }

      if (this.filterByStatus === "not sent") {
        this.gridFilterDataList = this.dataList.filter((item) => {
          if (item.emailSent && item.emailSent.length > 0) {
            if (!item.emailSent.includes("1")) {
              return true;
            }
            return false;
          }
          return true;
        });
        return;
      }

      if (this.filterByStatus === "all") {
        this.gridFilterDataList = this.dataList;
        return;
      }
    }
  }

  totalSelectedShow(): number {
    const dd = _(this.selectedAccountList)
      .chain()
      .groupBy((p) => p.receiptNum)
      .map((props) => ({
        ..._.head(props),
      }))
      .value();

    return dd.length;
  }

  mouseOutEmailUpdate(receiptNum, j) {
    // update for multiple
    if (
      this.updateEmailId &&
      this.updateEmailId === receiptNum &&
      this.updateEmailsIndex !== null &&
      this.updateEmailsIndex === j
    ) {
      for (var i = 0; i < this.gridFilterDataList.length; i++) {
        if (
          this.gridFilterDataList[i].accountId === this.updateEmailId &&
          this.tempEmail !== ""
        ) {
          let oldValue =
            this.gridFilterDataList[i].emails[this.updateEmailsIndex];
          if (
            this.selectedAccountList.find(
              (s) =>
                s.accountId === this.updateEmailId &&
                s.selectedEmail === oldValue
            )
          ) {
            this.selectedAccountList = this.selectedAccountList.filter(
              (s) =>
                !(
                  s.accountId === this.updateEmailId &&
                  s.selectedEmail === oldValue
                )
            );
            this.selectedAccountList.push({
              accountId: this.updateEmailId,
              paymentId: this.gridFilterDataList[i].paymentId,
              selectedEmail: this.tempEmail,
              receiptNum: receiptNum,
            });
          }
          this.gridFilterDataList[i].emails[this.updateEmailsIndex] =
            this.tempEmail;
          this.isUpdated = true;
        }
      }
      this.checkAllName();
    }
    this.updateEmailId = null;
    this.updateEmailsIndex = null;
    this.tempEmail = "";
  }

  openPaymentCardPopup(paymentId) {
    if (paymentId != null && paymentId != 0) {
      this.isloading = false;
      if (this.otherInfo.type == "Pledge") {
        this.openPledgeCardPopup(paymentId);
      } else {
        this.modalOptions = {
          centered: true,
          size: "lg",
          backdrop: false,
          keyboard: true,
          windowClass: "drag_popup payment_card",
        };
        const modalRef = this.commonMethodService.openPopup(
          PaymentCardPopupComponent,
          this.modalOptions
        );
        var objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          paymentId: paymentId,
        };
        this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
          // hide loader
          this.isloading = false;
          modalRef.componentInstance.PaymentCardData = res;
        });
      }
    }
  }
  openPledgeCardPopup(pledgeId) {
    if (pledgeId != undefined) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup pledgeCard",
      };
      const modalRef = this.commonMethodService.openPopup(
        PledgeCardPopupComponent,
        this.modalOptions
      );
      var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
      this.pledgeService
        .GetPledgeCard(eventGuid, pledgeId)
        .subscribe((res: any) => {
          // hide loader
          this.isloading = false;
          modalRef.componentInstance.PledgeCardData = res;
        });
    }
  }

  // update for single
  mouseOutEmailEdit(accountId) {
    if (
      this.updateEmailId &&
      this.updateEmailId === accountId &&
      this.updateEmailsIndex === null
    ) {
      for (var i = 0; i < this.gridFilterDataList.length; i++) {
        if (
          this.gridFilterDataList[i].accountId === this.updateEmailId &&
          this.tempEmail !== ""
        ) {
          this.gridFilterDataList[i].email = this.tempEmail;
          this.isUpdated = true;
        }
      }
      this.checkAllName();
    }
    this.updateEmailId = null;
    this.updateEmailsIndex = null;
    this.tempEmail = "";
  }

  beforeEmailUpdate(receiptNum, index, j) {
    let foundObj = this.gridFilterDataList.find((o) => {
      return o.receiptNum === receiptNum;
    });
    this.tempEmail = foundObj.emails[j];

    this.updateEmailId = receiptNum;
    this.updateEmailsIndex = j;

    // wait a tick
    setTimeout(() => {
      this.emailspans.toArray()[index + j].nativeElement.focus();
    }, 250);
  }

  beforeEmailEdit(accountId, index) {
    this.updateEmailId = accountId;
    this.updateEmailsIndex = null;
    this.tempEmail = "";
    // wait a tick
    setTimeout(() => {
      this.emailspans.toArray()[index].nativeElement.focus();
    }, 250);
  }

  emailIdUpdate(event) {
    this.tempEmail = event.target.value;
  }

  checkDonorIsDisable(accId): Boolean {
    const found = this.gridFilterDataList.find((e) => e.accountId === accId);
    if (found && found.email === "" && found.emails.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  checkAllName() {
    if (!this.selectAllNameCheckBox) {
      return;
    }
    this.gridFilterDataList.map((o) => {
      if (o.email === "" && o.emails.length === 0) {
        return o;
      }

      if (o.email !== "" && o.emails.length === 0) {
        if (
          !this.selectedAccountList.find((s) => s.receiptNum === o.receiptNum)
        ) {
          this.selectedAccountList.push({
            accountId: o.accountId,
            paymentId: o.paymentId,
            selectedEmail: o.email,
            receiptNum: o.receiptNum,
          });
        }

        return o;
      }

      if (
        !this.selectedAccountList.find((s) => s.receiptNum === o.receiptNum)
      ) {
        o.emails.map((e) => {
          this.selectedAccountList.push({
            accountId: o.accountId,
            paymentId: o.paymentId,
            selectedEmail: e,
            receiptNum: o.receiptNum,
          });
        });
      }
      return o;
    });
  }

  selectName(event, type, accountId, emails: Array<string>, receiptNum) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.selectAllNameCheckBox = true;
        this.selectAllEmailCheckBox = true;
        this.checkAllName();
      } else {
        this.selectAllNameCheckBox = false;
        this.selectAllEmailCheckBox = false;
        this.selectedAccountList = [];
      }
    }

    if (type === "singlecheck") {
      if (event.target.checked) {
        // check for single donor with updated email id
        if (emails.length === 0) {
          let selectDonorObj = this.gridFilterDataList.find(
            (d) => d.accountId === accountId
          );

          if (
            selectDonorObj.email !== "" &&
            selectDonorObj.emails.length === 0
          ) {
            if (
              !this.selectedAccountList.find(
                (s) => s.accountId === selectDonorObj.accountId
              )
            ) {
              this.selectedAccountList.push({
                accountId: selectDonorObj.accountId,
                paymentId: selectDonorObj.paymentId,
                selectedEmail: selectDonorObj.email,
                receiptNum: selectDonorObj.receiptNum,
              });
            }
            return;
          }
        } else {
          emails.forEach((e) => {
            this.selectedAccountList.push({
              accountId: accountId,
              paymentId: accountId,
              selectedEmail: e,
              receiptNum: receiptNum,
            });
          });
        }
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => e.accountId !== accountId
        );
      }
    }
  }

  //new code
  selectReceipt(
    event,
    type,
    accountId,
    paymentId,
    emails: Array<string>,
    receiptNum
  ) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.selectAllNameCheckBox = true;
        this.selectAllEmailCheckBox = true;
      } else {
        this.selectAllNameCheckBox = false;
        this.selectAllEmailCheckBox = false;
        this.selectedAccountList = [];
      }
    }
    if (type === "singlecheck") {
      if (event.target.checked) {
        let selectDonorObj = this.gridFilterDataList.find(
          (d) => d.receiptNum === receiptNum
        );
        if (selectDonorObj.email !== "" && selectDonorObj.emails.length === 0) {
          if (
            !this.selectedAccountList.find(
              (s) => s.receiptNum === selectDonorObj.receiptNum
            )
          ) {
            this.selectedAccountList.push({
              accountId: selectDonorObj.accountId,
              paymentId: selectDonorObj.paymentId,
              selectedEmail: selectDonorObj.email,
              receiptNum: selectDonorObj.receiptNum,
            });
          }
          return;
        } else {
          emails.forEach((e) => {
            this.selectedAccountList.push({
              accountId: accountId,
              paymentId: paymentId,
              selectedEmail: e,
              receiptNum: receiptNum,
            });
          });
        }
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => e.receiptNum !== receiptNum
        );
      }
    }
  }

  selectEmail(event, type, accountId, paymentId, email, receiptNum) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.selectAllNameCheckBox = true;
        this.selectAllEmailCheckBox = true;
        this.checkAllName();
      } else {
        this.selectAllNameCheckBox = false;
        this.selectAllEmailCheckBox = false;
        this.selectedAccountList = [];
      }
    }

    if (type === "singlecheck") {
      if (event.target.checked) {
        this.selectedAccountList.push({
          accountId: accountId,
          paymentId: paymentId,
          selectedEmail: email,
          receiptNum: receiptNum,
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => !(e.selectedEmail === email && e.receiptNum === receiptNum)
        );
      }
    }
  }

  checkAccountIsSelectOrNot(accountId): Boolean {
    const found = this.selectedAccountList.find(
      (e) => e.accountId === accountId
    );
    return found ? true : false;
  }

  checkEmailIsSelectOrNot(receiptNum, email): Boolean {
    const found = this.selectedAccountList.find(
      (e) => e.receiptNum === receiptNum && e.selectedEmail === email
    );
    return found ? true : false;
  }

  checkReceiptIsSelectOrNot(receiptNum): Boolean {
    const found = this.selectedAccountList.find(
      (e) => e.receiptNum === receiptNum
    );
    return found ? true : false;
  }

  openDonorCardPopup(accountID) {
    this.isloading = false;
    this.isDonarOpenClicked = true;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AccountId = accountID;
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,
    };

    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      modalRef.componentInstance.DonorCardData = res;
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  sendMail() {
    let dd = _(this.selectedAccountList)
      .chain()
      .groupBy((p) => p.accountId)
      .map((props) => ({
        ..._.head(props),
        ids: _.find(this.gridFilterDataList, (o) => {
          return o.accountId === _.head(props).accountId;
        }).paymentIds,
        // selectedEmail: _.map(props, p => p.selectedEmail),
      }))
      .value();

    const apiData = [];

    for (let index = 0; index < this.selectedAccountList.length; index++) {
      const element = this.selectedAccountList[index];
      // let actions =  element.ids.map(id => ({ accountId: id, EmailAddresses: element.selectedEmail }))
      apiData.push({
        accountId: element.accountId,
        id: element.paymentId,
        emailAddresses: [element.selectedEmail],
      });
    }
    if (apiData.length === 0) {
      return;
    }

    this.sendingTotalDonors = dd.length;

    this.sendBulkEmailAPIAction(apiData);
  }

  sendBulkEmailAPIAction(data) {
    this.isloading = true;
    const formData = {
      Type: this.otherInfo.type,
      FromDate:
        this.dateRange.startDate != null
          ? this.dateRange.startDate.toISOString()
          : null,
      ToDate:
        this.dateRange.endDate != null
          ? this.dateRange.endDate.toISOString()
          : null,
      BulkEmailReceiptIds: data,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };

    this.messengerService.BulkEmailReceipt(formData).subscribe(
      (res) => {
        if (res) {
          this.isloading = false;
          if (res) {
            if (this.otherInfo.type == "Payment")
              this.analytics.bulkEmailPayment();
            if (this.otherInfo.type == "Pledge")
              this.analytics.bulkEmailPledge();

            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SUCCESS_TITLE"
              ),
              text: res,
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then(() => {
              this.closePopup();
              this.commonMethodService.sendPaymentTrans(true);
              this.commonMethodService.sendPledgeTrans(true);
            });
          } else {
            Swal.fire({
              title: "Try Again!",
              text: res.errorResponse,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        }
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error,
          icon: "error",
          confirmButtonText: this.commonMethodService
            .getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK")
            .commonMethodService.getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK"),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }

  stopProccessing() {
    this.isloading = false;
  }
  // new label logic
  isBetaOpenEmail = false;
  arrowUpEmail = false;
  betaMenuEmail($event) {
    $event.stopPropagation();
    this.isBetaOpenEmail = !this.isBetaOpenEmail;
    this.arrowUpEmail = !this.arrowUpEmail;
  }
  labelNameShowHideArray = [];
  selectEmailLabels(event, labelName, i) {
    this.allEmailLabelsArray[i].isLabelNameChecked = event.target.checked;
    if (event.target.checked) {
      this.gridFilterDataList.map((item) => {
        let accountId = item.accountId;
        let receiptNum = item.receiptNum;
        let paymentId = item.paymentId;
        if (item.emailLabelArray && item.emailLabelArray.length > 0) {
          item.emailLabelArray.map((x) => {
            if (x.labelName.toLowerCase() == labelName.toLowerCase()) {
              if (!this.labelNameShowHideArray.includes(labelName)) {
                this.labelNameShowHideArray.push(labelName);
              }
              if (x.emailValue) {
                this.selectedAccountList.push({
                  accountId: accountId,
                  paymentId: paymentId,
                  selectedEmail: x.emailValue,
                  receiptNum: receiptNum,
                  labelName: labelName,
                });
              }
            }
          });
        }
      });
    } else {
      const index = this.labelNameShowHideArray.indexOf(labelName);
      if (index > -1) {
        this.labelNameShowHideArray.splice(index, 1);
      }
      this.selectedAccountList = this.selectedAccountList.filter(
        (e) => !(e.labelName == labelName)
      );
    }
  }
  isLabelChecked(accountId, selectedEmail, receiptNum, labelName) {
    console.log("accountId", accountId);
    console.log("selectedEmail", selectedEmail);
    console.log("receiptNum", receiptNum);
    console.log("labelName", labelName);
    console.log(this.selectedAccountList);
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName == labelName &&
        el.accountId == accountId &&
        el.selectedEmail == selectedEmail &&
        el.receiptNum == receiptNum
    );
    return found;
  }
  isLabelNameShowHide(labelName) {
    if (
      this.labelNameShowHideArray &&
      this.labelNameShowHideArray.length > 0 &&
      labelName
    ) {
      if (this.labelNameShowHideArray.includes(labelName)) {
        return true;
      }
    }
    return false;
  }
  selectEmailLabel(event, accountId, paymentId, email, receiptNum, labelName) {
    if (event.target.checked) {
      this.selectedAccountList.push({
        accountId: accountId,
        paymentId: paymentId,
        selectedEmail: email,
        receiptNum: receiptNum,
        labelName: labelName,
      });
    } else {
      this.selectedAccountList = this.selectedAccountList.filter(
        (e) =>
          !(
            e.selectedEmail === email &&
            e.receiptNum === receiptNum &&
            e.labelName == labelName
          )
      );
    }
  }
  getTrim(item = []) {
    return item && item.length > 0 ? item.map((e) => (!e ? "" : e.trim())) : [];
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "send_sms_actions";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
