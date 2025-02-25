import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import * as _ from "lodash";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { MessengerService } from "src/app/services/messenger.service";
import { SendReceiptPopupComponent } from "../send-receipt-popup/send-receipt-popup.component";
import { DonorSaveComponent } from "../donor-save/donor-save.component";
import { DonorService } from "src/app/services/donor.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { AddressValidateService } from "src/app/services/address-validate.service";
import { forkJoin } from "rxjs";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";

declare var $: any;
interface SelectedDonorObj {
  accountId: number;
  email?: string;
  phoneNumber?: string;
  address?: string;
  addressId?: string;
  cityStateZip?: string;
  isPrint?: boolean;
  labelName?: string;
  labelType?: string;
}
@Component({
  selector: "app-bulk-advance-statement",
  templateUrl: "./bulk-advance-statement.component.html",
  standalone: false,
  styleUrls: ["./bulk-advance-statement.component.scss"],
})
export class BulkAdvanceStatementComponent implements OnInit {
  isUpdated: boolean = false;
  isloading: boolean = true;
  isHasDisabled: boolean = false;
  isHasChecked: boolean = false;
  isNotSentTextChecked: boolean = false;
  isNotSentEmailChecked: boolean = false;
  isNotSentMailChecked: boolean = false;
  isNotSentPrintChecked: boolean = false;
  isSentTextChecked: boolean = false;
  isSentEmailChecked: boolean = false;
  isSentMailChecked: boolean = false;
  isSentPrintChecked: boolean = false;
  isNotSentTextDisabled: boolean = false;
  isNotSentEmailDisabled: boolean = false;
  isNotSentMailDisabled: boolean = false;
  isNotSentPrintDisabled: boolean = false;
  isSentTextDisabled: boolean = false;
  isSentEmailDisabled: boolean = false;
  isSentMailDisabled: boolean = false;
  isSentPrintDisabled: boolean = false;
  isSentDisabled: boolean = false;
  isNotSentDisabled: boolean = false;
  isSentChecked: boolean = false;
  isNotSentChecked: boolean = false;
  isHasTextChecked: boolean = false;
  isHasMailChecked: boolean = false;
  isHasPrintChecked: boolean = false;
  isHasEmailChecked: boolean = false;
  isMissingChecked: boolean = false;
  isMissingTextChecked: boolean = false;
  isMissingMailChecked: boolean = false;
  isMissingPrintChecked: boolean = false;
  isMissingEmailChecked: boolean = false;
  isHasTextDisabled: boolean = false;
  isHasMailDisabled: boolean = false;
  isHasPrintDisabled: boolean = false;
  isHasEmailDisabled: boolean = false;
  isMissingDisabled: boolean = false;
  isMissingTextDisabled: boolean = false;
  isMissingMailDisabled: boolean = false;
  isMissingEmailDisabled: boolean = false;
  isMissingPrintDisabled: boolean = false;
  isLabelSelected: boolean = false;
  selectedAccountList: Array<SelectedDonorObj> = [];

  dataList: any = [];
  donNotCallAllAddressValidation: boolean = false;
  updatePhoneNumberId = null;
  updateEmailId = null;
  updateAddressId = null;
  modalOptions: NgbModalOptions;

  otherInfo: any;
  dateRange: any;
  isOnlyPledgePayment = false;
  statementType: any;
  originalList: any = [];
  hidePaymentsList: boolean = false;
  hide0BalancePledges: boolean = false;
  statementSpecificFilters: any;
  allSelection = [];
  @ViewChildren("phonenumberspans") phonenumberspans: QueryList<ElementRef>;
  @ViewChildren("addressspans") addressspans: QueryList<ElementRef>;
  @ViewChildren("emailspans") emailspans: QueryList<ElementRef>;
  @ViewChild("elemRef", { static: false }) elemRef!: ElementRef;
  @Input() set List(datalist) {
    this.isloading = true;
    if (datalist) {
      this.setValue(datalist);
    }
  }

