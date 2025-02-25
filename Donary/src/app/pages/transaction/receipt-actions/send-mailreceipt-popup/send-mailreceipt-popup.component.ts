import { Component, Input, OnInit, EventEmitter, Output } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorSaveComponent } from "src/app/pages/donor/donor-save/donor-save.component";
import { CardService } from "src/app/services/card.service";
import { DonorService } from "src/app/services/donor.service";
import { AddressValidateService } from "src/app/services/address-validate.service";

import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
declare var $: any;

interface NewAddress {
  addressId: number;
  accountId: any;
  careOf: null;
  houseNum: null;
  street: string;
  unit: null;
  city: string;
  state: string;
  zip: null;
  country: null;
  isDefault: true;
  neighborhood: null;
  note: null;
  latitude: number;
  longitude: number;
}

@Component({
  selector: "app-send-mailreceipt-popup",
  templateUrl: "./send-mailreceipt-popup.component.html",
  styleUrls: ["./send-mailreceipt-popup.component.scss"],
  standalone: false,
})
export class SendMailreceiptPopupComponent implements OnInit {
  isloading: boolean;
  isDisabled: boolean = false;
  id: number;
  email: number;
  address: string;
  cityStateZip: string;
  globalId: number;
  city: string;
  state: string;
  zip: string;
  macAddress: string;
  accountId: Int32Array;
  modalOptions: NgbModalOptions;
  type: string = null;
  statementSpecificFilters: any = [];
  fromDate = null;
  toDate = null;
  isSendDisabled = true;
  invalidAddressErr: string = null;

  isNewSuggestedAddress: boolean = false;
  suggestedAddress: string = "";
  suggestedCityStateZip: string = "";
  isSuggested: boolean = false;
  isOnlyPledgePayment = false;
  accountNum: string;

  newAddress: NewAddress = {
    addressId: 0,
    accountId: 0,
    careOf: null,
    houseNum: null,
    street: null,
    unit: null,
    city: null,
    state: null,
    zip: null,
    country: null,
    isDefault: true,
    neighborhood: null,
    note: null,
    latitude: 0,
    longitude: 0,
  };
  statementType: string;
  isGlobalId: boolean = false;
  hidePaymentsList: boolean = false;
  hide0BalancePledges: boolean = false;
  errorString =
    "The address you entered was found but more information is needed (such as an apartment, suite, or box number) to match to a specific address";
  suggestedAddressChecked: boolean = false;
  @Output() emitAddressUpdated: EventEmitter<any> = new EventEmitter();
  sendAnyway: boolean = false;

  @Input() set ExportInfo(data: any) {
    if (data) {
      this.address = data.address;
      this.cityStateZip = data.cityStateZip;
      this.id = data.id;
      this.type = data.type;
      this.statementSpecificFilters = data.statementSpecificFilters;
      this.fromDate = data.fromDate;
      this.toDate = data.toDate;
      this.accountId = data.id;
      this.statementType = data.statementType;
      this.isOnlyPledgePayment = data.isOnlyPledgePayment;
      this.hide0BalancePledges = data.hide0BalancePledges;
      this.hidePaymentsList = data.hidePaymentsList;
      if (this.address?.trim() == "" || this.cityStateZip?.trim() == "") {
        this.isSendDisabled = true;
      } else {
        this.ValidateAddress();
      }
    }
  }

