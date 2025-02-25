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
import { AdvanceSMSActionService } from "src/app/services/helpers/advance-smsaction.service";
import { PledgeCardPopupComponent } from "src/app/pages/cards/pledge-card-popup/pledge-card-popup.component";
import { PledgeService } from "src/app/services/pledge.service";
import { AnalyticsService } from "src/app/services/analytics.service";

interface AccandPhone {
  accountId: number;
  receiptNum: number;
  selectedPhone?: string;
  labelName?: string;
  paymentId: number;
}
@Component({
  selector: "app-bulk-smsreceipt",
  templateUrl: "./bulk-smsreceipt.component.html",
  styleUrls: ["./bulk-smsreceipt.component.scss"],
  standalone: false,
})
export class BulkSMSReceiptComponent implements OnInit {
  @ViewChildren("phonespans") phonespans: QueryList<ElementRef>;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChildren("labelCheckboxes") labelCheckboxes: QueryList<ElementRef>;
  updatePhoneId = null;
  updatePhonesIndex = null;
  updatePhonesLabel = null;

  sendingTotalDonors: number = 0;
  isloading: boolean = false;
  modalOptions: NgbModalOptions;

  otherInfo: any;
  dateRange: any;

  gridDataColumns: any = [];
  dataList: any = [];
  gridFilterDataList: Array<any> = [];

  selectedAccountList: Array<AccandPhone> = [];

  selectAllNameCheckBox: boolean = false;
  selectAllReceiptCheckBox: boolean = false;
  selectAllPhoneCheckBox: boolean = false;
  selectAllColumn: Array<string> = [];

  tempPhone: string = "";

