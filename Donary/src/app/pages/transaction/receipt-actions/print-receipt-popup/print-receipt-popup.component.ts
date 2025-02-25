import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import * as _ from "lodash";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { DonorSaveComponent } from "src/app/pages/donor/donor-save/donor-save.component";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorService } from "src/app/services/donor.service";
import { PaymentCardPopupComponent } from "src/app/pages/cards/payment-card-popup/payment-card-popup.component";
import { CardService } from "src/app/services/card.service";
import { MessengerService } from "src/app/services/messenger.service";
import { PrintSingleReceiptPopupComponent } from "../print-singlereceipt-popup/print-singlereceipt-popup.component";
import { NotificationService } from "src/app/commons/notification.service";
import { PledgeCardPopupComponent } from "src/app/pages/cards/pledge-card-popup/pledge-card-popup.component";
import { PledgeService } from "src/app/services/pledge.service";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;

interface SelectedDonorObj {
  accountId: number;
  paymentId?: number;
  receiptNum?: number;
  defaultAddress?: string;
  cityStateZip?: string;
  isPrint?: boolean;
}
@Component({
  selector: "app-print-receipt-popup",
  templateUrl: "./print-receipt-popup.component.html",
  styleUrls: ["./print-receipt-popup.component.scss"],
  standalone: false,
})
export class PrintReceiptPopupComponent implements OnInit {
  @Output() emtOutput: EventEmitter<any> = new EventEmitter();

  isloading = true;
  isUpdated: boolean = false;
  modalOptions: NgbModalOptions;
  dataList: any = [];
  originalList: any = [];
  selectedAccountList: Array<SelectedDonorObj> = [];
  otherInfo: any;
  dateRange: any;
  isOnlyPledgePayment: boolean = false;
  updateAddressId = null;
  isSentDisabled: boolean = false;
  isNotSentDisabled: boolean = false;
  isSentChecked: boolean = false;
  isNotSentChecked: boolean = false;
  isSentMailDisabled: boolean = false;
  isSentMailChecked: boolean = false;
  isSentPrintChecked: boolean = false;
  isNotSentPrintDisabled: boolean = false;
  isNotSentMailChecked: boolean = false;
  isNotSentPrintChecked: boolean = false;
  isNotSentMailDisabled: boolean = false;
  isSentPrintDisabled: boolean = false;
  isHasTextChecked: boolean = false;
  isHasMailChecked: boolean = false;
  isHasPrintChecked: boolean = false;
  isMissingPrintChecked: boolean = false;
  isMissingMailChecked: boolean = false;
  isMissingChecked: boolean = false;
  isMissingMailDisabled: boolean = false;
  isMissingPrintDisabled: boolean = false;
  isMissingDisabled: boolean = false;
  isHasDisabled: boolean = false;
  isHasMailDisabled: boolean = false;
  isHasPrintDisabled: boolean = false;
  isHasChecked: boolean = false;
  isInit: boolean = true;
  gridFilterDataList: any = [];
  sendingTotalDonors: number = 0;
  analytics = inject(AnalyticsService);

  @Input() set Info(Info: boolean) {
    if (Info) {
      this.otherInfo = Info;
    }
  }

  @Input() set Duration(dateRange: boolean) {
    if (dateRange) {
      this.dateRange = dateRange;
    }
  }

