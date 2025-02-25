import {
  ChangeDetectorRef,
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
import { DonorService } from "src/app/services/donor.service";
import { DonorSaveComponent } from "src/app/pages/donor/donor-save/donor-save.component";
import { MessengerService } from "src/app/services/messenger.service";

import { AddressValidateService } from "src/app/services/address-validate.service";

import { DonorCardPopupComponent } from "../../../cards/donor-card-popup/donor-card-popup.component";

declare var $: any;
import * as _ from "lodash";
import { PaymentCardPopupComponent } from "src/app/pages/cards/payment-card-popup/payment-card-popup.component";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { forkJoin } from "rxjs";
import { PledgeCardPopupComponent } from "src/app/pages/cards/pledge-card-popup/pledge-card-popup.component";
import { PledgeService } from "src/app/services/pledge.service";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { AnalyticsService } from "src/app/services/analytics.service";
interface DonorObj {
  accountId: number;
  receiptNum: number;
  selectedAddress?: string;
  labelName?: string;
}

@Component({
  selector: "app-bulk-mail-receipt",
  templateUrl: "./bulk-mail-receipt.component.html",
  standalone: false,
  styleUrls: ["./bulk-mail-receipt.component.scss"],
})
export class BulkMailReceiptComponent implements OnInit {
  @ViewChildren("emailspans") emailspans: QueryList<ElementRef>;

  isSendDisabled = false;
  updateMailId = null;

  sendingTotalDonors: number = 0;
  isloading: boolean = true;
  isInit: boolean = true;
  modalOptions: NgbModalOptions;

  otherInfo: any;
  dateRange: any;
  dataList: any = [];
  gridFilterDataList: any = [];
  selectedAccountList: Array<DonorObj> = [];

  isLabelSelected: boolean = false;

  selectAllNameCheckBox: boolean = false;
  allSelection = [];
  totalSelectedDonor: number = 0;
  selectAllEmailCheckBox: boolean = false;
  tempAddress: string = "";
  tempCityStateZip: string = "";
  invalidAddressErr: string = "";
  isUpdated: boolean = false;
  accountId: any;
  filterOptions: any = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "with",
      label: "Has Address",
    },
    {
      value: "missing",
      label: "Missing Address",
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
  allSelectedLabels = [];
  selected: any = [];
  filterByStatus: string = "all";
  isOnlyPledgePayment: boolean = false;
  allAddressLabelsArray = [];
  labelNameShowHideArray = [];
  recordSelectedArray = [];
  apiData = [];
  isDisabled: boolean = false;
  countEmptyAsNoSelectionMatch: number = 0;
  analytics = inject(AnalyticsService);

  @Input() set List(datalist: any) {
    if (datalist) {
      this.setValue(datalist);
    }
  }

  @Input() set Duration(dateRange: boolean) {
    if (dateRange) {
      this.dateRange = dateRange;
    }
  }

  @Input() set Info(Info: any) {
    if (Info) {
      if (Info.recordSelectedArray) {
        this.recordSelectedArray = Info.recordSelectedArray;
      }
      this.otherInfo = Info;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    private changeDetection: ChangeDetectorRef,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    private cardService: CardService,
    private pledgeService: PledgeService,
    private addressValidateService: AddressValidateService,
    private messengerService: MessengerService,
    private commonAPIMethodService: CommonAPIMethodService,

    private paymentTransactionService: PaymentTransactionService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal_custom_header,.modal__custom_footer",
      });
    });
    //update donar label

    this.commonMethodService.getPaymentTransactionData().subscribe((res) => {
      //return
      if (res && this.isDonarOpenClicked) {
        var resultArray = [];

        for (const item of this.recordSelectedArray) {
          var donorDetails = res.find((x) => x.paymentId == item);
          if (donorDetails) {
            resultArray.push(donorDetails);
          }
        }
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
        const allValidationReq = _.chunk(listMailData, 5).map((grpChunk) => {
          const grpChunkxmlsList = grpChunk.map((o) => {
            let adressStr = this.addressValidateService.validateAddress(
              o.address
            );
            let cityStateZipObj =
              this.addressValidateService.validateCityStateAndZip(
                o.cityStateZip
              );

            return this.addressValidateService.getUniqAddressXMLNode(
              o.accountId,
              adressStr,
              cityStateZipObj.city,
              cityStateZipObj.state,
              cityStateZipObj.zip
            );
          });

          const formData =
            this.addressValidateService.getAddressValidateRequestPayload(
              grpChunkxmlsList.join("")
            );

          return this.messengerService.ValidateMultipleAddress(formData);
        });
        forkJoin(allValidationReq).subscribe((results) => {
          const validationResults = _.flatten(results);

          const withValidation = listMailData.map((o) => {
            let findResponse = validationResults.find(
              (x) => x.ID == o.accountId
            );
            if (findResponse) {
              return {
                ...o,
                validation: findResponse,
              };
            } else {
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
          this.setValue(withValidation);
          // update grid values
          this.selectedAccountList = [];
          this.gridFilterDataList.map((item) => {
            let accountId = item.accountId;
            let receiptNum = item.receiptNum;
            if (item.addressLabelArray && item.addressLabelArray.length > 0) {
              item.addressLabelArray.map((x) => {
                if (this.labelNameShowHideArray.includes(x.labelName)) {
                  if (x.addressValue) {
                    this.selectedAccountList.push({
                      accountId: accountId,
                      selectedAddress: x.addressValue,
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
        if (option.mailSent && option.mailSent == "1") {
          filtered.push({ ...option });
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
        if (option.mailSent === null || option.mailSent == "0") {
          filtered.push({ ...option });
        }
        return filtered;
      },
      []
    );
  }

  filterGridRows(event) {
    let filterAry = [];

    if (this.filterBy === "missing") {
      if (this.filterByStatus === "sent") {
        this.gridFilterDataList = [];
      } else if (
        this.filterByStatus === "not sent" ||
        this.filterByStatus === "all"
      ) {
        this.gridFilterDataList = this.dataList.filter((o) => !o.addresses);
      }
    } else if (this.filterBy === "with") {
      filterAry = this.dataList.filter((o) => !!o.addresses);
      if (this.filterByStatus === "sent") {
        this.gridFilterDataList = this.sentGridFilter(filterAry);
      } else if (this.filterByStatus === "not sent") {
        this.gridFilterDataList = this.notSentGridFilter(filterAry);
      } else if (this.filterByStatus === "all") {
        this.gridFilterDataList = filterAry;
      }
    } else if (this.filterBy === "all") {
      if (this.filterByStatus === "sent") {
        this.gridFilterDataList = this.dataList.filter(
          (item) => item.mailSent && item.mailSent.includes("1")
        );
      } else if (this.filterByStatus === "not sent") {
        this.gridFilterDataList = this.dataList.filter(
          (item) => item.mailSent && !item.mailSent.includes("1")
        );
      } else if (this.filterByStatus === "all") {
        this.gridFilterDataList = this.dataList;
      }
    }
    this.checkIfSendReceiptEnabled();
  }

  checkIfSendReceiptEnabled() {
    this.isDisabled = true;
    _(this.selectedAccountList)
      .chain()
      .groupBy((p) => p.receiptNum)
      .map((props) => {
        const firstProp = _.head(props);
        const gridData = _.find(
          this.gridFilterDataList,
          (o) => o.receiptNum === firstProp.receiptNum
        );
        if (gridData) this.isDisabled = false;
      })
      .value();
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

  checkDonorIsDisable(accId): Boolean {
    const found = this.gridFilterDataList.find((e) => e.accountId === accId);
    if (found && (found.address === "" || found.cityStateZip === "")) {
      return true;
    } else if (found && !found.validation.isValid) {
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
      if (!o.validation.isValid) {
        return o;
      }

      if (o.address !== "" && o.cityStateZip !== "") {
        if (
          !this.selectedAccountList.find((s) => s.receiptNum === o.receiptNum)
        ) {
          this.selectedAccountList.push({
            accountId: o.accountId,
            receiptNum: o.receiptNum,
          });
        }
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => e.receiptNum !== o.receiptNum
        );
      }
      return o;
    });
  }

  selectName(event, type, accountId, receiptNum) {
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
        let selectDonorObj = this.gridFilterDataList.find(
          (d) => d.receiptNum === receiptNum
        );
        if (
          selectDonorObj.address !== "" &&
          selectDonorObj.cityStateZip !== ""
        ) {
          if (
            !this.selectedAccountList.find(
              (s) => s.accountId === selectDonorObj.accountId
            )
          ) {
            this.selectedAccountList.push({
              accountId: selectDonorObj.accountId,
              receiptNum: selectDonorObj.receiptNum,
            });
          }
        }
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => e.receiptNum !== receiptNum
        );
      }
    }
  }

  selectReceipt(event, type, accountId, receiptNum) {
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
        let selectDonorObj = this.gridFilterDataList.find(
          (d) => d.receiptNum === receiptNum
        );
        if (
          selectDonorObj.address !== "" &&
          selectDonorObj.cityStateZip !== ""
        ) {
          if (
            !this.selectedAccountList.find(
              (s) => s.receiptNum === selectDonorObj.receiptNum
            )
          ) {
            this.selectedAccountList.push({
              accountId: selectDonorObj.accountId,
              receiptNum: selectDonorObj.receiptNum,
            });
          }
        }
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => e.receiptNum !== receiptNum
        );
      }
    }
  }

  selectMail(event, type, accountId, receiptNum) {
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
          receiptNum: receiptNum,
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => !(e.receiptNum === receiptNum)
        );
      }
    }
  }

  checkAccountIsSelectOrNot(accountId, receiptNum): Boolean {
    const found = this.selectedAccountList.find(
      (e) => e.accountId === accountId && e.receiptNum === receiptNum
    );
    return found ? true : false;
  }
  checkReceiptIsSelectOrNot(receiptNum): Boolean {
    const found = this.selectedAccountList.find(
      (e) => e.receiptNum === receiptNum
    );
    return found ? true : false;
  }

  EditDonor(accountId) {
    this.updateMailId = accountId;

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
        modalRef.componentInstance.Type = "edit";
        modalRef.componentInstance.EditDonorData = res;
      });

    modalRef.componentInstance.emtOutputEditDonor.subscribe((res: any) => {
      // modalRef.componentInstance.closePopup();

      if (res) {
        var objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          accountId: accountId,
        };
        this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
          if (res) {
            this.updateDataInGrid(res.address, res.cityStateZip);
            this.isUpdated = true;
            this.commonMethodService.sendPaymentTrans(true);
          }
        });
      }
    });
  }

  updateDataInGrid(address, cityStateZip) {
    let objIndex = this.gridFilterDataList.findIndex(
      (obj) => obj.accountId === this.updateMailId
    );
    const account = this.gridFilterDataList[objIndex];
    account.address = address;
    account.cityStateZip = cityStateZip;
    this.gridFilterDataList[objIndex] = account;

    this.ValidateAddress(this.updateMailId);
  }

  ValidateAddress(accountId) {
    let objIndex = this.gridFilterDataList.findIndex(
      (obj) => obj.accountId === accountId
    );
    const account = this.gridFilterDataList[objIndex];

    const addressValue = this.addressValidateService.validateAddress(
      account.address
    );
    const cityStateZipObj = this.addressValidateService.validateCityStateAndZip(
      account.cityStateZip
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
          account.validation.isValid = false;
          account.validation.message = res.message;
          this.gridFilterDataList[objIndex] = account;
        }
        if (res.isValid) {
          account.validation.isValid = true;
          account.validation.message = "";
          this.gridFilterDataList[objIndex] = account;
        }

        this.checkAllName();
      },
      (err) => {
        console.log("error", err);
      }
    );
  }

  isDonarOpenClicked = false;

  openDonorCardPopup(accountID) {
    this.accountId = accountID;
    this.isDonarOpenClicked = true;
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
      this.isloading = false;
      modalRef.componentInstance.DonorCardData = res;
    });
  }

  /**
    This function extracts address and cityStateZip from comma separated string input 
   * 
   */

  closePopup() {
    this.activeModal.dismiss();
  }
  onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  //code to handle selection of Home,Business, etc label started

  sendMail() {
    if (this.gridFilterDataList.length === 0) {
      this.isDisabled = true;
      return;
    }

    /* updated dd */
    let dd = _(this.selectedAccountList)
      .chain()
      .groupBy((p) => p.receiptNum)
      .map((props) => {
        const firstProp = _.head(props);

        const gridData = _.find(
          this.gridFilterDataList,
          (o) => o.receiptNum === firstProp.receiptNum
        );

        return {
          ...firstProp,
          paymentIds: gridData ? gridData.paymentIds : [], // Set default value if no match
          selectedAddress: _.map(props, (p) => p.selectedAddress),
          labelName: _.map(props, (p) => p.labelName),
          addressId: gridData ? gridData.addressIds : [],
          addressLabel: gridData ? gridData.addressLabels : [],
        };
      })
      .value();

    const apiData = [];
    for (let index = 0; index < dd.length; index++) {
      const element = dd[index];

      let mailAddresses = [];
      let mailAddress = [];
      let AddressIds = [];
      if (element.addressId.indexOf(",") > -1) {
        let addressAry = element.addressId.split(",");
        let addressLabelAry = element.addressLabel.split(",");
        element.labelName.forEach((res, i) => {
          addressLabelAry.forEach((o) => {
            if (o.trimLeft() == res.trimLeft()) {
              AddressIds.push(addressAry[i].trim());
            }
          });
        });
      }
      AddressIds = AddressIds.filter(this.onlyUnique);
      for (let j = 0; j < element.selectedAddress.length; j++) {
        if (element.selectedAddress[j].indexOf(",") > -1) {
          let addressArr = element.selectedAddress[j].split(",");
          if (addressArr.length == 7) {
            mailAddress = [
              {
                addressId: AddressIds[j] || element.addressId,
                accountId: element.accountId,
                houseNum: addressArr[0],
                street: addressArr[1],
                unit: addressArr[2],
                city: addressArr[3],
                state: addressArr[4],
                zip: addressArr[5],
                country: addressArr[6],
                addressLabel: element.labelName[j],
              },
            ];
          } else {
            mailAddress = [
              {
                addressId: AddressIds[j] || element.addressId,
                accountId: element.accountId,
                houseNum: addressArr[0],
                street: addressArr[1],
                city: addressArr[2],
                state: addressArr[3],
                zip: addressArr[4],
                country: addressArr[5],
                addressLabel: element.labelName[j],
              },
            ];
          }
          mailAddresses.push(...mailAddress);
        }
      }
      let actions = element.paymentIds.map((id) => ({
        id: id,
        mailAddresses: mailAddresses,
      }));
      apiData.push(...actions);
    }
    if (apiData.length === 0) {
      return;
    }
    // this.sendingTotalDonors = dd.length;

    this.sendingTotalDonors = apiData.length; // upadted send recpit count
    this.sendBulkEmailAPIAction(apiData);
    this.isDisabled = false;
  }
  sendReceiptFunctionalityWithValidation() {
    this.sendMail();
    this.isloading = true;
    this.isInit = true;
  }

  sendBulkEmailAPIAction(data) {
    this.isloading = true;
    this.isInit = false;
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
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
      receiptAddresses: data,
    };

    this.messengerService.BulkMailReceipt(formData).subscribe(
      (res) => {
        if (res) {
          this.isloading = false;
          this.isLabelSelected = false;
          if (res) {
            if (this.otherInfo.type == "Payment")
              this.analytics.bulkMailPayment();
            if (this.otherInfo.type == "Pledge")
              this.analytics.bulkMailPledge();
            this.closePopup();
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
        this.isLabelSelected = false;
        console.log(error);
        this.activeModal.dismiss();
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

  stopProccessing() {
    this.isloading = false;
  }

  setValue(datalist) {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId)
      .subscribe((res: any) => {
        this.allAddressLabelsArray = res;
        let labelName = "Home";
        this.allAddressLabelsArray = this.allAddressLabelsArray.filter(
          (x) => x.labelType == "Address"
        );
        this.allAddressLabelsArray = this.allAddressLabelsArray.map((item) => {
          item.isLabelNameChecked = this.labelNameShowHideArray.includes(
            item.labelName
          );
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
          if (!x.addressLabels) {
            x.addressLabels = ",";
            x.addresses = ";";
            x.mailSent = ",";
          }
          if (x.addressLabels && x.addresses && x.mailSent) {
            let addressLabels = x.addressLabels.split(",");
            let addresses = x.addresses.split(";");
            let mailSent = x.mailSent.split(",");
            addressLabels = addressLabels.map((s) => s.trim());
            addresses = addresses.map((s) => s.trim());
            mailSent = mailSent.map((s) => s.trim());
            this.allAddressLabelsArray.map((item) => {
              if (!addressLabels.includes(item.labelName)) {
                addressLabels.push(item.labelName);
                addresses.push("");
                mailSent.push("not-sent");
              }
            });

            let obj = [];
            for (let i = 0; i < addressLabels.length; i++) {
              const found = this.allAddressLabelsArray.some(
                (el) =>
                  el.labelName.toLowerCase() == addressLabels[i].toLowerCase()
              );
              if (found) {
                obj.push({
                  labelID: index + "_" + i,
                  labelType: "Address",
                  labelName: addressLabels[i],
                  addressValue: addresses[i],
                  mailSent: mailSent[i],
                });
              }
            }
            x.addressLabelArray = obj;
          }
          if (x.addressLabelArray && x.addressLabelArray.length > 0) {
            for (let j = 0; j < x.addressLabelArray.length; j++) {
              if (
                x.addressLabelArray[j].labelName.toLowerCase() ==
                labelName.toLowerCase()
              ) {
                if (!this.labelNameShowHideArray.includes(labelName)) {
                  this.labelNameShowHideArray.push(labelName);
                }
                if (x.addressLabelArray[j].addressValue) {
                  this.selectedAccountList.push({
                    accountId: x.accountId,
                    selectedAddress: x.addressLabelArray[j].addressValue,
                    receiptNum: x.receiptNum,
                    labelName: labelName,
                  });
                }
              }
            }
          }
          return x;
        });
        this.isInit = false;
        this.isloading = false;
        this.dataList = datalist;
        this.gridFilterDataList = datalist;
      });
  }
  isBetaOpen = false;
  arrowUp = false;

  betaMenu(event) {
    event.stopPropagation();
    this.isBetaOpen = !this.isBetaOpen;
    this.arrowUp = !this.arrowUp;
  }

  selectLabels(event, labelName, i) {
    this.allAddressLabelsArray[i].isLabelNameChecked = event.target.checked;
    if (event.target.checked) {
      this.gridFilterDataList.map((item) => {
        let accountId = item.accountId;
        let receiptNum = item.receiptNum;
        if (item.addressLabelArray && item.addressLabelArray.length > 0) {
          item.addressLabelArray.map((x) => {
            if (x.labelName.toLowerCase() == labelName.toLowerCase()) {
              if (!this.labelNameShowHideArray.includes(labelName)) {
                this.labelNameShowHideArray.push(labelName);
              }
              if (x.addressValue) {
                this.selectedAccountList.push({
                  accountId: accountId,
                  selectedAddress: x.addressValue,
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

  isMailLabelChecked(accountId, selectedAddress, receiptNum, labelName) {
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName == labelName &&
        el.accountId == accountId &&
        el.receiptNum == receiptNum
    );
    return found;
  }

  isAddressLabelSelected(
    event,
    accountId,
    labelName,
    addressValue,
    receiptNum
  ) {
    if (event.target.checked) {
      this.selectedAccountList.push({
        accountId: accountId,
        selectedAddress: addressValue,
        receiptNum: receiptNum,
        labelName: labelName,
      });
    } else {
      this.selectedAccountList = this.selectedAccountList.filter(
        (el) =>
          !(
            el.labelName == labelName &&
            el.accountId == accountId &&
            el.receiptNum == receiptNum
          )
      );
    }
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "sms_after_payment";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
