import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { SendReceiptPopupComponent } from "../send-receipt-popup/send-receipt-popup.component";
import * as _ from "lodash";
import { DonorSaveComponent } from "../../donor/donor-save/donor-save.component";
import { DonorService } from "src/app/services/donor.service";
import { PaymentCardPopupComponent } from "../../cards/payment-card-popup/payment-card-popup.component";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { AddressValidateService } from "src/app/services/address-validate.service";
import { MessengerService } from "src/app/services/messenger.service";
import { forkJoin } from "rxjs";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { PledgeTransactionService } from "src/app/services/pledge-transaction.service";
declare var $: any;

interface SelectedDonorObj {
  accountId: number;
  paymentId?: number;
  email?: string;
  phoneNumber?: string;
  defaultAddress?: string;
  cityStateZip?: string;
  isPrint?: boolean;
  labelName?: string;
  labelType?: string;
  addressId?: string;
  address?: string;
}

@Component({
  selector: "app-advancereceipt-action-popup",
  templateUrl: "./advancereceipt-action-popup.component.html",
  styleUrls: ["./advancereceipt-action-popup.component.scss"],
  standalone: false,
})
export class AdvancereceiptActionPopupComponent implements OnInit {
  @ViewChildren("namecheckboxes") namecheckboxes: QueryList<ElementRef>;
  @ViewChildren("phonecheckboxes") phonecheckboxes: QueryList<ElementRef>;
  @ViewChildren("emailcheckboxes") emailcheckboxes: QueryList<ElementRef>;
  @ViewChildren("addresscheckboxes") addresscheckboxes: QueryList<ElementRef>;
  @ViewChildren("phonenumberspans") phonenumberspans: QueryList<ElementRef>;
  @ViewChildren("emailspans") emailspans: QueryList<ElementRef>;
  @ViewChildren("addressspans") addressspans: QueryList<ElementRef>;
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
  isUpdated: boolean = false;
  isHasChecked: boolean = false;
  isHasTextChecked: boolean = false;
  isHasMailChecked: boolean = false;
  isHasPrintChecked: boolean = false;
  isHasEmailChecked: boolean = false;
  isMissingChecked: boolean = false;
  isMissingTextChecked: boolean = false;
  isMissingMailChecked: boolean = false;
  isMissingPrintChecked: boolean = false;
  isMissingEmailChecked: boolean = false;
  isHasDisabled: boolean = false;
  isHasTextDisabled: boolean = false;
  isHasMailDisabled: boolean = false;
  isHasPrintDisabled: boolean = false;
  isHasEmailDisabled: boolean = false;
  isMissingDisabled: boolean = false;
  isMissingTextDisabled: boolean = false;
  isMissingMailDisabled: boolean = false;
  isMissingEmailDisabled: boolean = false;
  isMissingPrintDisabled: boolean = false;
  isBulkAddressDisabled: boolean = false;
  allSelection = [];
  selectedAfterChecked = [];
  selectedAccountList: Array<SelectedDonorObj> = [];
  updatePhoneNumberId = null;
  updateEmailId = null;
  updateAddressId = null;
  isloading: boolean = false;
  modalOptions: NgbModalOptions;
  dataList: any = [];

  otherInfo: any;
  dateRange: any;

  originalList: any = [];
  allPhoneLabelsArray = [];
  allEmailLabelsArray = [];
  isDonarOpenClicked = false;
  recordSelectedArray = [];
  isBetaOpenAddress = false;
  allAddressLabelsArray = [];
  AddressLabelNameShowHideArray = [];
  recallAllAddressValidation: boolean = true;
  // @Input() set List(datalist) {

  //   this.uppr(datalist)