  @Input() set List(datalist) {
    if (datalist) {
      this.isInit = false;
      this.isloading = false;
      if (this.otherInfo.type == "Pledge") {
        datalist.forEach((element) => {
          element.receiptNum = element.pledgeNum;
          element.paymentId = element.pledgeID;
        });
      }
      this.dataList = datalist;
      this.gridFilterDataList = datalist;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    private messengerService: MessengerService,
    private cardService: CardService,
    private pledgeService: PledgeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal_custom_header",
        cursor: "grab",
      });
    });
  }
  totalSelectedShow() {
    const dd = _(this.selectedAccountList)
      .chain()
      .groupBy((p) => p.accountId)
      .map((props) => ({
        ..._.head(props),
      }))
      .value();

    return dd.length;
  }

  sendBulkPrintAPIAction(data) {
    this.isloading = true;
    const formData = {
      Type: this.otherInfo.type,
      Ids: data,
      FromDate:
        this.dateRange.startDate != null
          ? this.dateRange.startDate.toISOString()
          : null,
      ToDate:
        this.dateRange.endDate != null
          ? this.dateRange.endDate.toISOString()
          : null,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
      receiverEmailAddress:
        data.length > 50
          ? this.localstoragedataService.getLoginUserEmail()
          : null,
    };
    this.messengerService.BulkPrintReceipt(formData).subscribe(
      (res) => {
        if (res) {
          this.isloading = false;
          if (this.otherInfo.type == "Payment")
            this.analytics.bulkPrintPayment();
          if (this.otherInfo.type == "Pledge") this.analytics.bulkPrintPledge();

          if (data.length <= 50) {
            if (!res.receiptFileUrl) {
              this.notificationService.swalAlert(
                "Try Again!",
                "No receipt found",
                "error"
              );
              return false;
            }
            this.modalOptions = {
              centered: true,
              size: "lg",
              backdrop: "static",
              keyboard: true,
              windowClass: "drag_popup print_receipt",
            };
            const modalRef = this.commonMethodService.openPopup(
              PrintSingleReceiptPopupComponent,
              this.modalOptions
            );
            modalRef.componentInstance.fileDetails = {
              filename: res.receiptFileUrl,
              filetype: res.contentType,
            };
          } else {
            this.notificationService
              .swalAlert("Success!", res, "success")
              .then(() => {
                this.closePopup();
                this.commonMethodService.sendPaymentTrans(true);
                this.commonMethodService.sendPledgeTrans(true);
              });
          }
        } else {
          this.notificationService.swalAlert(
            "Try Again!",
            res.errorResponse,
            "error"
          );
        }
      },
      (error) => {
        this.isloading = false;
        this.activeModal.dismiss();
        this.notificationService.swalAlert(
          this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          error.error,
          "error"
        );
      }
    );
  }

  mouseOutAddressEdit(paymentId, index) {
    if (this.updateAddressId == paymentId) {
      this.updateAddressId = null;
      this.isUpdated = true;
    }
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  OnSentCheckboxChange(event) {
    if (event.target.checked) {
      this.setCheckedNotSentOptions(false);
      this.setDisableNotSentOptions(true);

      this.setCheckedSentOptions(true);
      this.setDisableSentOptions(false);

      this.filterGridRows();
    } else {
      this.setCheckedSentOptions(false);
      this.setDisableNotSentOptions(false);
      this.filterGridRows();
    }
  }

  OnNotSentCheckboxChange(event) {
    if (event.target.checked) {
      this.setCheckedSentOptions(false);
      this.setDisableSentOptions(true);

      this.setCheckedNotSentOptions(true);
      this.setDisableNotSentOptions(false);

      this.filterGridRows();
    } else {
      this.setCheckedNotSentOptions(false);
      this.setDisableSentOptions(false);
      this.filterGridRows();
    }
  }

  setCheckedNotSentOptions(value: boolean) {
    this.isNotSentChecked = value;
    this.isNotSentMailChecked = value;
    this.isNotSentPrintChecked = value;
  }
  setDisableNotSentOptions(value: boolean) {
    this.isNotSentDisabled = value;
    this.isNotSentMailDisabled = value;
    this.isNotSentPrintDisabled = value;
  }

  setCheckedSentOptions(value: boolean) {
    this.isSentChecked = value;
    this.isSentMailChecked = value;
    this.isSentPrintChecked = value;
  }

  setDisableSentOptions(value: boolean) {
    this.isSentDisabled = value;
    this.isSentMailDisabled = value;
    this.isSentPrintDisabled = value;
  }

  OnMissingPrintCheckboxChange(event) {
    if (event.target.checked) {
      this.isMissingPrintChecked = true;
      this.isHasPrintDisabled = true;
      this.filterGridRows();
    } else {
      this.isMissingPrintChecked = false;
      this.isHasPrintDisabled = false;
      this.filterGridRows();
    }
  }
  sendPrint() {
    const results = _.map(this.selectedAccountList, (acc) => {
      return _.find(this.gridFilterDataList, (o) => {
        return o.paymentId == acc.paymentId;
      }).paymentId;
    });
    const Ids = _.flatten(results);
    if (Ids.length === 0) {
      return;
    }
    this.sendingTotalDonors = this.selectedAccountList.length;

    this.sendBulkPrintAPIAction(Ids);
  }

  OnMissingMailCheckboxChange(event) {
    if (event.target.checked) {
      this.isMissingMailChecked = true;
      this.isHasMailDisabled = true;
      this.filterGridRows();
    } else {
      this.isMissingMailChecked = false;
      this.isHasMailDisabled = false;
      this.filterGridRows();
    }
  }

  filterGridRows() {
    let datalist = this.originalList;

    if (this.isHasMailChecked) {
      datalist = this.hasMail(datalist);
    }
    if (this.isHasPrintChecked) {
      datalist = this.hasPrint(datalist);
    }

    if (this.isMissingPrintChecked) {
      datalist = this.missingPrint(datalist);
    }

    if (this.isMissingMailChecked) {
      datalist = this.missingMail(datalist);
    }

    // filterByStatus

    if (this.isSentMailChecked) {
      datalist = this.sentMail(datalist);
    }

    if (this.isSentPrintChecked) {
      datalist = this.sentPrint(datalist);
    }

    if (this.isNotSentMailChecked) {
      datalist = this.notSentMail(datalist);
    }

    if (this.isNotSentPrintChecked) {
      datalist = this.notSentPrint(datalist);
    }

    this.dataList = datalist;
  }

  sentMail(dataList = []) {
    return _.filter(dataList, (o) => o.mailSent);
  }

  sentPrint(dataList = []) {
    return _.filter(dataList, (o) => o.printSent);
  }

  notSentMail(dataList = []) {
    return _.filter(dataList, (o) => {
      return !o.mailSent;
    });
  }

  notSentPrint(dataList = []) {
    return _.filter(dataList, (o) => {
      return !o.printSent;
    });
  }

  hasMail(dataList = []) {
    return _.filter(dataList, (e) => {
      return e.defaultAddress && e.cityStateZip;
    });
  }

  missingMail(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.defaultAddress && !e.cityStateZip;
    });
  }
  hasPrint(dataList = []) {
    return _.filter(dataList, (e) => {
      return e.printSent;
    });
  }
  missingPrint(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.printSent;
    });
  }
  selectAddress(event, type, paymentId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          if (o.defaultAddress) {
            let objIndex = this.selectedAccountList.findIndex(
              (obj) => obj.paymentId === o.paymentId
            );
            if (objIndex !== -1) {
              this.selectedAccountList[objIndex].defaultAddress =
                o.defaultAddress;
            } else {
              this.selectedAccountList.push({
                accountId: o.accountId,
                paymentId: o.paymentId,
                defaultAddress: o.defaultAddress,
              });
            }
          }
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter((o) => {
          o.paymentId !== paymentId;
        });
      }
    } else {
      // single email select
      if (event.target.checked) {
        const found = this.dataList.find((e) => e.paymentId === paymentId);
        if (found.defaultAddress) {
          let objIndex = this.selectedAccountList.findIndex(
            (obj) => obj.paymentId === found.paymentId
          );
          if (objIndex !== -1) {
            this.selectedAccountList[objIndex].defaultAddress =
              found.defaultAddress;
          } else {
            this.selectedAccountList.push({
              accountId: found.accountId,
              paymentId: found.paymentId,
              defaultAddress: found.defaultAddress,
            });
          }
        }
      } else {
        const found = this.dataList.find((e) => e.paymentId === paymentId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.paymentId === found.paymentId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].defaultAddress = null;
        }
      }
    }
  }

  selectPrints(event, type, paymentId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          let objIndex = this.selectedAccountList.findIndex(
            (obj) => obj.paymentId === o.paymentId
          );
          if (objIndex !== -1) {
            this.selectedAccountList[objIndex].isPrint = true;
          } else {
            this.selectedAccountList.push({
              accountId: o.accountId,
              paymentId: o.paymentId,
              isPrint: true,
            });
          }
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter((o) => {
          o.paymentId !== paymentId;
        });
      }
    } else {
      // single email select
      if (event.target.checked) {
        const found = this.dataList.find((e) => e.paymentId === paymentId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.paymentId === found.paymentId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].isPrint = true;
        } else {
          this.selectedAccountList.push({
            accountId: found.accountId,
            paymentId: found.paymentId,
            isPrint: true,
          });
        }
      } else {
        const found = this.dataList.find((e) => e.paymentId === paymentId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.paymentId === found.paymentId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].isPrint = false;
        }
      }
    }
  }

  openPaymentCardPopup(paymentId) {
    if (paymentId != null && paymentId != 0) {
      if (this.otherInfo.type == "Pledge") {
        this.openPledgeCardPopup(paymentId);
      } else {
        this.isloading = false;
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
  fillSelectedObj(o): SelectedDonorObj {
    return {
      accountId: o.accountId,
      paymentId: o.paymentId,
      defaultAddress: o.defaultAddress || null,
      cityStateZip: o.cityStateZip,
      isPrint: true,
    };
  }

  OnNotSentPrintCheckboxChange(event) {
    if (event.target.checked) {
      this.isNotSentPrintChecked = true;
      this.isSentPrintDisabled = true;
      this.filterGridRows();
    } else {
      this.isNotSentPrintChecked = false;
      this.isSentPrintDisabled = false;
      this.filterGridRows();
    }
  }

  OnNotSentMailCheckboxChange(event) {
    if (event.target.checked) {
      this.isNotSentMailChecked = true;
      this.isSentMailDisabled = true;
      this.filterGridRows();
    } else {
      this.isNotSentMailChecked = false;
      this.isSentMailDisabled = false;
      this.filterGridRows();
    }
  }

  OnSentPrintCheckboxChange(event) {
    if (event.target.checked) {
      this.isSentPrintChecked = true;
      this.isNotSentPrintDisabled = true;
      this.filterGridRows();
    } else {
      this.isSentPrintChecked = false;
      this.isNotSentPrintDisabled = false;
      this.filterGridRows();
    }
  }

  OnSentMailCheckboxChange(event) {
    if (event.target.checked) {
      this.isSentMailChecked = true;
      this.isNotSentMailDisabled = true;
      this.filterGridRows();
    } else {
      this.isSentMailChecked = false;
      this.isNotSentMailDisabled = false;
      this.filterGridRows();
    }
  }

  OnMissingCheckboxChange(event) {
    if (event.target.checked) {
      this.setCheckedHasOptions(false);
      this.setDisableHasOptions(true);

      this.setCheckedMissingOptions(true);
      this.setDisableMissingOptions(false);
      this.filterGridRows();
    } else {
      this.setCheckedMissingOptions(false);
      this.setDisableHasOptions(false);
      this.filterGridRows();
    }
  }

  OnHasPrintCheckboxChange(event) {
    if (event.target.checked) {
      this.isHasPrintChecked = true;
      this.isMissingPrintDisabled = true;
      this.filterGridRows();
    } else {
      this.isHasPrintChecked = false;
      this.isMissingPrintDisabled = false;
      this.filterGridRows();
    }
  }

  OnHasMailCheckboxChange(event) {
    if (event.target.checked) {
      this.isHasMailChecked = true;
      this.isMissingMailDisabled = true;
      this.filterGridRows();
    } else {
      this.isHasMailChecked = false;
      this.isMissingMailDisabled = false;
      this.filterGridRows();
    }
  }

  OnHasCheckboxChange(event) {
    if (event.target.checked) {
      this.setCheckedMissingOptions(false);
      this.setDisableMissingOptions(true);

      this.setCheckedHasOptions(true);
      this.setDisableHasOptions(false);
      this.filterGridRows();
    } else {
      this.setCheckedHasOptions(false);
      this.setDisableMissingOptions(false);
      this.filterGridRows();
    }
  }

  findAndSelectForDonorName(found) {
    if (!this.checkAccountIsSelectOrNot(found.paymentId)) {
      let objIndex = this.selectedAccountList.findIndex(
        (obj) => obj.paymentId === found.paymentId
      );
      if (objIndex !== -1) {
        this.selectedAccountList[objIndex] = this.fillSelectedObj(found);
      } else {
        this.selectedAccountList.push({
          ...this.fillSelectedObj(found),
        });
      }
    }
  }

  selectName(event, type, paymentId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          this.findAndSelectForDonorName(o);
        });
      } else {
        this.selectedAccountList = [];
      }
    } else {
      // single donor select
      if (event.target.checked) {
        const found = this.dataList.find((e) => e.paymentId === paymentId);
        this.findAndSelectForDonorName(found);
      } else {
        this.selectedAccountList = this.selectedAccountList.filter((o) => {
          o.paymentId !== paymentId;
        });
      }
    }
  }

  editDonor(accountId) {
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorById(eventGuId, accountId)
      .subscribe((res: any) => {
        this.isloading = false;
        modalRef.componentInstance.Type = "edit";
        modalRef.componentInstance.EditDonorData = res;
      });
    //
    modalRef.componentInstance.emtOutputEditDonorUpdatedValue.subscribe(
      (res: any) => {
        var resultA = this.dataList;
        for (var i = 0; i < resultA.length; i++) {
          //Here your confition for which item you went to edit
          if (resultA[i].accountId == res.accountId) {
            //Here you logic for update property
            resultA[i].fullNameJewish = res.fullNameJewish;

            if (res.accountPhones && res.accountPhones.length > 0) {
              for (let index = 0; index < res.accountPhones.length; index++) {
                const element = res.accountPhones[index];
                if (element.isDefault) {
                  resultA[i].phoneNumber = element.phoneNumber;
                }
              }
            }
            if (res.accountEmails && res.accountEmails.length) {
              for (let index = 0; index < res.accountEmails.length; index++) {
                const element = res.accountEmails[index];
                if (element.isDefault) {
                  resultA[i].email = element.emailAddress;
                }
              }
            }
            if (res.donorAddresses && res.donorAddresses.length) {
              for (let index = 0; index < res.donorAddresses.length; index++) {
                const element = res.donorAddresses[index];
                if (element.isDefault) {
                  resultA[i].defaultAddress =
                    element.houseNum +
                    ", " +
                    element.street +
                    ", " +
                    element.unit +
                    ", " +
                    element.city +
                    ", " +
                    element.state +
                    ", " +
                    element.zip;
                }
              }
            }
          }
        }
        this.dataList = resultA;
      }
    );
    //
  }

  checkAccountIsSelectOrNot(accId) {
    const found = this.selectedAccountList.find((e) => e.paymentId === accId);
    return found ? true : false;
  }
  checkDonorIsDisable(accId) {
    const found = this.dataList.find((e) => e.paymentId === accId);
    !found.defaultAddress && !found.cityStateZip;
  }
  checkMailIsSelectOrNot(accId, defaultAddress) {
    const found = this.selectedAccountList.find(
      (e) =>
        e.paymentId === accId &&
        e.defaultAddress &&
        e.defaultAddress === defaultAddress
    );
    return found ? true : false;
  }
  checkDonorMailDisable(accId) {
    const found = this.dataList.find((e) => e.paymentId === accId);
    return !found.defaultAddress && !found.cityStateZip;
  }
  checkPrintIsSelectOrNot(accId) {
    const found = this.selectedAccountList.find(
      (e) => e.paymentId === accId && e.isPrint
    );
    return found ? true : false;
  }
  clearAllFilters() {
    // sent
    this.setCheckedSentOptions(false);
    this.setCheckedNotSentOptions(false);
    this.setDisableSentOptions(false);
    this.setDisableNotSentOptions(false);

    // missing
    this.setCheckedHasOptions(false);
    this.setDisableHasOptions(false);
    this.setCheckedMissingOptions(false);
    this.setDisableMissingOptions(false);

    this.dataList = this.originalList;
  }
  setCheckedHasOptions(value: boolean) {
    this.isHasChecked = value;
    this.isHasMailChecked = value;
    this.isHasPrintChecked = value;
  }

  setCheckedMissingOptions(value: boolean) {
    this.isMissingChecked = value;
    this.isMissingMailChecked = value;
    this.isMissingPrintChecked = value;
  }

  setDisableHasOptions(value: boolean) {
    this.isHasDisabled = value;
    this.isHasMailDisabled = value;
    this.isHasPrintDisabled = value;
  }

  setDisableMissingOptions(value: boolean) {
    this.isMissingDisabled = value;
    this.isMissingMailDisabled = value;
    this.isMissingPrintDisabled = value;
  }
}
