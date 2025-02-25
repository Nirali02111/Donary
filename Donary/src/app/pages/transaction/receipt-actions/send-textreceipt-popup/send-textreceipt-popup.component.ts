import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-send-textreceipt-popup",
  templateUrl: "./send-textreceipt-popup.component.html",
  standalone: false,
  styleUrls: ["./send-textreceipt-popup.component.scss"],
})
export class SendTextreceiptPopupComponent implements OnInit {
  @Output() emtEditPledge: EventEmitter<any> = new EventEmitter();
  phoneNumberList = [];
  paymentType: string;
  id: number;
  type: string = null;
  phoneNumber: number;
  inputPhoneNumber: string;
  macAddress: string;
  accountId: number;
  isDisabled: boolean = true;
  isSending: boolean = false;
  isDefaultDonor: boolean = false;
  isAdd: boolean = true;
  statementSpecificFilters: any = [];
  fromDate = null;
  toDate = null;
  isPhoneValid = true;
  isOnlyPledgePayment = false;
  statementType: any;
  globalId: number;
  isDonorSelected: boolean = false;
  hidePaymentsList: boolean = false;
  hide0BalancePledges: boolean = false;
  phoneLabelArray: Array<any> = [];
  selectedLabelArray: Array<any> = [];
  isLabelSelected: boolean = true;
  selectedCountry: any =
    this.commonMethodService.getDefaultSelectedCountryCode();
  dailingCode: any = this.commonMethodService.getDefaultDailingCode();
  selectedFlag: any = this.commonMethodService.getDefaultSelectedFlag();
  countries: any;
  originalnumber: string;
  flagDailingCode = {
    "1": "+1",
    "2": "+1",
    "3": "+32",
    "4": "+44",
    "5": "+972",
  };
  countryCodeId: any;
  paymentId: any;
  paymentCardData: any;
  @Input() set ExportInfo(data: any) {
    if (data) {
      if (data.phoneList != null) {
        if (Array.isArray(data.phoneList)) {
          this.phoneNumberList = data.phoneList;
          let newPhoneList;
          if (this.phoneNumberList.length > 0) {
            newPhoneList = this.phoneNumberList.map((phone) => ({
              ...phone,
              dialingCode: this.flagDailingCode[phone.countryCodeIds],
            }));
          }
          this.phoneNumberList = newPhoneList;
        } else this.phoneNumberList.push(data.phoneList);
        if (this.phoneNumberList.length != 0) {
          this.phoneNumber = this.phoneNumberList[0].value;
          this.countryCodeId = this.phoneNumberList[0].countryCodeIds;
        }
      }

      if (this.phoneNumberList.length > 0) {
        this.isDisabled = false;
      }
      this.id = data.id;
      this.type = data.type;
      this.statementSpecificFilters = data.statementSpecificFilters;
      this.fromDate = data.fromDate;
      this.toDate = data.toDate;
      // this.phoneNumber=this.phoneNumberList.length!=0 && this.phoneNumberList[0];
      this.accountId = data.accountId;

      this.isOnlyPledgePayment = data.isOnlyPledgePayment;
      this.statementType = data.statementType;
      this.hidePaymentsList = data.hidePaymentsList;
      this.hide0BalancePledges = data.hide0BalancePledges;
    }
  }