  @Input() set Info(details: any) {
    if (details) {
      this.type = details.type;
      this.id = details.id;
      this.accountNum = details.accountNum;
      this.globalId = details.globalId;
      this.address = details.address;
      this.cityStateZip = details.cityStateZip;
      this.accountId = details.accountId;
      this.isGlobalId = details.isGlobalId;
      if (this.address?.trim() == "" || this.cityStateZip?.trim() == "") {
        this.isSendDisabled = true;
      } else {
        this.ValidateAddress();
      }
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    private localstoragedataService: LocalstoragedataService,
    private messengerService: MessengerService,
    private donorService: DonorService,
    private cardService: CardService,
    private addressValidateService: AddressValidateService,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header-custom",
      });
    });
    this.commonMethodService.getStatesList();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  getValidAddressValue(): String {
    return this.address.replace("#", "");
  }

  strMatchCase(first: string, second: string): boolean {
    if (!first) return false;
    if (!second) return false;
    return first.toLowerCase() === second.toLowerCase();
  }

  isMatchAddress(addressValue: string, responseAddressValue: string): boolean {
    let matches = addressValue.match(/([\w+]+)/g);
    let resMatches = responseAddressValue.match(/([\w+]+)/g);

    if (matches.length < 3) {
      return false;
    }

    return (
      this.strMatchCase(matches[0], resMatches[0]) &&
      this.strMatchCase(matches[1], resMatches[1]) &&
      this.strMatchCase(matches[2], resMatches[2])
    );
  }

  checkResponse(
    addressValue: string,
    city: string,
    state: string,
    zip: string,
    res
  ) {
    if (
      this.isMatchAddress(addressValue, res.address) &&
      this.strMatchCase(city, res.city) &&
      this.strMatchCase(state, res.state) &&
      this.strMatchCase(zip, res.zip)
    ) {
      this.invalidAddressErr = null;
      this.isSendDisabled = false;
      this.isSuggested = false;
    } else {
      this.isSendDisabled = true;
      this.isSuggested = true;
      this.suggestedAddress = res.address;
      this.suggestedCityStateZip = res.cityStateZip;
    }
  }

  copyAddress() {
    this.address = this.suggestedAddress;
    this.cityStateZip = this.suggestedCityStateZip;
    this.isNewSuggestedAddress = true;
    this.isSendDisabled = false;
    this.isSuggested = false;
  }

  ValidateAddress() {
    const addressValue = this.addressValidateService.validateAddress(
      this.address
    );
    const cityStateZipObj = this.addressValidateService.validateCityStateAndZip(
      this.cityStateZip
    );

    const xmlsNode = this.addressValidateService.getSimpleAddressXMLNode(
      addressValue,
      cityStateZipObj.city,
      cityStateZipObj.state,
      cityStateZipObj.zip
    );
    const payload =
      this.addressValidateService.getAddressValidateRequestPayload(xmlsNode);

    this.messengerService.ValidateAddress(payload).subscribe(
      (res: any) => {
        if (!res.isValid) {
          this.invalidAddressErr = res.message;
          if (
            this.invalidAddressErr
              .toLowerCase()
              .includes(this.errorString.toLowerCase())
          )
            this.sendAnyway = true;
          this.isSendDisabled = true;
        }

        if (res.isValid) {
          this.checkResponse(
            addressValue,
            cityStateZipObj.city,
            cityStateZipObj.state,
            cityStateZipObj.zip,
            res
          );
          const stateValue = this.commonMethodService.stateList.find(
            (st) => st.id === res.state
          );
          this.newAddress.street = res.address;
          this.newAddress.city = res.city;
          // this.newAddress.state = (stateValue && stateValue.itemName) ? stateValue.itemName: res.state;
          this.newAddress.state = res.state;
          this.newAddress.zip = res.zip;

          // "Unit 125c".match(/unit\s(\w+)/i)
          const haveUnits = res.address.match(/unit\s(\w+)/i);
          if (haveUnits) {
            this.newAddress.unit = haveUnits[1] || null;
            this.newAddress.street = res.address.replace(/unit\s(\w+)/i, "");
          }

          // "APT 125c".match(/unit\s(\w+)/i)
          const haveApts = res.address.match(/apt\s(\w+)/i);
          if (haveApts) {
            this.newAddress.unit = haveApts[1] || null;
            this.newAddress.street = res.address.replace(/apt\s(\w+)/i, "");
          }

          // "125 ".match(/^\s?(\d+)/i)
          const havehouse = res.address.match(/^\s?(\d+)/i);
          if (havehouse) {
            this.newAddress.houseNum = havehouse[1] || null;
            this.newAddress.street = this.newAddress.street.replace(
              /^\s?(\d+)/i,
              ""
            );
          }
        }
      },
      (err) => {
        this.isSendDisabled = true;
        console.log("error", err);
      }
    );
  }

  updateDonorAddress() {
    let objdonor = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      AccountId: this.accountId,
      // "Address": this.suggestedAddress,
      // "CityStateZip": this.suggestedCityStateZip,
      CreatedBy: this.localstoragedataService.getLoginUserId(),
      Street: this.newAddress.street,
      City: this.newAddress.city,
      State: this.newAddress.state,
      Zip: this.newAddress.zip,
      unit: this.newAddress.unit,
      HouseNum: this.newAddress.houseNum,
    };

    this.donorService.UpdateDonor(objdonor).subscribe((res) => {
      this.SendMail();
    });
  }

  updateAndSend() {
    if (this.isNewSuggestedAddress) {
      this.updateDonorAddress();
    } else {
      this.SendMail();
    }
  }

  SendMail() {
    this.isDisabled = true;
    var objMailReceipt = {};
    if (this.type == "Statement") {
      objMailReceipt = {
        type: "Statement",
        id: this.id,
        fromDate: this.fromDate,
        toDate: this.toDate,
        statementSpecificFilters: this.statementSpecificFilters,
        eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
        statementType: this.commonMethodService.statementType
          ? this.commonMethodService.statementType[0].id
          : "",
        isOnlyPledgePayment: this.isOnlyPledgePayment,
        hidePaymentsList: this.hidePaymentsList,
        hide0BalancePledges: this.hide0BalancePledges,
      };
    } else {
      objMailReceipt = {
        type: this.type,
        id: this.id,
        eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      };
    }
    this.messengerService.SendMailReceipt(objMailReceipt).subscribe(
      (res: any) => {
        this.isDisabled = false;
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
          }).then(() => {
            if (this.isNewSuggestedAddress) {
              this.emitAddressUpdated.emit({
                address: this.suggestedAddress,
                cityStateZip: this.suggestedCityStateZip,
              });
            } else {
              this.emitAddressUpdated.emit(true);
            }
          });
          this.activeModal.dismiss();
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
      },
      (error) => {
        this.isloading = false;
        this.activeModal.dismiss();
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

  EditDonor() {
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_popup from-send-mail",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorById(eventGuId, this.accountId)
      .subscribe((res: any) => {
        modalRef.componentInstance.Type = "edit";
        modalRef.componentInstance.EditDonorData = res;
      });
    modalRef.componentInstance.emtOutputEditDonor.subscribe((res: any) => {
      this.isloading = true;
      if (res) {
        var objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          accountId: this.accountId,
        };
        this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
          this.isloading = false;
          if (res) {
            this.address = res.address;
            this.cityStateZip = res.cityStateZip;
            this.ValidateAddress();
            this.emitAddressUpdated.emit({
              address: res.address,
              cityStateZip: res.cityStateZip,
            });
          }
        });
      }
    });
  }
}