  filterOptions: any = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "with",
      label: "Has Numbers",
    },
    {
      value: "missing",
      label: "Missing Numbers",
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

  isUpdated: boolean = false;
  receiptNumColumn = "";
  allPhoneLabelsArray = [];
  recordSelectedArray = [];
  analytics = inject(AnalyticsService);

  @Input() set TableColumns(columns: boolean) {
    if (columns) {
      this.gridDataColumns = columns;
    }
  }

  @Input() set List(datalist: Array<any>) {
    if (datalist) {
      const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.commonAPIMethodService
        .getLabelText(eventGuId)
        .subscribe((res: any) => {
          let labelName = "Cell";
          this.allPhoneLabelsArray = res;

          this.allPhoneLabelsArray = this.allPhoneLabelsArray.filter(
            (x) => x.labelType == "Phone"
          );
          this.allPhoneLabelsArray = this.allPhoneLabelsArray.map((item) => {
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
            if (!x.phoneLabels) {
              x.phoneLabels = ",";
              x.phoneNumbers = ",";
              x.smsSent = ",";
            }
            if (x.phoneNumbers == undefined) {
              x.phoneNumbers = x.phones;
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
                    labelID: `${index}_${i}`,
                    labelType: "Phone",
                    labelName:
                      (keys[i] || "").charAt(0).toUpperCase() +
                      (keys[i] || "").slice(1),
                    phoneValue: values[i],
                    smsSent: smsSent[i],
                  });
                }
              }
              x.phoneLabelArray = obj;
            }
            if (x.phoneLabelArray && x.phoneLabelArray.length > 0) {
              for (let j = 0; j < x.phoneLabelArray.length; j++) {
                if (
                  x.phoneLabelArray[j].labelName.toLowerCase() ==
                  labelName.toLowerCase()
                ) {
                  if (!this.labelNameShowHideArray.includes(labelName)) {
                    this.labelNameShowHideArray.push(labelName);
                  }
                  if (x.phoneLabelArray[j].phoneValue) {
                    this.selectedAccountList.push({
                      accountId: x.accountId,
                      paymentId: x.paymentId,
                      selectedPhone: x.phoneLabelArray[j].phoneValue,
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
      this.recordSelectedArray = Info.recordSelectedArray;
      if (Info.type == "Payment") {
        this.receiptNumColumn = "Receipt";
      }
      if (Info.type == "Pledge") {
        this.receiptNumColumn = "Pledge #";
      }
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    private messengerService: MessengerService,
    private pledgeService: PledgeService,
    private commonAPIMethodService: CommonAPIMethodService,
    private advanceSMSActionService: AdvanceSMSActionService
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
        this.updateLabels(res);
      }
    });
    this.commonMethodService
      .getPledgeTransactionData()
      .subscribe((res: any) => {
        if (res && this.isDonarOpenClicked) {
          let newGridlist = res.map((o) => ({
            ...o,
            paymentId: o.pledgeID,
            accountId: o.accountID,
            phoneNumbers: o.phones,
            receiptNum: o.pledgeNum,
          }));
          this.updateLabels(newGridlist);
        }
      });
  }

  sentGridFilter(data: Array<any>) {
    return _.reduce(
      data,
      (filtered, option) => {
        let columns = option.columns.map((o, i) => {
          let listArray = [];
          let sentArray = [];
          for (let index = 0; index < o.sentList.length; index++) {
            const element = o.sentList[index];
            if (element && element == "1" && o.list[index]) {
              listArray.push(o.list[index]);
              sentArray.push("1");
            }
          }

          return {
            ...o,
            list: listArray,
            sentList: sentArray,
            tempList: listArray,
          };
        });

        const fndempy = columns.filter((c) => c.list.length !== 0);
        if (fndempy.length !== 0) {
          filtered.push({ ...option, columns });
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
        let columns = option.columns.map((o, i) => {
          let listArray = [];
          let sentArray = [];
          if (o.sentList.length == 0) {
            listArray.push("0");
            sentArray.push("0");
          }
          if (!o.sentList.includes("1")) {
            for (let index = 0; index < o.sentList.length; index++) {
              const element = o.sentList[index];
              if (element && element == "0" && o.list[index]) {
                listArray.push(o.list[index]);
                sentArray.push("0");
              }
            }
          }
          return {
            ...o,
            list: listArray,
            sentList: sentArray,
            tempList: listArray,
          };
        });

        const fndempy = columns.filter((c) => c.list.length !== 0);
        if (fndempy.length !== 0) {
          filtered.push({ ...option, columns });
        }
        return filtered;
      },
      []
    );
  }

  filterGridRows(event) {
    let filterAry = [];
    if (this.filterBy === "missing") {
      this.gridFilterDataList = this.dataList.filter((o) => {
        if (o.phoneNumbers == ",") {
          return true;
        }
        return false;
      });
    }

    if (this.filterBy === "with") {
      filterAry = this.dataList.filter((o) => {
        const fndempy = o.columns.filter((c) => c.list.length !== 0);
        return fndempy.length !== 0;
      });

      if (this.filterByStatus === "sent") {
        this.gridFilterDataList = this.sentGridFilter(filterAry);
        return;
      }

      if (this.filterByStatus === "not sent") {
        this.gridFilterDataList = this.notSentGridFilter(filterAry);
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
          if (item.smsSent.includes("1")) {
            return true;
          }
          return false;
        });
        return;
      }

      if (this.filterByStatus === "not sent") {
        this.gridFilterDataList = this.dataList.filter((item) => {
          if (item.smsSent.includes("1")) {
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
      .map((props) => ({ ..._.head(props) }))
      .value();
    return dd.length;
  }

  mouseOutPhoneUpdateFirst(receiptNum, column) {
    let objIndex = this.gridFilterDataList.findIndex(
      (obj) => obj.receiptNum === this.updatePhoneId
    );
    const account = this.gridFilterDataList[objIndex];
    let colIndex = account.columns.findIndex((obj) => obj.label === column);

    account.columns[colIndex] = { label: column, list: [this.tempPhone] };
    this.gridFilterDataList[objIndex] = account;

    this.isUpdated = true;
    this.checkAllOfColumn(column);

    this.updatePhoneId = null;
    this.updatePhonesIndex = null;
    this.updatePhonesLabel = null;
    this.tempPhone = "";
  }

  mouseOutPhoneUpdate(receiptNum, j, column) {
    // update for multiple;
    if (
      this.updatePhoneId &&
      this.updatePhoneId === receiptNum &&
      this.updatePhonesIndex !== null &&
      this.updatePhonesIndex === j
    ) {
      this.gridFilterDataList = _.map(this.gridFilterDataList, (dl) => ({
        ...dl,
        columns: _.map(dl.columns, (o) => {
          if (
            dl.receiptNum === receiptNum &&
            dl.receiptNum === this.updatePhoneId &&
            o.label === column
          ) {
            o.list[this.updatePhonesIndex] = this.tempPhone;
            this.isUpdated = true;
          }
          return o;
        }),
      }));

      this.checkAllOfColumn(column);

      this.updatePhoneId = null;
      this.updatePhonesIndex = null;
      this.updatePhonesLabel = null;
      this.tempPhone = "";
    }
  }

  beforePhoneUpdate(receiptNum, j, label) {
    let foundObj = this.gridFilterDataList.find((o) => {
      return o.receiptNum === receiptNum;
    });
    let grpColm = foundObj.columns.find((o) => {
      return o.label === label;
    });
    this.tempPhone = grpColm.list.length === 0 ? "" : grpColm.list[j];
    this.updatePhoneId = receiptNum;
    this.updatePhonesIndex = j;
    this.updatePhonesLabel = label;
  }

  phoneIdUpdate(event) {
    this.tempPhone = event.target.value;
  }

  checkDonorIsDisable(accId): Boolean {
    this.gridFilterDataList.filter((o) => {
      const fndempy = o.columns.filter((c) => c.list.length === 0);
      return fndempy.length === this.gridDataColumns.length;
    });
    const found = this.gridFilterDataList.find((e) => e.accountId === accId);

    const fndempy = found.columns.filter((c) => c.list.length === 0);
    return fndempy.length === this.gridDataColumns.length;
  }

  checkAllOfColumn(column) {
    if (!this.selectAllNameCheckBox) {
      return;
    }
    this.gridFilterDataList.map((o) => {
      o.columns.map((oc) => {
        if (oc.label !== column) {
          return oc;
        }

        if (oc.list.length !== 0) {
          oc.list.map((p, i) => {
            // select first only in array
            if (i === oc.selectedChild) {
              this.selectedAccountList.push({
                accountId: o.accountId,
                paymentId: o.paymentId,
                selectedPhone: p,
                receiptNum: o.receiptNum,
              });
            }
            return p;
          });
        }

        return oc;
      });
      return o;
    });
  }

  selectName(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.selectAllNameCheckBox = true;
        this.gridDataColumns.map((column) => this.checkAllOfColumn(column));
      } else {
        this.selectAllNameCheckBox = false;
        this.selectedAccountList = [];
      }
    }

    if (type === "singlecheck") {
      if (event.target.checked) {
        let selectDonorObj = this.gridFilterDataList.find(
          (d) => d.accountId === accountId
        );
        selectDonorObj.columns.map((oc) => {
          if (oc.list.length !== 0) {
            oc.list.map((p, i) => {
              // select first only in array
              if (i === oc.selectedChild) {
                this.selectedAccountList.push({
                  accountId: selectDonorObj.accountId,
                  paymentId: selectDonorObj.paymentId,
                  selectedPhone: p,
                  receiptNum: selectDonorObj.receiptNum,
                });
              }
              return p;
            });
          }
          return oc;
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => e.accountId !== accountId
        );
      }
    }
  }

  //new code
  selectReceipt(event, type, receiptNum) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.selectAllReceiptCheckBox = true;
        this.gridDataColumns.map((column) => this.checkAllOfColumn(column));
      } else {
        this.selectAllReceiptCheckBox = false;
        this.selectedAccountList = [];
      }
    }
    if (type === "singlecheck") {
      if (event.target.checked) {
        let selectDonorObj = this.gridFilterDataList.find(
          (d) => d.receiptNum === receiptNum
        );
        selectDonorObj.columns.map((oc) => {
          if (oc.list.length !== 0) {
            oc.list.map((p, i) => {
              // select first only in array
              if (i === oc.selectedChild) {
                this.selectedAccountList.push({
                  accountId: selectDonorObj.accountId,
                  paymentId: selectDonorObj.paymentId,
                  selectedPhone: p,
                  receiptNum: selectDonorObj.receiptNum,
                });
              } else {
                //span selected phone
                this.commonMethodService.childPArray.push({
                  accountId: selectDonorObj.accountId,
                  selectedPhone: p,
                  receiptNum: selectDonorObj.receiptNum,
                });
              }
              return p;
            });
          }
          return oc;
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => e.receiptNum !== receiptNum
        );
        this.commonMethodService.childPArray =
          this.commonMethodService.childPArray.filter(
            (e) => e.receiptNum !== receiptNum
          );
      }
    }
  }

  selectPhone(event, type, accountId, paymentId, phone, column, receiptNum) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.selectAllNameCheckBox = true;
        this.selectAllColumn.push(column);
        this.checkAllOfColumn(column);
      } else {
        this.selectAllNameCheckBox = false;

        this.selectAllColumn = this.selectAllColumn.filter((o) => o !== column);

        this.gridFilterDataList.map((o) => {
          o.columns.map((oc) => {
            if (oc.label !== column) {
              return oc;
            }

            if (oc.list.length !== 0) {
              oc.list.map((p) => {
                this.selectedAccountList = this.selectedAccountList.filter(
                  (e) =>
                    !(e.selectedPhone === p && e.receiptNum === o.receiptNum)
                );
                return p;
              });
            }

            return oc;
          });
          return o;
        });
      }
    }

    if (type === "singlecheck") {
      if (event.target.checked) {
        this.selectedAccountList.push({
          accountId: accountId,
          paymentId: paymentId,
          selectedPhone: phone,
          receiptNum: receiptNum,
        });
      } else {
        this.selectedAccountList = this.selectedAccountList.filter(
          (e) => !(e.selectedPhone === phone && e.receiptNum === receiptNum)
        );
      }
    }
  }
  selectPhoneNumbers(
    event,
    accountId,
    paymentId,
    phone,
    receiptNum,
    labelName
  ) {
    if (!phone) {
      event.target.checked = false;
      return false;
    }
    if (event.target.checked) {
      this.selectedAccountList.push({
        accountId: accountId,
        paymentId: paymentId,
        selectedPhone: phone,
        receiptNum: receiptNum,
        labelName: labelName,
      });
    } else {
      this.selectedAccountList = this.selectedAccountList.filter(
        (e) =>
          !(
            e.selectedPhone === phone &&
            e.receiptNum === receiptNum &&
            e.labelName == labelName
          )
      );
    }
  }
  selectAllPhoneNumbers(event) {
    if (event.target.checked) {
      this.selectedAccountList = [];
      this.gridFilterDataList.map((item) => {
        let accountId = item.accountId;
        let receiptNum = item.receiptNum;
        let paymentId = item.paymentId;
        if (item.phoneLabelArray && item.phoneLabelArray.length > 0) {
          item.phoneLabelArray.map((x) => {
            this.selectedAccountList.push({
              accountId: accountId,
              paymentId: item.paymentId,
              selectedPhone: x.phoneValue,
              receiptNum: receiptNum,
              labelName: x.labelName,
            });
          });
        }
      });
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = true;
      });
    } else {
      this.selectedAccountList = [];
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }
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

  checkAccountIsSelectOrNot(accountId): Boolean {
    const found = this.selectedAccountList.find(
      (e) => e.accountId === accountId
    );
    return found ? true : false;
  }

  checkPhoneIsSelectOrNot(receiptNum, phone): Boolean {
    const found = this.selectedAccountList.find(
      (e) => e.receiptNum === receiptNum && e.selectedPhone === phone
    );
    return found ? true : false;
  }

  checkReceiptIsSelectOrNot(receiptNum): Boolean {
    let found = this.selectedAccountList.find(
      (e) => e.receiptNum === receiptNum
    );
    var k = this.commonMethodService.getChaldPArray();
    if (k && k.length > 0) {
      found = k.find((e) => e.receiptNum === receiptNum);
    }
    return found ? true : false;
  }
  isDonarOpenClicked = false;
  openDonorCardPopup(accountID) {
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
      // hide loader
      this.isloading = false;
      modalRef.componentInstance.DonorCardData = res;
    });
    modalRef.componentInstance.emtOutputSendMail.subscribe((res) => {});
  }

  closePopup() {
    this.activeModal.dismiss();
  }
  sendMail() {
    var childPhone = this.commonMethodService.getChaldPArray();
    if (childPhone && childPhone.length > 0) {
      for (let index = 0; index < childPhone.length; index++) {
        const element = childPhone[index];
        this.selectedAccountList.push(element);
      }
    }
    let dd = _(this.selectedAccountList)
      .chain()
      .groupBy((p) => p.accountId)
      .map((props) => ({
        ..._.head(props),
        ids: _.find(this.gridFilterDataList, (o) => {
          return o.accountId === _.head(props).accountId;
        }).paymentIds,
        //selectedPhone: _.map(props, p => p.selectedPhone?p.selectedPhone.trim():''),
      }))
      .value();

    const apiData = [];

    for (let index = 0; index < this.selectedAccountList.length; index++) {
      const element = this.selectedAccountList[index];
      //  ({ Id: element.accountId, PhoneNumbers: element.selectedPhone }))
      apiData.push({
        accountId: element.accountId,
        id: element.paymentId,
        PhoneNumbers: [element.selectedPhone],
      });
    }
    if (apiData.length === 0) {
      return;
    }

    this.sendingTotalDonors = dd.length;

    this.sendBulkSMSAPIAction(apiData);
  }

  sendBulkSMSAPIAction(data) {
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

    this.messengerService.BulkSMSReceipt(formData).subscribe(
      (res) => {
        if (res) {
          if (this.otherInfo.type == "Payment") this.analytics.bulkSMSPayment();
          if (this.otherInfo.type == "Pledge") this.analytics.bulkSMSPledge();

          this.isloading = false;
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
  isBetaOpen = false;
  arrowUp = false;
  betaMenu($event) {
    $event.stopPropagation();
    this.isBetaOpen = !this.isBetaOpen;
    this.arrowUp = !this.arrowUp;
  }
  labelNameShowHideArray = [];
  selectLabels(event, labelName, i) {
    this.allPhoneLabelsArray[i].isLabelNameChecked = event.target.checked;
    if (event.target.checked) {
      this.gridFilterDataList.map((item) => {
        let accountId = item.accountId;
        let receiptNum = item.receiptNum;
        let paymentId = item.paymentId;
        if (item.phoneLabelArray && item.phoneLabelArray.length > 0) {
          item.phoneLabelArray.map((x) => {
            if (x.labelName.toLowerCase() == labelName.toLowerCase()) {
              if (!this.labelNameShowHideArray.includes(labelName)) {
                this.labelNameShowHideArray.push(labelName);
              }
              if (x.phoneValue) {
                this.selectedAccountList.push({
                  accountId: accountId,
                  paymentId: paymentId,
                  selectedPhone: x.phoneValue,
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
      this.checkboxes.forEach((element) => {
        if (element.nativeElement.id.toLowerCase() == labelName.toLowerCase()) {
          element.nativeElement.checked = false;
        }
      });
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
  isCellLabelChecked(accountId, selectedPhone, receiptNum, labelName) {
    const found = this.selectedAccountList.some(
      (el) =>
        el.labelName == labelName &&
        el.accountId == accountId &&
        el.selectedPhone == selectedPhone &&
        el.receiptNum == receiptNum
    );
    return found;
  }
  isBetaOpenFilterByStatus = false;
  arrowUpFilterByStatus = false;
  betaMenuFilterByStatus($event) {
    $event.stopPropagation();
    this.isBetaOpenFilterByStatus = !this.isBetaOpenFilterByStatus;
    this.arrowUpFilterByStatus = !this.arrowUpFilterByStatus;
    this.isBetaOpenFilterBy = false;
    this.arrowUpFilterBy = false;
  }
  filterBySendStatus(value) {
    this.filterByStatus = value;
    this.isBetaOpenFilterByStatus = !this.isBetaOpenFilterByStatus;
    this.arrowUpFilterByStatus = !this.arrowUpFilterByStatus;
    this.filterGridRows("");
  }
  filterBySendStatusDisplay() {
    if (this.filterByStatus == "all") {
      return "All";
    }
    if (this.filterByStatus == "sent") {
      return "Sent";
    }
    if (this.filterByStatus == "not sent") {
      return "Not Sent";
    }
  }
  isBetaOpenFilterBy = false;
  arrowUpFilterBy = false;
  betaMenuFilterBy($event) {
    $event.stopPropagation();
    this.isBetaOpenFilterBy = !this.isBetaOpenFilterBy;
    this.arrowUpFilterBy = !this.arrowUpFilterBy;
    this.isBetaOpenFilterByStatus = false;
    this.arrowUpFilterByStatus = false;
  }
  filterByMissingDataDisplay = "All";
  filterByMissingData(item) {
    this.filterByMissingDataDisplay = item.label;
    this.filterBy = item.value;
    this.isBetaOpenFilterBy = !this.isBetaOpenFilterBy;
    this.arrowUpFilterBy = !this.arrowUpFilterBy;
    this.filterGridRows("");
  }
  updateLabels(res) {
    const objRes =
      this.advanceSMSActionService.getAdvanceSMSReceiptActionListObj(
        this.recordSelectedArray,
        res
      );
    let datalist = objRes.list;
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId)
      .subscribe((res: any) => {
        this.allPhoneLabelsArray = res;
        this.allPhoneLabelsArray = this.allPhoneLabelsArray.filter(
          (x) => x.labelType == "Phone"
        );
        this.allPhoneLabelsArray = this.allPhoneLabelsArray.map((item) => {
          item.isLabelNameChecked = this.labelNameShowHideArray.includes(
            item.labelName
          );
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
                  labelID: `${index}_${i}`,
                  labelType: "Phone",
                  labelName: keys[i],
                  phoneValue: values[i],
                  smsSent: smsSent[i],
                });
              }
            }
            x.phoneLabelArray = obj;
          }
          return x;
        });
        this.dataList = datalist;
        this.gridFilterDataList = datalist;
        //update value
        this.selectedAccountList = [];
        this.gridFilterDataList.map((item) => {
          let accountId = item.accountId;
          let receiptNum = item.receiptNum;
          let paymentId = item.paymentId;
          if (item.phoneLabelArray && item.phoneLabelArray.length > 0) {
            item.phoneLabelArray.map((x) => {
              if (this.labelNameShowHideArray.includes(x.labelName)) {
                if (x.phoneValue) {
                  this.selectedAccountList.push({
                    accountId: accountId,
                    paymentId: paymentId,
                    selectedPhone: x.phoneValue,
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