  @Input() set Info(details: any) {
    if (details) {
      this.paymentId = details.id;
      if (details.phoneList != null && details.phoneList.length > 0) {
        if (Array.isArray(details.phoneList)) {
          this.phoneNumberList = details.phoneList;
          let newPhoneList;
          if (this.phoneNumberList.length > 0) {
            newPhoneList = this.phoneNumberList.map((phone) => ({
              ...phone,
              dialingCode: this.flagDailingCode[phone.countryCodeIds],
            }));
            this.phoneNumberList = newPhoneList;
          }

          this.phoneNumberList = newPhoneList;
        } else {
          this.phoneNumberList.push(details.phoneList);
        }

        if (this.phoneNumberList.length !== 0) {
          this.countryCodeId = this.phoneNumberList[0].countryCodeIds;
          this.phoneNumber = this.phoneNumberList[0].value;
        }
      }
      this.paymentType = details.type;
      this.id = details.id;
      this.accountId = details.accountId;
      this.isDonorSelected = details.isDonorSelected;
      this.globalId = details.globalId;
      if (this.phoneNumberList.length > 0) {
        this.isDisabled = false;
      }
    }

    if (this.globalId === 688008) {
      this.isDefaultDonor = true;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    private localstoragedataService: LocalstoragedataService,
    private messengerService: MessengerService,
    private donorService: DonorService,
    public commonMethodService: CommonMethodService,
    private commonAPIMethodService: CommonAPIMethodService,
    private cardService: CardService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header-custom",
      });
    });
    this.getCountryCodes();
    this.getAllPhoneLabels();
  }

  closePopup() {
    this.activeModal.close(this.paymentCardData);
  }

  SelectphoneNumberList(event, item) {
    if (event.target.checked) {
      this.phoneNumber = item.value;
      this.countryCodeId = item.countryCodeIds;
      this.isDisabled = false;
    } else {
      this.isDisabled = true;
    }
  }

  //Function to Transform Data As per need
  transformData(data) {
    return data.map((item) => ({
      countryCodeID: item.countryCodeID ? item.countryCodeID : 1,
      dialingCode: item.countryCodeID ? `+${item.countryCodeID}` : `+${1}`,
      label: item.phoneLabel,
      value: item.phoneNumber,
    }));
  }

  // Function to move the last element to the top
  moveLastElementToTop(data) {
    if (data.length === 0) {
      return data;
    }
    const lastElement = data.pop(); // Remove the last element
    data.unshift(lastElement); // Add the last element to the beginning
    return data;
  }

  AddPhoneNumber(accountId) {
    if (this.selectedLabelArray.length == 0) {
      this.isLabelSelected = false;
      return;
    }
    var objDonorPhone = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      // macAddress: this.localstoragedataService.getLoginUserGuid(),

      accountID: accountId,
      phoneLabel:
        this.selectedLabelArray &&
        this.selectedLabelArray.map((x) => x.itemName).toString(),
      phoneNumber: this.inputPhoneNumber,
      loginUserId: this.localstoragedataService.getLoginUserId(),
      countryCodeID: this.selectedCountry,
    };
    this.countryCodeId = this.selectedCountry;

    this.originalnumber = this.inputPhoneNumber;
    this.phoneNumberList = [];
    this.donorService.SaveDonorPhone(objDonorPhone).subscribe((res: any) => {
      if (res) {
        let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
        this.donorService
          .getDonorPhoneList(eventGuId, accountId)
          .subscribe((res: any) => {
            var obj: any = {};
            if (res != null) {
              obj.list = res;
              const phoneData = obj.list;
              let transformedData = this.transformData(phoneData);
              let reorderedData = this.moveLastElementToTop(transformedData);
              this.phoneNumberList = reorderedData;

              this.phoneNumber = this.phoneNumberList[0].value;
              this.phoneLabelArray = this.phoneLabelArray.filter(
                (x) =>
                  x.itemName.toLowerCase() !=
                  this.selectedLabelArray
                    .map((x) => x.itemName)
                    .toString()
                    .toLowerCase()
              );

              this.inputPhoneNumber = null;
              this.selectedLabelArray = [];
              this.isDisabled = false;
              this.isAdd = true;
              this.commonMethodService.notToShowLoader = true;
              this.commonMethodService.sendPaymentTrans(true);
              this.commonMethodService.sendPledgeTrans(true);
              var objDonorCard = {
                eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
                paymentId: this.paymentId,
              };
              this.cardService
                .getPaymentCard(objDonorCard)
                .subscribe((res: any) => {
                  this.paymentCardData = res;
                });
            }
          });
      }
    });
    (this.selectedFlag = "flag flag-usa"), (this.dailingCode = "+1");
  }
  SendReceipt() {
    this.isDisabled = true;
    this.isSending = true;
    var objTextReceipt = {};
    if (this.type == "Statement") {
      objTextReceipt = {
        type: "Statement",
        id: this.id,
        fromDate: this.fromDate,
        toDate: this.toDate,
        phoneNumber: this.phoneNumber.toString().trim(),
        statementSpecificFilters: this.statementSpecificFilters,
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        isOnlyPledgePayment: this.isOnlyPledgePayment,
        statementType:
          this.statementType === undefined || this.statementType === null
            ? ""
            : this.statementType[0].id,
        hidePaymentsList: this.hidePaymentsList,
        hide0BalancePledges: this.hide0BalancePledges,
        countryCodeID: this.countryCodeId,
      };
    } else {
      objTextReceipt = {
        type: this.paymentType,
        id: this.id,
        phoneNumber: !this.phoneNumber
          ? this.inputPhoneNumber.toString().trim()
          : this.phoneNumber.toString().trim(),
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        isOnlyPledgePayment: this.isOnlyPledgePayment,
        countryCodeID: this.countryCodeId,
      };
    }
    this.messengerService.SendSMSReceipt(objTextReceipt).subscribe(
      (res: any) => {
        if (res) {
          if (res) {
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
            });
            this.emtEditPledge.emit(res);
            this.closePopup();
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
        this.isDisabled = false;
        this.isSending = false;
      },
      (error) => {
        this.isDisabled = false;
        this.isSending = false;
        console.log(error);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }
  getCountryCodes() {
    this.commonAPIMethodService
      .getCountryCodes(this.localstoragedataService.getLoginUserEventGuId())
      .subscribe((res) => {
        this.countries = res;
      });
  }
  flagClasses = {
    "1": "flag flag-usa",
    "2": "flag flag-canada",
    "3": "flag flag-bleguim",
    "4": "flag flag-uk",
    "5": "flag flag-israel",
  };

  getFlagClass(countryCode: string): string {
    return this.flagClasses[countryCode] || "";
  }
  onCountryChange(countryCodeID: any, dialingCode: any) {
    this.selectedCountry = countryCodeID;
    this.dailingCode = dialingCode;
    this.selectedFlag = this.getFlagClass(countryCodeID);
  }
  onLabelDeSelect(event: any) {
    if (event.id == null) {
      this.selectedLabelArray = [];
      return;
    }
  }
  onLabelSelect(event: any) {
    if (event.id != null) {
      this.isLabelSelected = true;
      return;
    }
    this.isLabelSelected = false;
  }
  EnableAddButton(event) {
    if (event.target.value != "") {
      this.isAdd = false;
      this.isDisabled = false;
    } else {
      this.isAdd = true;
      this.isDisabled = true;
      this.isPhoneValid = true;
      if (this.phoneNumberList.length > 0) {
        this.isDisabled = false;
      }
    }
  }

  ValidPhone(event) {
    var val = event.target.value;
    if (val != "") {
      var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (val != "" && !regex.test(val)) {
        this.isPhoneValid = false;
        this.isDisabled = true;
        this.isAdd = true;
      } else {
        this.isPhoneValid = true;
        this.isDisabled = false;
        this.isAdd = false;
      }
    }
  }

  getAllPhoneLabels() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId, "Phone")
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.phoneNumberList.forEach((element) => {
            res = res.filter((x) => {
              // Convert to lower case only if both are not null
              const itemName = x.itemName ? x.itemName.toLowerCase() : null;
              const label = element.label ? element.label.toLowerCase() : null;

              // Filter out only if both are not null and they match
              return itemName !== label;
            });
          });
          this.phoneLabelArray = res;
        }
      });
  }
}