  // }
  @Input() set List(datalist) {
    this.isloading = true;
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId)
      .subscribe((res: any) => {
        this.allPhoneLabelsArray = res;
        this.allEmailLabelsArray = res;
        this.allPhoneLabelsArray = this.allPhoneLabelsArray.filter(
          (x) => x.labelType == "Phone"
        );
        this.allPhoneLabelsArray = this.allPhoneLabelsArray.map((item) => {
          item.isLabelNameChecked = false;
          return item;
        });
        this.allEmailLabelsArray = this.allEmailLabelsArray.filter(
          (x) => x.labelType == "Email"
        );
        this.allEmailLabelsArray = this.allEmailLabelsArray.map((item) => {
          item.isLabelNameChecked = false;
          return item;
        });
        this.allAddressLabelsArray = res.filter(
          (x) => x.labelType == "Address"
        );
        this.allAddressLabelsArray = this.allAddressLabelsArray.map((item) => {
          item.isLabelNameChecked = false;
          return item;
        });
        datalist = datalist.map((x, index) => {
          if (!x.phoneLabels) {
            x.phoneLabels = ",";
            x.phoneNumbers = ",";
            x.smsSent = ",";
          }
          if (x.phoneLabels && x.phoneNumbers && x.smsSent) {
            let keys = x.phoneLabels.split(",");
            let values = x.phoneNumbers.split(",");
            let smsSent = x.smsSent.split(",");
            keys = keys.map((s) => s.trim());
            values = values.map((s) => s.trim());
            smsSent = smsSent.map((s) => s.trim());
            this.allPhoneLabelsArray.map((item) => {
              if (!keys.includes(item.labelName)) {
                keys.push(item.labelName);
                values.push("");
                smsSent.push("0");
              }
            });

            let obj = [];
            for (let i = 0; i < keys.length; i++) {
              const found = this.allPhoneLabelsArray.some(
                (el) => el.labelName.toLowerCase() == keys[i].toLowerCase()
              );
              if (found) {
                obj.push({
                  labelID: index + "_" + i,
                  labelType: "Phone",
                  labelName: keys[i],
                  phoneValue: values[i],
                  smsSent: smsSent[i],
                });
              }
            }
            x.phoneLabelArray = obj;
          }
          //email label logic
          if (!x.emailLabels) {
            x.emailLabels = ",";
            x.emailAddresses = ",";
          }
          if (x.emailLabels && x.emailAddresses) {
            let emailObj = [];
            let emailLabels = x.emailLabels.split(",");
            let emailList = x.emailAddresses.split(",");
            emailLabels = emailLabels.map((s) => s.trim());
            for (let index = 0; index < emailLabels.length; index++) {
              const label = emailLabels[index];
              const value = emailList[index];
              if (label) {
                emailObj.push({
                  labelID: index,
                  labelType: "Email",
                  labelName: label,
                  emailValue: value,
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
                });
            });
            x.emailLabelArray = emailObj;
          }
          const addressLabels = this.getSplit(x.addressLabels, ";");
          const addresses = this.getSplit(x.addresses, ";");
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
            addressLabelArray,
          };
        });

        if (datalist) {
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
          this.isloading = false;
        }
      });
  }

  @Input() set Duration(dateRange: boolean) {
    this.isloading = true;
    if (dateRange) {
      this.dateRange = dateRange;
    }
  }

  @Input() set Info(Info: any) {
    this.isloading = true;
    if (Info) {
      this.otherInfo = Info;
      if (Info.recordSelectedArray) {
        this.recordSelectedArray = Info.recordSelectedArray;
      }
    }
  }
  @Input() pageRoot: string;
  @Output() emtOutput: EventEmitter<any> = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    private donorService: DonorService,
    private commonAPIMethodService: CommonAPIMethodService,
    private addressValidateService: AddressValidateService,
    private messengerService: MessengerService,
    private paymentTransactionService: PaymentTransactionService,
    private pledgeTransactionService: PledgeTransactionService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal_custom_header,.modal__custom_footer",
        cursor: "grab",
        cancel: ".filter_section,.accordion",
      });
    });
    this.commonMethodService.getPaymentTransactionData().subscribe((res) => {
      //return
      if (res && this.isDonarOpenClicked) {
        //reaload label and checkbox logic
        this.isloading = true;
        let resultArray = [];
        for (const item of this.recordSelectedArray) {
          var donorDetails = res.find((x) => x.paymentId == item);
          resultArray.push(donorDetails);
        }
        resultArray.forEach((element) => {
          if (
            element.defaultAddress != null &&
            element.defaultAddress.indexOf(",") > -1
          ) {
            element.defaultAddress = element.defaultAddress.replaceAll(",", "");
          }
        });
        // address validation
        let listMailData = _(resultArray)
          .chain()
          .groupBy((p) => p.receiptNum)
          .map((props) => {
            return {
              ..._.head(props),
              paymentIds: _.map(props, (p) => p.paymentId),
            };
          })
          .value();

        const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
        this.commonAPIMethodService
          .getLabelText(eventGuId)
          .subscribe((res: any) => {
            this.allPhoneLabelsArray = res;
            this.allEmailLabelsArray = res;
            this.allPhoneLabelsArray = this.allPhoneLabelsArray.filter(
              (x) => x.labelType == "Phone"
            );
            this.allPhoneLabelsArray = this.allPhoneLabelsArray.map((item) => {
              item.isLabelNameChecked = this.labelNameShowHideArray.includes(
                item.labelName
              );
              return item;
            });
            this.allEmailLabelsArray = this.allEmailLabelsArray.filter(
              (x) => x.labelType == "Email"
            );
            this.allEmailLabelsArray = this.allEmailLabelsArray.map((item) => {
              item.isLabelNameChecked =
                this.emailLabelNameShowHideArray.includes(item.labelName);
              return item;
            });

            let datalist = listMailData;
            datalist = datalist.map((x, index) => {
              if (!x.phoneLabels) {
                x.phoneLabels = ",";
                x.phoneNumbers = ",";
                x.smsSent = ",";
              }
              if (x.phoneLabels && x.phoneNumbers && x.smsSent) {
                let keys = x.phoneLabels.split(",");
                let values = x.phoneNumbers.split(",");
                let smsSent = x.smsSent.split(",");
                keys = keys.map((s) => s.trim());
                values = values.map((s) => s.trim());
                smsSent = smsSent.map((s) => s.trim());
                this.allPhoneLabelsArray.map((item) => {
                  if (!keys.includes(item.labelName)) {
                    keys.push(item.labelName);
                    values.push("");
                    smsSent.push("0");
                  }
                });

                let obj = [];
                for (let i = 0; i < keys.length; i++) {
                  const found = this.allPhoneLabelsArray.some(
                    (el) => el.labelName.toLowerCase() == keys[i].toLowerCase()
                  );
                  if (found) {
                    obj.push({
                      labelID: index + "_" + i,
                      labelType: "Phone",
                      labelName: keys[i],
                      phoneValue: values[i],
                      smsSent: smsSent[i],
                    });
                  }
                }
                x.phoneLabelArray = obj;
              }
              //email label logic
              if (!x.emailLabels) {
                x.emailLabels = ",";
                x.emailAddresses = ",";
              }
              if (x.emailLabels && x.emailAddresses) {
                let emailObj = [];
                let emailLabels = x.emailLabels.split(",");
                let emailList = x.emailAddresses.split(",");
                emailLabels = emailLabels.map((s) => s.trim());
                for (let index = 0; index < emailLabels.length; index++) {
                  const label = emailLabels[index];
                  const value = emailList[index];
                  if (label) {
                    emailObj.push({
                      labelID: index,
                      labelType: "Email",
                      labelName: label,
                      emailValue: value,
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
                    });
                });
                x.emailLabelArray = emailObj;
              }
              return x;
            });

            this.dataList = datalist;
            this.originalList = datalist;
            //update checkbox
            this.selectedAccountList = this.selectedAccountList.filter(
              (item) => {
                if (item.defaultAddress || item.cityStateZip || item.isPrint) {
                  return true;
                }
                return false;
              }
            );
            this.selectedAccountList = this.selectedAccountList.map((item) => {
              if (item.labelType) {
                item.email = "";
                item.phoneNumber = "";
              }
              return item;
            });
            this.dataList.map((item) => {
              if (item.phoneLabelArray && item.phoneLabelArray.length > 0) {
                item.phoneLabelArray.map((x) => {
                  if (this.labelNameShowHideArray.includes(x.labelName)) {
                    if (x.phoneValue) {
                      this.selectedAccountList.push({
                        accountId: item.accountId,
                        paymentId: item.paymentId,
                        phoneNumber: x.phoneValue,
                        labelName: x.labelName,
                        labelType: x.labelType,
                      });
                    }
                  }
                });
              }
              if (item.emailLabelArray && item.emailLabelArray.length > 0) {
                item.emailLabelArray.map((x) => {
                  if (this.emailLabelNameShowHideArray.includes(x.labelName)) {
                    if (x.emailValue) {
                      this.selectedAccountList.push({
                        accountId: item.accountId,
                        paymentId: item.paymentId,
                        email: x.emailValue,
                        labelName: x.labelName,
                        labelType: x.labelType,
                      });
                    }
                  }
                });
              }
            });

            this.isloading = false;
          });
      }
    });
    this.GetList();
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
    return {
      labelID: id,
      labelType: type,
      labelName: name,
      labelValue: value,
      addressId: addressId,
    };
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
          let res = this.createAddressObj(
            item.labelID,
            item.labelType,
            item.labelName,
            "",
            resValue
          );
          resultArray.push(res);
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

  getSplit(item, separator = ",") {
    if (item != undefined && item != null && item && item.length > 0) {
      let sptItem = item.split(separator);
      return sptItem.map((e) => (!e ? "" : e.trim()));
    }
    return [];
  }
  getLabelIndex(labelsArray = [], labelName = "") {
    return labelsArray.findIndex((obj) => obj.labelName == labelName);
  }

  GetList() {
    for (var i = 0; i < this.dataList.length; i++) {
      if (this.dataList[i].defaultPhone) {
        this.dataList[i].phoneNumber = this.dataList[i].defaultPhone;
      } else {
        if (
          this.dataList[i].phoneNumbers &&
          this.dataList[i].phoneNumbers.indexOf(",") > -1
        ) {
          let keys = this.dataList[i].smsSentList;
          let values = this.dataList[i].phoneNumberList;
          const phoneNumberListArray = keys.map(function (k, index) {
            return { isSent: [k][0], phoneNumber: values[index] };
          });
          const obj = keys.reduce(
            (obj, key, index) => ({ ...obj, [key]: values[index] }),
            {}
          );
          this.dataList[i].phoneNumber = obj[1] == undefined ? obj[0] : obj[1];
          this.dataList[i].phoneNumberListArray = phoneNumberListArray.filter(
            (item) => item.phoneNumber != this.dataList[i].phoneNumber
          );
        } else {
          this.dataList[i].phoneNumber = this.dataList[i].phoneNumbers;
        }
      }
      if (this.dataList[i].defaultEmail) {
        this.dataList[i].email = this.dataList[i].defaultEmail;
      } else {
        if (
          this.dataList[i].emailAddresses &&
          this.dataList[i].emailAddresses.indexOf(",") > -1
        ) {
          var emailArray = this.dataList[i].emailAddresses.split(",");
          this.dataList[i].email = emailArray[0];
        } else {
          this.dataList[i].email = this.dataList[i].emailAddresses;
        }
      }
      if (this.dataList[i].defaultAddress) {
        this.dataList[i].defaultAddress = this.dataList[i].defaultAddress;
      }
    }

    this.originalList = this.dataList;
  }

  openPaymentCardPopup(paymentId) {
    if (paymentId != null && paymentId != 0) {
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
      if (element && element == withMatch) {
        return true;
      }
      return false;
    }
    return false;
  }

  checkAndGetPhone(option, withMatch: string) {
    if (option.smsSentList) {
      const element = option.smsSentList[0];
      if (element && element == withMatch) {
        return true;
      }
      return false;
    }
    return false;
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
    return _.filter(dataList, (option) => {
      let phoneNumber = this.checkAndGetPhone(option, "1");
      if (!!phoneNumber) {
        return true;
      }
      return false;
    });
  }

  sentEmail(dataList = []) {
    return _.filter(dataList, (option) => {
      let email = this.checkAndGetEmail(option, "1");
      if (!!email) {
        return true;
      }
      return false;
    });
  }

  sentMail(dataList = []) {
    return _.filter(dataList, (o) => o.mailSent);
  }

  sentPrint(dataList = []) {
    return _.filter(dataList, (o) => o.printSent);
  }

  notSentText(dataList = []) {
    return _.filter(dataList, (option) => {
      let phoneNumber = this.checkAndGetPhone(option, "0");
      if (!!phoneNumber) {
        return true;
      }
      return false;
    });
  }

  notSentEmail(dataList = []) {
    return _.filter(dataList, (option) => {
      let email = this.checkAndGetEmail(option, "0");
      if (!!email) {
        return true;
      }
      return false;
    });
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
      return e.phoneNumber;
    });
  }

  missingText(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.phoneNumber;
    });
  }

  hasEmail(dataList = []) {
    return _.filter(dataList, (e) => {
      return e.email;
    });
  }

  hasPrint(dataList = []) {
    return _.filter(dataList, (e) => {
      return e.printSent;
    });
  }

  missingEmail(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.email;
    });
  }

  missingPrint(dataList = []) {
    return _.filter(dataList, (e) => {
      return !e.printSent;
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

  OnSentTextCheckboxChange(event) {
    if (event.target.checked) {
      this.isSentTextChecked = true;
      this.isNotSentTextDisabled = true;
      this.filterGridRows();
    } else {
      this.isSentTextChecked = false;
      this.isNotSentTextDisabled = false;
      this.filterGridRows();
    }
  }

  OnSentEmailCheckboxChange(event) {
    if (event.target.checked) {
      this.isSentEmailChecked = true;
      this.isNotSentEmailDisabled = true;
      this.filterGridRows();
    } else {
      this.isSentEmailChecked = false;
      this.isNotSentEmailDisabled = false;
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

  OnNotSentTextCheckboxChange(event) {
    if (event.target.checked) {
      this.isNotSentTextChecked = true;
      this.isSentTextDisabled = true;
      this.filterGridRows();
    } else {
      this.isNotSentTextChecked = false;
      this.isSentTextDisabled = false;
      this.filterGridRows();
    }
  }

  OnNotSentEmailCheckboxChange(event) {
    if (event.target.checked) {
      this.isNotSentEmailChecked = true;
      this.isSentEmailDisabled = true;
      this.filterGridRows();
    } else {
      this.isNotSentEmailChecked = false;
      this.isSentEmailDisabled = false;
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

  beforePhoneNumberEdit(accountId, index) {
    this.updatePhoneNumberId = accountId;
    // wait a tick
    setTimeout(() => {
      this.phonenumberspans.toArray()[index].nativeElement.focus();
    });
  }

  beforeEmailEdit(accountId, index) {
    this.updateEmailId = accountId;
    // wait a tick
    setTimeout(() => {
      this.emailspans.toArray()[index].nativeElement.focus();
    });
  }

  mouseOutEmailEdit(paymentId, index) {
    if (this.updateEmailId == paymentId) {
      this.updateEmailId = null;
      this.isUpdated = true;
    }
  }

  mouseOutAddressEdit(paymentId, index) {
    if (this.updateAddressId == paymentId) {
      this.updateAddressId = null;
      this.isUpdated = true;
    }
  }

  mouseOutPhoneNumberEdit(paymentId, index) {
    if (this.updatePhoneNumberId == paymentId) {
      this.updatePhoneNumberId = null;
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

  fillSelectedObj(o): SelectedDonorObj {
    return {
      accountId: o.accountId,
      paymentId: o.paymentId,
      email: o.email || null,
      phoneNumber: o.phoneNumber || null,
      defaultAddress: o.defaultAddress || null,
      cityStateZip: o.cityStateZip,
      isPrint: true,
    };
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

  selectPhoneNumber(event, type, paymentId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          if (o.phoneNumber) {
            let objIndex = this.selectedAccountList.findIndex(
              (obj) => obj.paymentId === o.paymentId
            );
            if (objIndex !== -1) {
              this.selectedAccountList[objIndex].phoneNumber = o.phoneNumber;
            } else {
              this.selectedAccountList.push({
                accountId: o.accountId,
                paymentId: o.paymentId,
                phoneNumber: o.phoneNumber,
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
      // single phone select
      if (event.target.checked) {
        const found = this.dataList.find((e) => e.paymentId === paymentId);
        if (found.phoneNumber) {
          let objIndex = this.selectedAccountList.findIndex(
            (obj) => obj.paymentId === found.paymentId
          );
          if (objIndex !== -1) {
            this.selectedAccountList[objIndex].phoneNumber = found.phoneNumber;
          } else {
            this.selectedAccountList.push({
              accountId: found.accountId,
              paymentId: found.paymentId,
              phoneNumber: found.phoneNumber,
            });
          }
        }
      } else {
        const found = this.dataList.find((e) => e.paymentId === paymentId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.paymentId === found.paymentId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].phoneNumber = null;
        }
      }
    }
  }

  selectEmail(event, type, paymentId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.dataList.map((o) => {
          if (o.email) {
            let objIndex = this.selectedAccountList.findIndex(
              (obj) => obj.paymentId === o.paymentId
            );
            if (objIndex !== -1) {
              this.selectedAccountList[objIndex].email = o.email;
            } else {
              this.selectedAccountList.push({
                accountId: o.accountId,
                paymentId: o.paymentId,
                email: o.email,
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
        if (found.email) {
          let objIndex = this.selectedAccountList.findIndex(
            (obj) => obj.paymentId === found.paymentId
          );
          if (objIndex !== -1) {
            this.selectedAccountList[objIndex].email = found.email;
          } else {
            this.selectedAccountList.push({
              accountId: found.accountId,
              paymentId: found.paymentId,
              email: found.email,
            });
          }
        }
      } else {
        const found = this.dataList.find((e) => e.paymentId === paymentId);
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.paymentId === found.paymentId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].email = null;
        }
      }
    }
  }
  betaMenuAddress($event) {
    $event.stopPropagation();
    this.isBetaOpenAddress = !this.isBetaOpenAddress;
  }
  selectAddressLabels(event, labelName, i, labelType) {
    this.allAddressLabelsArray[i].isLabelNameChecked = event.target.checked;
    if (event.target.checked) {
      if (!this.AddressLabelNameShowHideArray.includes(labelName)) {
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
          item.paymentId,
          isValid
        );
      }
      return false;
    }
    const index = this.AddressLabelNameShowHideArray.indexOf(labelName);
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
      this.AddressLabelNameShowHideArray.includes(labelName)
    );
  }

  isAddressLabelChecked(
    paymentId,
    accountId,
    selectedAddress,
    labelName,
    labelType
  ) {
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName == labelName &&
        el.paymentId == paymentId &&
        el.accountId == accountId &&
        el.address == selectedAddress &&
        el.labelType == labelType
    );
    return found;
  }

  deSelectLabel(event, paymentId, accountId, labelValue, labelName, labelType) {
    if (event.target.checked) {
      const obj = this.getParameters(
        accountId,
        paymentId,
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
          e.labelName == labelName &&
          e.labelType == labelType
        )
    );
  }
  selectAllLabels(
    lableArray = [],
    labelName = "",
    labelType = "",
    accountId,
    paymentId,
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
            paymentId,
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

  getParameters(
    accountId,
    paymentId,
    labelValue,
    labelName,
    labelType,
    addressId = null
  ) {
    let obj: SelectedDonorObj = {
      accountId: accountId,
      paymentId: paymentId,
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
    //this.isloading=true
    let isError = false;
    const allValidationReq = _.chunk(this.originalList, 5).map((grpChunk) => {
      const grpChunkxmlsList = grpChunk.map((o) => {
        let adressStr = this.addressValidateService.validateAddress(o.address);
        let cityStateZipObj =
          this.addressValidateService.validateCityStateAndZip(o.cityStateZip);
        if (
          o.addressLabels &&
          o.addressLabels.indexOf("Home") > -1 &&
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
    });

    forkJoin(allValidationReq).subscribe((results) => {
      const validationResults = _.flatten(results);
      this.dataList = this.originalList.map((o) => {
        let findResponse = validationResults.find((x) => x.ID == o.accountId);
        if (findResponse) {
          if (!isError) {
            isError =
              findResponse && findResponse.isValid == true ? false : true;
          }
          if (!findResponse.isValid) {
            this.selectedAccountList = this.selectedAccountList.filter(
              (x) => x.accountId != o.accountId
            );
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
      // this.sortGridDataWithErrorsFirst()
      this.isloading = false;

      if (isError) {
        return false;
      } else {
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
          this.closePopup();
          this.emtOutput.emit(true);
        });
      }
    });
  }

  checkAccountIsSelectOrNot(accId) {
    const found = this.selectedAccountList.find((e) => e.paymentId === accId);
    return found ? true : false;
  }

  checkEmailIsSelectOrNot(accId, email) {
    const found = this.selectedAccountList.find(
      (e) => e.paymentId === accId && e.email && e.email === email
    );
    return found ? true : false;
  }

  checkPhoneIsSelectOrNot(accId, phoneNumber) {
    const found = this.selectedAccountList.find(
      (e) =>
        e.paymentId === accId && e.phoneNumber && e.phoneNumber === phoneNumber
    );
    return found ? true : false;
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

  checkPrintIsSelectOrNot(accId) {
    const found = this.selectedAccountList.find(
      (e) => e.paymentId === accId && e.isPrint
    );
    return found ? true : false;
  }

  checkDonorIsDisable(accId) {
    const found = this.dataList.find((e) => e.paymentId === accId);
    !found.email &&
      !found.phoneNumber &&
      !found.defaultAddress &&
      !found.cityStateZip;
  }

  checkDonorPhoneDisable(accId) {
    const found = this.dataList.find((e) => e.paymentId === accId);
    return !found.phoneNumber;
  }

  checkDonorEmailDisable(accId) {
    const found = this.dataList.find((e) => e.paymentId === accId);
    return !found.email;
  }

  checkDonorMailDisable(accId) {
    const found = this.dataList.find((e) => e.paymentId === accId);
    if (found && (found.address === "" || found.cityStateZip === "")) {
      return true;
    } else if (found && !found.validation.isValid) {
      return true;
    } else {
      return false;
    }
  }

  stopProccessing() {
    this.isloading = false;
  }
  editDonor(accountId) {
    this.isDonarOpenClicked = true;
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

    modalRef.componentInstance.emtOutputEditDonorUpdatedValue.subscribe(
      (res: any) => {
        this.isloading = true;
      }
    );
  }

  dropdownMenuCount(phoneNumberList) {
    if (phoneNumberList && phoneNumberList.length > 1) {
      return phoneNumberList.length;
    }
    return 0;
  }

  dropdownSelectPhoneNumber(event, paymentId, phoneNumber) {
    if (event.target.checked) {
      const found = this.dataList.find((e) => e.paymentId === paymentId);
      if (found.phoneNumberList.includes(phoneNumber)) {
        let objIndex = this.selectedAccountList.findIndex(
          (obj) => obj.paymentId === found.paymentId
        );
        if (objIndex !== -1) {
          this.selectedAccountList[objIndex].phoneNumber = found.phoneNumber;
        } else {
          this.selectedAccountList.push({
            accountId: found.accountId,
            paymentId: found.paymentId,
            phoneNumber: phoneNumber,
          });
        }
      }
    } else {
      const found = this.dataList.find((e) => e.paymentId === paymentId);
      let objIndex = this.selectedAccountList.findIndex(
        (obj) => obj.paymentId === found.paymentId
      );
      if (objIndex !== -1) {
        this.selectedAccountList[objIndex].phoneNumber = null;
      }
    }
  }

  //new label logic
  isBetaOpen = false;
  arrowUp = false;
  betaMenu($event) {
    $event.stopPropagation();
    this.isBetaOpen = !this.isBetaOpen;
    this.arrowUp = !this.arrowUp;
  }
  isBetaOpenEmail = false;
  arrowUpEmail = false;
  betaMenuEmail($event) {
    $event.stopPropagation();
    this.isBetaOpenEmail = !this.isBetaOpenEmail;
    this.arrowUpEmail = !this.arrowUpEmail;
  }

  labelNameShowHideArray = [];
  selecCellNumbertLabels(event, labelName, i, labelType) {
    this.allPhoneLabelsArray[i].isLabelNameChecked = event.target.checked;
    if (event.target.checked) {
      this.dataList.map((item) => {
        if (item.phoneLabelArray && item.phoneLabelArray.length > 0) {
          item.phoneLabelArray.map((x) => {
            if (x.labelName.toLowerCase() == labelName.toLowerCase()) {
              if (!this.labelNameShowHideArray.includes(labelName)) {
                this.labelNameShowHideArray.push(labelName);
              }
              if (x.phoneValue) {
                this.selectedAccountList.push({
                  accountId: item.accountId,
                  paymentId: item.paymentId,
                  phoneNumber: x.phoneValue,
                  labelName: labelName,
                  labelType: labelType,
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
      this.selectedAccountList = this.selectedAccountList.filter((o) => {
        if (o.labelName == labelName && o.labelType == labelType) {
          return false;
        }
        return true;
      });
    }
  }

  isCellLabelChecked(
    accountId,
    selectedPhone,
    paymentId,
    labelName,
    labelType
  ) {
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName == labelName &&
        el.accountId == accountId &&
        el.phoneNumber == selectedPhone &&
        el.paymentId == paymentId &&
        el.labelType == labelType
    );
    return found;
  }
  isEmailLabelChecked(
    accountId,
    selectedEmail,
    paymentId,
    labelName,
    labelType
  ) {
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName == labelName &&
        el.accountId == accountId &&
        el.email == selectedEmail &&
        el.paymentId == paymentId &&
        el.labelType == labelType
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
  isEmailLabelNameShowHide(labelName) {
    if (
      this.emailLabelNameShowHideArray &&
      this.emailLabelNameShowHideArray.length > 0 &&
      labelName
    ) {
      if (this.emailLabelNameShowHideArray.includes(labelName)) {
        return true;
      }
    }
    return false;
  }
  emailLabelNameShowHideArray = [];
  selectEmailLabels(event, labelName, i, labelType) {
    this.allEmailLabelsArray[i].isLabelNameChecked = event.target.checked;

    if (event.target.checked) {
      this.dataList.map((item) => {
        if (item.emailLabelArray && item.emailLabelArray.length > 0) {
          item.emailLabelArray.map((x) => {
            if (x.labelName.toLowerCase() == labelName.toLowerCase()) {
              if (!this.emailLabelNameShowHideArray.includes(labelName)) {
                this.emailLabelNameShowHideArray.push(labelName);
              }
              if (x.emailValue) {
                this.selectedAccountList.push({
                  accountId: item.accountId,
                  paymentId: item.paymentId,
                  email: x.emailValue,
                  labelName: labelName,
                  labelType: labelType,
                });
              }
            }
          });
        }
      });
    } else {
      const index = this.emailLabelNameShowHideArray.indexOf(labelName);
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
  }
  onFilterByEmail(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.filterByStatusRdo == 1) {
      this.OnSentEmailCheckboxChange(event);
    }
    if (this.filterByStatusRdo == 0) {
      this.OnNotSentTextCheckboxChange(event);
    }
  }
  filterByStatusRdo: any;
  onFilterByStatus(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  deSelectCellLabel(
    event,
    accountId,
    selectedPhone,
    paymentId,
    labelName,
    labelType
  ) {
    if (event.target.checked) {
      this.selectedAccountList.push({
        accountId: accountId,
        phoneNumber: selectedPhone,
        paymentId: paymentId,
        labelName: labelName,
        labelType: labelType,
      });
      return false;
    }
    this.selectedAccountList = this.selectedAccountList.filter(
      (e) =>
        !(
          e.accountId == accountId &&
          e.phoneNumber == selectedPhone &&
          e.paymentId == paymentId &&
          e.labelName == labelName &&
          e.labelType == labelType
        )
    );
  }
  deSelectEmailLabel(
    event,
    accountId,
    selectedEmail,
    paymentId,
    labelName,
    labelType
  ) {
    if (event.target.checked) {
      this.selectedAccountList.push({
        accountId: accountId,
        email: selectedEmail,
        paymentId: paymentId,
        labelName: labelName,
        labelType: labelType,
      });
      return false;
    }
    this.selectedAccountList = this.selectedAccountList.filter(
      (e) =>
        !(
          e.accountId == accountId &&
          e.email == selectedEmail &&
          e.paymentId == paymentId &&
          e.labelName == labelName &&
          labelType == labelType
        )
    );
  }
  sendStatusFilterValue = "notSentStatus";
  endStatusFilter(event) {
    this.sendStatusFilterValue = event.target.value;
    this.filterBySendStatus();
  }
  sendStatusByEmail(event) {
    this.isSentEmailChecked = event.target.checked;
    this.filterBySendStatus();
  }
  filterBySendStatus() {
    let isSent = this.sendStatusFilterValue == "notSentStatus" ? "0" : "1";
    if (isSent == "0") {
      this.filterBySendStatus0(isSent);
    } else if (isSent == "1") {
      this.filterBySendStatus1(isSent);
    }
  }
  filterBySendStatus0(isSent) {
    let datalist = this.originalList.filter((item) => {
      if (isSent == "0" && this.isSentTextChecked) {
        if (item.smsSent && item.smsSent.includes("1")) {
          return false;
        }
        if (!item.smsSent) {
          return true;
        }
      }

      if (isSent == "0" && this.isSentMailChecked) {
        if (item.mailSent && item.mailSent.includes("1")) {
          return false;
        }
        if (!item.mailSent) {
          return true;
        }
      }

      if (isSent == "0" && this.isSentPrintChecked && item.printSent) {
        return false;
      }

      if (isSent == "0" && this.isSentEmailChecked) {
        if (item.emailSent && item.emailSent.includes("1")) {
          return false;
        }
        if (!item.emailSent) {
          return true;
        }
      }

      return true;
    });
    this.dataList = datalist;
  }

  filterBySendStatus1(isSent) {
    let datalist = this.originalList.filter((item) => {
      if (isSent == "1" && this.isSentTextChecked) {
        if (item.smsSent && item.smsSent.includes("1")) {
          return true;
        }
        if (!item.smsSent) {
          return false;
        }
      }
      if (isSent == "1" && this.isSentMailChecked) {
        if (item.mailSent && item.mailSent.includes("1")) {
          return true;
        }
        if (!item.mailSent) {
          return false;
        }
      }
      if (isSent == "1" && this.isSentPrintChecked && item.printSent) {
        return true;
      }
      if (isSent == "1" && this.isSentEmailChecked) {
        if (item.emailSent && item.emailSent.includes("1")) {
          return true;
        }
        if (!item.emailSent) {
          return false;
        }
      }
      if (
        this.isSentTextChecked ||
        this.isSentMailChecked ||
        this.isSentPrintChecked ||
        this.isSentEmailChecked
      ) {
        return false;
      } else {
        return true;
      }
    });
    this.dataList = datalist;
  }

  sendStatusBySMS(event) {
    this.isSentTextChecked = event.target.checked;
    this.filterBySendStatus();
  }
  getSentValuesArray(arrayItemSent = [], List = [], isSent = "0") {
    let itemSent = [];
    let sent = [];
    for (let index = 0; index < arrayItemSent.length; index++) {
      const emailSentList = arrayItemSent[index];
      if (emailSentList.trim() == isSent) {
        itemSent.push(emailSentList);
        sent.push(List[index]);
      }
    }
    return [itemSent, sent];
  }
  sendStatusByMail(event) {
    this.isSentMailChecked = event.target.checked;
    this.filterBySendStatus();
  }
  sendStatusByPrint(event) {
    this.isSentPrintChecked = event.target.checked;
    this.filterBySendStatus();
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