  @Input() set OnlyPledgePayment(isOnlyPledgePayment: boolean) {
    if (isOnlyPledgePayment) {
      this.isOnlyPledgePayment = isOnlyPledgePayment;
    }
  }
  @Input() set statementTypeV(statementType: any) {
    if (statementType) {
      this.statementType = statementType;
    }
  }
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
  @Input() set PaymentAndBalancePledges(item: any) {
    if (item) {
      this.hidePaymentsList = item.hidePaymentsList;
      this.hide0BalancePledges = item.hide0BalancePledges;
    }
  }
  @Input() set objAdvancedSearch(item: any) {
    if (item) {
      this.statementSpecificFilters = item;
    }
  }
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    private messengerService: MessengerService,
    private donorService: DonorService,
    private addressValidateService: AddressValidateService,
    private commonAPIMethodService: CommonAPIMethodService,
    private paymentTransactionService: PaymentTransactionService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal_custom_header,.modal__custom_footer",
        cursor: "grab",
        cancel: ".filter_section,.accordion",
      });
    });
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

  checkAndGetEmail(option, withMatch: string) {
    if (option.emailSentList) {
      const element = option.emailSentList[0];
      if (element && element == withMatch && option.email) {
        return option.email;
      }
      return null;
    }
    return null;
  }

  checkAndGetPhone(option, withMatch: string) {
    if (option.smsSentList) {
      const element = option.smsSentList[0];
      if (element && element == withMatch && option.phoneNumber) {
        return option.phoneNumber;
      }
      return null;
    }
    return null;
  }

  setCheckedSentOptions(value: boolean) {
    this.isSentChecked = value;
    this.isSentTextChecked = value;
    this.isSentEmailChecked = value;
    this.isSentMailChecked = value;
    this.isSentPrintChecked = value;
  }

  setCheckedNotSentOptions(value: boolean) {
    this.isNotSentChecked = value;
    this.isNotSentTextChecked = value;
    this.isNotSentEmailChecked = value;
    this.isNotSentMailChecked = value;
    this.isNotSentPrintChecked = value;
  }

  setDisableSentOptions(value: boolean) {
    this.isSentDisabled = value;
    this.isSentTextDisabled = value;
    this.isSentEmailDisabled = value;
    this.isSentMailDisabled = value;
    this.isSentPrintDisabled = value;
  }

  setDisableNotSentOptions(value: boolean) {
    this.isNotSentDisabled = value;
    this.isNotSentTextDisabled = value;
    this.isNotSentEmailDisabled = value;
    this.isNotSentMailDisabled = value;
    this.isNotSentPrintDisabled = value;
  }

  setCheckedHasOptions(value: boolean) {
    this.isHasChecked = value;
    this.isHasTextChecked = value;
    this.isHasEmailChecked = value;
    this.isHasMailChecked = value;
    this.isHasPrintChecked = value;
  }

  setCheckedMissingOptions(value: boolean) {
    this.isMissingChecked = value;
    this.isMissingTextChecked = value;
    this.isMissingEmailChecked = value;
    this.isMissingMailChecked = value;
    this.isMissingPrintChecked = value;
  }

  setDisableHasOptions(value: boolean) {
    this.isHasDisabled = value;
    this.isHasTextDisabled = value;
    this.isHasEmailDisabled = value;
    this.isHasMailDisabled = value;
    this.isHasPrintDisabled = value;
  }

  setDisableMissingOptions(value: boolean) {
    this.isMissingDisabled = value;
    this.isMissingTextDisabled = value;
    this.isMissingEmailDisabled = value;
    this.isMissingMailDisabled = value;
    this.isMissingPrintDisabled = value;
  }

  totalSelectedShow() {
    this.allSelection = [];
    const dd = _(this.selectedAccountList)
      .chain()
      .groupBy((p) => p.accountId)
      .map((props) => ({
        ..._.head(props),
      }))
      .value();
    return dd.length;
  }

  sentText(dataList = []) {
    return _.reduce(
      dataList,
      (filtered, option) => {
        let phoneNumber = this.checkAndGetPhone(option, "1");
        if (!!phoneNumber) {
          filtered.push({ ...option, phoneNumber: phoneNumber });
        }
        return filtered;
      },
      []
    );
  }

  sentEmail(dataList = []) {
    return _.reduce(
      dataList,
      (filtered, option) => {
        let email = this.checkAndGetEmail(option, "1");

        if (!!email) {
          filtered.push({ ...option, email: email });
        }

        return filtered;
      },
      []
    );
    return;
  }

  sentMail(dataList = []) {
    return _.filter(dataList, (o) => o.mailSent);
  }

  sentPrint(dataList = []) {
    return _.filter(dataList, (o) => o.printSent);
  }

  notSentText(dataList = []) {
    return _.reduce(
      dataList,
      (filtered, option) => {
        let phoneNumber = this.checkAndGetPhone(option, "0");
        if (!!phoneNumber) {
          filtered.push({ ...option, phoneNumber: phoneNumber });
        }
        return filtered;
      },
      []
    );
  }

  notSentEmail(dataList = []) {
    return _.reduce(
      dataList,
      (filtered, option) => {
        let email = this.checkAndGetEmail(option, "0");

        if (!!email) {
          filtered.push({ ...option, email: email });
        }

        return filtered;
      },
      []
    );
    return;
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

  hasText(dataList = []) {
    return _.filter(dataList, (e) => {
      return e.phonenumbers;
    });
  }

  missingText(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.phonenumbers;
    });
  }

  hasEmail(dataList = []) {
    return _.filter(dataList, (e) => {
      return e.emails;
    });
  }

  hasPrint(dataList = []) {
    return _.filter(dataList, (e) => {
      return e.printSent;
    });
  }

  missingEmail(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.emails;
    });
  }

  missingPrint(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.printSent;
    });
  }

  hasMail(dataList = []) {
    return _.filter(dataList, (e) => {
      return e.accountAddresses && e.accountAddresses2; //e.address && e.cityStateZip;
    });
  }

  missingMail(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.accountAddresses && !e.accountAddresses2; //!e.address && !e.cityStateZip;
    });
  }

  filterGridRows() {
    let datalist = this.originalList;

    if (this.isHasTextChecked) {
      datalist = this.hasText(datalist);
    }

    if (this.isHasEmailChecked) {
      datalist = this.hasEmail(datalist);
    }

    if (this.isHasMailChecked) {
      datalist = this.hasMail(datalist);
    }
    if (this.isHasPrintChecked) {
      datalist = this.hasPrint(datalist);
    }

    if (this.isMissingTextChecked) {
      datalist = this.missingText(datalist);
    }

    if (this.isMissingEmailChecked) {
      datalist = this.missingEmail(datalist);
    }
    if (this.isMissingPrintChecked) {
      datalist = this.missingPrint(datalist);
    }

    if (this.isMissingMailChecked) {
      datalist = this.missingMail(datalist);
    }

    // filterByStatus
    if (this.isSentTextChecked) {
      datalist = this.sentText(datalist);
    }

    if (this.isSentEmailChecked) {
      datalist = this.sentEmail(datalist);
    }

    if (this.isSentMailChecked) {
      datalist = this.sentMail(datalist);
    }

    if (this.isSentPrintChecked) {
      datalist = this.sentPrint(datalist);
    }

    if (this.isNotSentTextChecked) {
      datalist = this.notSentText(datalist);
    }

    if (this.isNotSentEmailChecked) {
      datalist = this.notSentEmail(datalist);
    }

    if (this.isNotSentMailChecked) {
      datalist = this.notSentMail(datalist);
    }

    if (this.isNotSentPrintChecked) {
      datalist = this.notSentPrint(datalist);
    }

    this.dataList = datalist;
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

  OnHasTextCheckboxChange(event) {
    if (event.target.checked) {
      this.isHasTextChecked = true;
      this.isMissingTextDisabled = true;
      this.filterGridRows();
    } else {
      this.isHasTextChecked = false;
      this.isMissingTextDisabled = false;
      this.filterGridRows();
    }
  }

  OnHasEmailCheckboxChange(event) {
    if (event.target.checked) {
      this.isHasEmailChecked = true;
      this.isMissingEmailDisabled = true;
      this.filterGridRows();
    } else {
      this.isHasEmailChecked = false;
      this.isMissingEmailDisabled = false;
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

  OnMissingTextCheckboxChange(event) {
    if (event.target.checked) {
      this.isMissingTextChecked = true;
      this.isHasTextDisabled = true;
      this.filterGridRows();
    } else {
      this.isMissingTextChecked = false;
      this.isHasTextDisabled = false;
      this.filterGridRows();
    }
  }

  OnMissingEmailCheckboxChange(event) {
    if (event.target.checked) {
      this.isMissingEmailChecked = true;
      this.isHasEmailDisabled = true;
      this.filterGridRows();
    } else {
      this.isMissingEmailChecked = false;
      this.isHasEmailDisabled = false;
      this.filterGridRows();
    }
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

  fillSelectedObj(o): SelectedDonorObj {
    return {
      accountId: o.accountId,
      email: o.emails || null,
      phoneNumber: o.phonenumbers || null,
      address: o.accountAddresses || null,
      cityStateZip: o.cityStateZip,
      isPrint: true,
    };
  }

  findAndSelectForDonorName(found) {
    if (!this.checkAccountIsSelectOrNot(found.accountId)) {
      let objIndex = this.selectedAccountList.findIndex(
        (obj) => obj.accountId === found.accountId
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

  selectName(event, type, accountId) {
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
        const found = this.dataList.find((e) => e.accountId === accountId);
        this.findAndSelectForDonorName(found);
      } else {
        this.selectedAccountList = this.selectedAccountList.filter((o) => {
          o.accountId !== accountId;
        });
      }
    }
  }

  selectPhoneNumber(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          if (o.phonenumbers) {
            let objIndex = this.selectedAccountList.findIndex(
              (obj) => obj.accountId === o.accountId
            );
            if (objIndex !== -1) {
              this.selectedAccountList[objIndex].phoneNumber = o.phonenumbers;
            } else {
              this.selectedAccountList.push({
                accountId: o.accountId,
                phoneNumber: o.phonenumbers,
              });
            }
          }
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter((o) => {
          o.accountId !== accountId;
        });
      }
    } else {
      // single phone select
      if (event.target.checked) {
        const found = this.dataList.find((e) => e.accountId === accountId);
        if (found.phonenumbers) {
          let objIndex = this.selectedAccountList.findIndex(
            (obj) => obj.accountId === found.accountId
          );
          if (objIndex !== -1) {
            this.selectedAccountList[objIndex].phoneNumber = found.phonenumbers;
          } else {
            this.selectedAccountList.push({
              accountId: found.accountId,
              phoneNumber: found.phonenumbers,
            });
          }
        }
      } else {
        const found = this.dataList.find((e) => e.accountId === accountId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.accountId === found.accountId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].phoneNumber = null;
        }
      }
    }
  }

  selectEmail(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          if (o.emails) {
            let objIndex = this.selectedAccountList.findIndex(
              (obj) => obj.accountId === o.accountId
            );
            if (objIndex !== -1) {
              this.selectedAccountList[objIndex].email = o.emails;
            } else {
              this.selectedAccountList.push({
                accountId: o.accountId,
                email: o.emails,
              });
            }
          }
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter((o) => {
          o.accountId !== accountId;
        });
      }
    } else {
      // single email select
      if (event.target.checked) {
        const found = this.dataList.find((e) => e.accountId === accountId);
        if (found.emails) {
          let objIndex = this.selectedAccountList.findIndex(
            (obj) => obj.accountId === found.accountId
          );
          if (objIndex !== -1) {
            this.selectedAccountList[objIndex].email = found.emails;
          } else {
            this.selectedAccountList.push({
              accountId: found.accountId,
              email: found.emails,
            });
          }
        }
      } else {
        const found = this.dataList.find((e) => e.accountId === accountId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.accountId === found.accountId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].email = null;
        }
      }
    }
  }

  selectAddress(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          if (o.accountAddresses) {
            let objIndex = this.selectedAccountList.findIndex(
              (obj) => obj.accountId === o.accountId
            );
            if (objIndex !== -1) {
              this.selectedAccountList[objIndex].address = o.accountAddresses;
            } else {
              this.selectedAccountList.push({
                accountId: o.accountId,
                address: o.accountAddresses,
              });
            }
          }
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter((o) => {
          o.accountId !== accountId;
        });
      }
    } else {
      // single email select
      if (event.target.checked) {
        const found = this.dataList.find((e) => e.accountId === accountId);
        if (found.accountAddresses) {
          let objIndex = this.selectedAccountList.findIndex(
            (obj) => obj.accountId === found.accountId
          );
          if (objIndex !== -1) {
            this.selectedAccountList[objIndex].address = found.accountAddresses;
          } else {
            this.selectedAccountList.push({
              accountId: found.accountId,
              address: found.accountAddresses,
            });
          }
        }
      } else {
        const found = this.dataList.find((e) => e.accountId === accountId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.accountId === found.accountId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].address = null;
        }
      }
    }
  }

  selectPrints(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          let objIndex = this.selectedAccountList.findIndex(
            (obj) => obj.accountId === o.accountId
          );
          if (objIndex !== -1) {
            this.selectedAccountList[objIndex].isPrint = true;
          } else {
            this.selectedAccountList.push({
              accountId: o.accountId,
              isPrint: true,
            });
          }
        });
        return false;
      }
      this.selectedAccountList = this.selectedAccountList.filter(
        (o) => o.labelName
      );
      this.selectedAccountList = this.selectedAccountList.map((item) => {
        return {
          ...item,
          isPrint: false,
        };
      });
    } else {
      // single email select
      if (event.target.checked) {
        const found = this.dataList.find((e) => e.accountId === accountId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.accountId === found.accountId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].isPrint = true;
        } else {
          this.selectedAccountList.push({
            accountId: found.accountId,
            isPrint: true,
          });
        }
      } else {
        const found = this.dataList.find((e) => e.accountId === accountId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.accountId === found.accountId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].isPrint = false;
          this.selectedAccountList = this.selectedAccountList.filter(
            (x) => x.labelType != undefined
          );
        }
      }
    }
  }

  openDonorCardPopup(accountID) {
    this.isloading = false;
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
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      SendReceiptPopupComponent,
      this.modalOptions
    );

    modalRef.componentInstance.List = this.selectedAccountList;
    modalRef.componentInstance.Info = this.otherInfo;
    modalRef.componentInstance.Duration = this.dateRange;
    modalRef.componentInstance.emtOutputPrint.subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      var selectedAccountList = this.selectedAccountList;
      this.dataList.forEach((element) => {
        for (var item of this.selectedAccountList) {
          if (
            element.accountId == item.accountId &&
            element.accountId == item.accountId
          ) {
            element.printSent = true;
          }
        }
      });
    });
  }

  checkAccountIsSelectOrNot(accId) {
    const found = this.selectedAccountList.find((e) => e.accountId === accId);
    return found ? true : false;
  }

  checkEmailIsSelectOrNot(accId, email) {
    const found = this.selectedAccountList.find(
      (e) => e.accountId === accId && e.email && e.email === email
    );
    return found ? true : false;
  }

  checkPhoneIsSelectOrNot(accId, phoneNumber) {
    const found = this.selectedAccountList.find(
      (e) =>
        e.accountId === accId && e.phoneNumber && e.phoneNumber === phoneNumber
    );
    return found ? true : false;
  }

  checkMailIsSelectOrNot(accId, address) {
    const found = this.selectedAccountList.find(
      (e) => e.accountId === accId && e.address && e.address === address
    );
    return found ? true : false;
  }

  checkPrintIsSelectOrNot(accId) {
    const found = this.selectedAccountList.find(
      (e) => e.accountId === accId && e.isPrint
    );
    return found ? true : false;
  }

  checkDonorIsDisable(accId) {
    const found = this.dataList.find((e) => e.accountId === accId);
    !found.email && !found.phoneNumber && !found.address && !found.cityStateZip;
  }

  checkDonorPhoneDisable(accId) {
    const found = this.dataList.find((e) => e.accountId === accId);
    return !found.phonenumbers; //!found.phoneNumber
  }

  checkDonorEmailDisable(accId) {
    const found = this.dataList.find((e) => e.accountId === accId);
    return !found.emails; //!found.email
  }

  checkDonorMailDisable(accId) {
    const found = this.dataList.find((e) => e.accountId === accId);
    return !found.address && !found.cityStateZip;
  }

  stopProccessing() {
    this.isloading = false;
  }
  //
  beforePhoneNumberEdit(accountId, index) {
    this.updatePhoneNumberId = accountId;
    // wait a tick
    setTimeout(() => {
      this.phonenumberspans.toArray()[index].nativeElement.focus();
    });
  }

  mouseOutPhoneNumberEdit(paymentId, index) {
    if (this.updatePhoneNumberId == paymentId) {
      this.updatePhoneNumberId = null;
      this.isUpdated = true;
    }
  }
  mouseOutAddressEdit(paymentId, index) {
    if (this.updateAddressId == paymentId) {
      this.updateAddressId = null;
      this.isUpdated = true;
    }
  }
  beforeAddressEdit(accountId, index) {
    this.updateAddressId = accountId;
    // wait a tick
    setTimeout(() => {
      this.addressspans.toArray()[index].nativeElement.focus();
    });
  }

  mouseOutEmailEdit(paymentId, index) {
    if (this.updateEmailId == paymentId) {
      this.updateEmailId = null;
      this.isUpdated = true;
    }
  }
  beforeEmailEdit(accountId, index) {
    this.updateEmailId = accountId;
    // wait a tick
    setTimeout(() => {
      this.emailspans.toArray()[index].nativeElement.focus();
    });
  }

  @ViewChild("insideElement", { static: false }) insideElement;
  @HostListener("document:click", ["$event.target"])
  public onClick(targetElement) {
    var kk = targetElement.parentElement.className;
    if (kk == "input_value") {
      this.isUpdated = true;
      this.updateEmailId = null;
      this.updatePhoneNumberId = null;
    } else if (kk == "edit text-info") {
    } else if (kk == "edit text-info p") {
      this.updateEmailId = null;
      this.isUpdated = true;
      this.updateAddressId = null;
    } else if (kk == "edit text-info e") {
      this.updateAddressId = null;
      this.isUpdated = true;
      this.updatePhoneNumberId = null;
    } else if (kk == "edit text-info a") {
      this.updateEmailId = null;
      this.isUpdated = true;
      this.updatePhoneNumberId = null;
    } else if (kk == "blk-td-email-box") {
    } else if (kk == "blk-td-phone-box") {
    } else {
      this.updateAddressId = null;
      this.isUpdated = true;
      this.updateEmailId = null;
      this.updatePhoneNumberId = null;
    }
  }
  updateAndSendReceipts() {
    this.isloading = true;

    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      SendReceiptPopupComponent,
      this.modalOptions
    );

    modalRef.componentInstance.List = this.selectedAccountList;
    modalRef.componentInstance.Info = this.otherInfo;
    modalRef.componentInstance.Duration = this.dateRange;
    modalRef.componentInstance.OnlyPledgePayment = this.isOnlyPledgePayment;
    modalRef.componentInstance.statementTypeV = this.statementType;
    modalRef.componentInstance.PaymentAndBalancePledges = {
      hidePaymentsList: this.hidePaymentsList,
      hide0BalancePledges: this.hide0BalancePledges,
    };
    modalRef.componentInstance.objAdvancedSearch =
      this.statementSpecificFilters;
    //modalRef.componentInstance.donorCount=this.allSelection.length

    modalRef.componentInstance.emtOutputPrint.subscribe((res: any) => {
      // hide loader

      this.isloading = false;
      var selectedAccountList = this.selectedAccountList;
      this.dataList.forEach((element) => {
        for (var item of this.selectedAccountList) {
          if (
            element.accountId == item.accountId &&
            element.accountId == item.accountId
          ) {
            element.printSent = true;
          }
        }
      });
    });
  }
  bulkSMSReceipt(BulkEmailReceiptIds) {
    const formData = {
      Type: this.otherInfo.type,
      // FromDate: this.dateRange.startDate != null ? this.dateRange.startDate.toISOString() : null,
      //ToDate: this.dateRange.endDate != null ? this.dateRange.endDate.toISOString(): null,
      BulkEmailReceiptIds: BulkEmailReceiptIds,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      hidePaymentsList: this.hidePaymentsList,
      hide0BalancePledges: this.hide0BalancePledges,
    };

    this.messengerService.BulkSMSReceipt(formData).subscribe(
      (res) => {
        if (res) {
          this.isloading = false;
          if (res) {
          } else {
          }
        }
      },
      (error) => {
        this.isloading = false;
        console.log(error);
      }
    );
  }
  //
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
        // hide loader
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
                  resultA[i].phonenumbers = element.phoneNumber;
                }
              }
            }
            if (res.accountEmails && res.accountEmails.length) {
              for (let index = 0; index < res.accountEmails.length; index++) {
                const element = res.accountEmails[index];
                if (element.isDefault) {
                  resultA[i].emails = element.emailAddress;
                }
              }
            }
            if (res.donorAddresses && res.donorAddresses.length) {
              for (let index = 0; index < res.donorAddresses.length; index++) {
                const element = res.donorAddresses[index];
                if (element.isDefault) {
                  resultA[i].accountAddresses1 =
                    element.houseNum +
                    ", " +
                    element.street +
                    ", " +
                    element.unit;
                  resultA[i].accountAddresses2 =
                    element.city + ", " + element.state + ", " + element.zip;
                }
              }
            }
          }
        }
        this.dataList = resultA;
      }
    );
  }

  allPhoneLabelsArray = [];
  allEmailLabelsArray = [];
  allAddressLabelsArray = [];
  labelNameShowHideArray = [];
  emailLabelNameShowHideArray = [];
  AddressLabelNameShowHideArray = [];
  isBetaOpen = false;
  arrowUp = false;
  isBetaOpenEmail = false;
  arrowUpEmail = false;
  isBetaOpenAddress = false;
  setValue(datalist) {
    this.isloading = true;
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId)
      .subscribe((res: any) => {
        this.allPhoneLabelsArray = res.filter((x) => x.labelType == "Phone");
        this.allEmailLabelsArray = res.filter((x) => x.labelType == "Email");
        this.allAddressLabelsArray = res.filter(
          (x) => x.labelType == "Address"
        );

        datalist = datalist.map((x, index) => {
          const phoneLabels = this.getSplit(x.additionalPhoneLabels);
          const phoneNumbers = this.getSplit(x.additionalPhoneNumbers);
          const phoneObj = this.addLabels(
            phoneLabels,
            phoneNumbers,
            "Phone",
            index
          );
          const phoneLabelArray = this.addLabelRemoveDuplicate(
            this.allPhoneLabelsArray,
            phoneObj
          );
          const emailLabels = this.getSplit(x.emailLabels);
          const emails = this.getSplit(x.emails);
          const emailObj = this.addLabels(emailLabels, emails, "Email", index);
          const emailLabelArray = this.addLabelRemoveDuplicate(
            this.allEmailLabelsArray,
            emailObj
          );
          const addressLabels = this.getSplit(x.accountAddressLabels, ";");
          const addresses = this.getSplit(x.accountAddresses, ";");
          const addressId = this.getSplit(x.addressIds, ",");
          const addressObj = this.addLabels(
            addressLabels,
            addresses,
            "Address",
            index,
            addressId
          );
          const addressLabelArray = this.addLabelRemoveDuplicate(
            this.allAddressLabelsArray,
            addressObj
          );
          return {
            ...x,
            phoneLabelArray,
            emailLabelArray,
            addressLabelArray,
          };
        });

        this.dataList = datalist;

        this.originalList = datalist;
        const objEvent = { target: { checked: true } };
        let objIndex = this.getLabelIndex(this.allPhoneLabelsArray, "Cell");
        if (objIndex !== -1) {
          this.selecCellNumbertLabels(objEvent, "Cell", objIndex, "Phone");
        }
        objIndex = this.getLabelIndex(this.allEmailLabelsArray, "Home");
        if (objIndex !== -1) {
          this.selectEmailLabels(objEvent, "Home", objIndex, "Email");
        }
        objIndex = this.getLabelIndex(this.allAddressLabelsArray, "Home");
        if (objIndex !== -1) {
          this.selectAddressLabels(objEvent, "Home", objIndex, "Address");
        }

        const allValidationReq = _.chunk(this.originalList, 5).map(
          (grpChunk) => {
            // this.isloading=true
            const grpChunkxmlsList = grpChunk.map((o) => {
              let adressStr = this.addressValidateService.validateAddress(
                o.address
              );
              let cityStateZipObj =
                this.addressValidateService.validateCityStateAndZip(
                  o.cityStateZip
                );
              if (
                o.accountAddressLabels &&
                o.accountAddressLabels.indexOf("Home") > -1 &&
                this.selectedAccountList.find(
                  (x) => x.accountId == o.accountId && x.labelType == "Address"
                )
              ) {
                return this.addressValidateService.getUniqAddressXMLNode(
                  o.accountId,
                  adressStr,
                  cityStateZipObj.city,
                  cityStateZipObj.state,
                  cityStateZipObj.zip
                );
              }
            });

            const formData =
              this.addressValidateService.getAddressValidateRequestPayload(
                grpChunkxmlsList.join("")
              );

            return this.messengerService.ValidateMultipleAddress(formData);
          }
        );
        forkJoin(allValidationReq).subscribe((results) => {
          const validationResults = _.flatten(results);

          this.dataList = this.originalList.map((o) => {
            let findResponse = validationResults.find(
              (x) => x.ID == o.accountId
            );
            if (findResponse) {
              if (!findResponse.isValid) {
                this.removeInvalidAddressFromSelection(o.accountId);
              }
              return {
                ...o,
                validation: findResponse,
              };
            }
            return {
              ...o,
            };
          });
          this.isloading = false;
        });
      });
  }
  betaMenu($event) {
    $event.stopPropagation();
    this.isBetaOpen = !this.isBetaOpen;
    this.arrowUp = !this.arrowUp;
    this.isBetaOpenEmail = false;
    this.isBetaOpenAddress = false;
  }

  selecCellNumbertLabels(event, labelName, i, labelType) {
    this.allPhoneLabelsArray[i].isLabelNameChecked = event.target.checked;
    if (event.target.checked) {
      if (
        !this.labelNameShowHideArray.find(
          (label) => labelName.toLowerCase() == label.toLowerCase()
        )
      ) {
        this.labelNameShowHideArray.push(labelName);
      }
      for (let index = 0; index < this.dataList.length; index++) {
        const item = this.dataList[index];
        this.selectAllLabels(
          item.phoneLabelArray,
          labelName,
          labelType,
          item.accountId
        );
      }
      return false;
    }
    const index = this.labelNameShowHideArray
      .map((label) => label.toLowerCase())
      .indexOf(labelName.toLowerCase());
    if (index > -1) {
      this.labelNameShowHideArray.splice(index, 1);
    }
    this.selectedAccountList = this.selectedAccountList.filter((o) => {
      if (
        o.labelName.toLocaleLowerCase() == labelName.toLocaleLowerCase() &&
        o.labelType.toLocaleLowerCase() == labelType.toLocaleLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }
  isLabelNameShowHide(labelName) {
    return (
      this.labelNameShowHideArray &&
      this.labelNameShowHideArray.length > 0 &&
      labelName &&
      this.labelNameShowHideArray.find(
        (label) => labelName.toLowerCase() == label.toLowerCase()
      )
    );
  }

  isCellLabelChecked(accountId, selectedPhone, labelName, labelType) {
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName.toLowerCase() == labelName.toLowerCase() &&
        el.accountId == accountId &&
        el.phoneNumber == selectedPhone &&
        el.labelType == labelType
    );
    return found;
  }

  betaMenuEmail($event) {
    $event.stopPropagation();
    this.isBetaOpenEmail = !this.isBetaOpenEmail;
    this.arrowUpEmail = !this.arrowUpEmail;
    this.isBetaOpen = false;
    this.isBetaOpenAddress = false;
  }

  selectEmailLabels(event, labelName, i, labelType) {
    this.allEmailLabelsArray[i].isLabelNameChecked = event.target.checked;
    if (event.target.checked) {
      if (
        !this.emailLabelNameShowHideArray.find(
          (label) => labelName.toLowerCase() == label.toLowerCase()
        )
      ) {
        this.emailLabelNameShowHideArray.push(labelName);
      }
      for (let index = 0; index < this.dataList.length; index++) {
        const item = this.dataList[index];
        this.selectAllLabels(
          item.emailLabelArray,
          labelName,
          labelType,
          item.accountId
        );
      }
      return false;
    }
    const index = this.emailLabelNameShowHideArray
      .map((label) => label.toLowerCase())
      .indexOf(labelName.toLowerCase());
    if (index > -1) {
      this.emailLabelNameShowHideArray.splice(index, 1);
    }
    this.selectedAccountList = this.selectedAccountList.filter((o) => {
      if (o.labelName == labelName && o.labelType == labelType) {
        return false;
      }
      return true;
    });
  }

  isEmailLabelNameShowHide(labelName) {
    return (
      this.emailLabelNameShowHideArray &&
      this.emailLabelNameShowHideArray.length > 0 &&
      labelName &&
      this.emailLabelNameShowHideArray.find(
        (label) => labelName.toLowerCase() == label.toLowerCase()
      )
    );
  }

  isEmailLabelChecked(accountId, selectedEmail, labelName, labelType) {
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName.toLowerCase() == labelName.toLowerCase() &&
        el.accountId == accountId &&
        el.email == selectedEmail &&
        el.labelType == labelType
    );
    return found;
  }

  getSplit(item, separator = ",") {
    if (item != undefined && item != null && item && item.length > 0) {
      let sptItem = item.split(separator);
      return sptItem.map((e) => (!e ? "" : e.trim()));
    }
    return [];
  }
  addLabels(
    itemLabels = [],
    valuelList = [],
    labelType = "",
    i = "",
    addressId = null
  ) {
    let resultValue = [];
    for (let index = 0; index < itemLabels.length; index++) {
      let label = itemLabels[index];
      let value = valuelList[index];
      let labelId = `${labelType}_${i}_${index}`;
      let addressIdValue = addressId && addressId[index];
      let obj = {};
      if (label && labelType != "Address") {
        obj = {
          labelID: labelId,
          labelType: labelType,
          labelName: label,
          labelValue: value,
        };
      } else {
        obj = this.createAddressObj(
          labelId,
          labelType,
          label,
          value,
          addressIdValue
        );
      }
      resultValue.push(obj);
    }
    return resultValue;
  }

  createAddressObj(id, type, name, value, addressId) {
    let obj = {
      labelID: id,
      labelType: type,
      labelName: name,
      labelValue: value,
      addressId: addressId,
    };
    return obj;
  }
  addLabelRemoveDuplicate(allLabel = [], objArray = []) {
    let resultArray = objArray;
    allLabel.map((item) => {
      const found = objArray.some(
        (el) => el.labelName.toLowerCase() == item.labelName.toLowerCase()
      );
      let resValue = objArray
        .filter(
          (x) => x.labelName.toLowerCase() == item.labelName.toLowerCase()
        )
        .map((x) => x.addressId)
        .toString();
      if (!found) {
        if (item.labelType == "Address") {
          resultArray.push(
            this.createAddressObj(
              item.labelID,
              item.labelType,
              item.labelName,
              "",
              resValue
            )
          );
        } else {
          resultArray.push({
            labelID: item.labelID,
            labelType: item.labelType,
            labelName: item.labelName,
            labelValue: "",
          });
        }
      }
    });
    return resultArray;
  }

  betaMenuAddress($event) {
    $event.stopPropagation();
    this.isBetaOpenAddress = !this.isBetaOpenAddress;
    this.isBetaOpen = false;
    this.isBetaOpenEmail = false;
  }

  selectAddressLabels(event, labelName, i, labelType) {
    this.allAddressLabelsArray[i].isLabelNameChecked = event.target.checked;
    if (event.target.checked) {
      if (
        !this.AddressLabelNameShowHideArray.find(
          (label) => labelName.toLowerCase() == label.toLowerCase()
        )
      ) {
        this.AddressLabelNameShowHideArray.push(labelName);
      }
      for (let index = 0; index < this.dataList.length; index++) {
        const item = this.dataList[index];
        const isValid =
          item.validation == undefined
            ? true
            : item.validation.isValid
            ? true
            : false;
        this.selectAllLabels(
          item.addressLabelArray,
          labelName,
          labelType,
          item.accountId,
          isValid
        );
      }

      return false;
    }
    const index = this.AddressLabelNameShowHideArray.map((label) =>
      label.toLowerCase()
    ).indexOf(labelName.toLowerCase());
    if (index > -1) {
      this.AddressLabelNameShowHideArray.splice(index, 1);
    }
    this.selectedAccountList = this.selectedAccountList.filter((o) => {
      if (o.labelName == labelName && o.labelType == labelType) {
        return false;
      }
      return true;
    });
  }

  isAddressLabelNameShowHide(labelName) {
    return (
      this.AddressLabelNameShowHideArray &&
      this.AddressLabelNameShowHideArray.length > 0 &&
      labelName &&
      this.AddressLabelNameShowHideArray.find(
        (label) => labelName.toLowerCase() == label.toLowerCase()
      )
    );
  }

  isAddressLabelChecked(accountId, selectedAddress, labelName, labelType) {
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName.toLowerCase() == labelName.toLowerCase() &&
        el.accountId == accountId &&
        el.address == selectedAddress &&
        el.labelType == labelType
    );
    return found;
  }

  selectAllLabels(
    lableArray = [],
    labelName = "",
    labelType = "",
    accountId,
    isValid = true
  ) {
    if (lableArray && lableArray.length > 0) {
      for (let index = 0; index < lableArray.length; index++) {
        const element = lableArray[index];
        const labelValue = element.labelValue ? element.labelValue.trim() : "";
        const addressId = element.addressId ? element.addressId.trim() : "";
        if (
          element.labelName.toLowerCase() == labelName.toLowerCase() &&
          labelValue &&
          isValid
        ) {
          const obj = this.getParameters(
            accountId,
            labelValue,
            labelName,
            labelType,
            addressId
          );
          this.selectedAccountList.push(obj);
        }
      }
    }
  }

  getLabelIndex(labelsArray = [], labelName = "") {
    return labelsArray.findIndex(
      (obj) => obj.labelName.toLowerCase() == labelName.toLowerCase()
    );
  }
  deSelectLabel(event, accountId, labelValue, labelName, labelType) {
    // this.isLabelSelected=true
    if (event.target.checked) {
      const obj = this.getParameters(
        accountId,
        labelValue,
        labelName,
        labelType
      );
      this.selectedAccountList.push(obj);
      return false;
    }
    this.selectedAccountList = this.selectedAccountList.filter(
      (e) =>
        !(
          e.accountId == accountId &&
          e.labelName.toLowerCase() == labelName.toLowerCase() &&
          e.labelType == labelType
        )
    );
  }

  getParameters(accountId, labelValue, labelName, labelType, addressId = null) {
    let obj: SelectedDonorObj = {
      accountId: accountId,
      labelName: labelName,
      labelType: labelType,
    };
    obj =
      labelType == "Phone"
        ? { ...obj, phoneNumber: labelValue }
        : labelType == "Email"
        ? { ...obj, email: labelValue }
        : labelType == "Address"
        ? { ...obj, address: labelValue, addressId: addressId }
        : obj;
    return obj;
  }

  validateAllAddresses() {
    const allValidationReq = _.chunk(this.originalList, 5).map((grpChunk) => {
      this.isloading = true;
      const grpChunkXmlsList = grpChunk.map((o) => {
        let addressStr = this.addressValidateService.validateAddress(o.address);
        let cityStateZipObj =
          this.addressValidateService.validateCityStateAndZip(o.cityStateZip);
        if (
          o.accountAddressLabels &&
          o.accountAddressLabels.indexOf("Home") > -1 &&
          this.selectedAccountList.find(
            (x) => x.accountId == o.accountId && x.labelType == "Address"
          )
        ) {
          return this.addressValidateService.getUniqAddressXMLNode(
            o.accountId,
            addressStr,
            cityStateZipObj.city,
            cityStateZipObj.state,
            cityStateZipObj.zip
          );
        }
      });

      const formData =
        this.addressValidateService.getAddressValidateRequestPayload(
          grpChunkXmlsList.join("")
        );

      return this.messengerService.ValidateMultipleAddress(formData);
    });
    forkJoin(allValidationReq).subscribe((results) => {
      const validationResults = _.flatten(results);
      this.dataList = this.originalList.map((o) => {
        let findResponse = validationResults.find((x) => x.ID == o.accountId);
        if (findResponse) {
          return {
            ...o,
            validation: findResponse,
          };
        } else {
          this.removeInvalidAddressFromSelection(o.accountId);
          return {
            ...o,
            validation: {
              ID: o.accountId,
              isValid: false,
              message: "Invalid",
            },
          };
        }
      });
      this.isloading = false;

      const checkIfAllValid = this.dataList.filter((o) => {
        return o.validation.isValid === false;
      });
      if (checkIfAllValid.length === 0) {
        // call bulk recipt API
        this.updateAndSendReceipts();
      }
    });
  }

  @HostListener("document:click", ["$event.target"])
  clickedOut(targetElement) {
    const clsName = targetElement.parentElement.className;
    const clickedInside = this.elemRef.nativeElement.contains(targetElement);
    if (
      !clickedInside &&
      clsName !== "list" &&
      clsName !== "ul-list" &&
      clsName !== "label-dropdown" &&
      clsName !== "label-block"
    ) {
      this.isBetaOpen = false;
      this.isBetaOpenAddress = false;
      this.isBetaOpenEmail = false;
    }
  }

  private removeInvalidAddressFromSelection(accountId: number) {
    this.selectedAccountList = this.selectedAccountList.filter((x) => {
      if (x.accountId != accountId) {
        return true;
      }
      if (x.accountId == accountId && x.labelType != "Address") {
        return true;
      }
      return false;
    });
  }
}
