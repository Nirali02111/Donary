import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PledgePaymentService } from "src/app/services/pledge-payment.service";
import { PaypledgeFilterPopupComponent } from "../paypledge-filter-popup/paypledge-filter-popup.component";
declare var $: any;
import * as moment from "moment";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

import { Subscription } from "rxjs";

@Component({
  selector: "app-pay-pledge-popup",
  templateUrl: "./pay-pledge-popup.component.html",
  styleUrls: ["./pay-pledge-popup.component.scss"],
  standalone: false,
})
export class PayPledgePopupComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @Output() emtDisablePledgePayment: EventEmitter<any> = new EventEmitter();
  @Output() emtDisableTabs: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputPledgePayData: EventEmitter<any> = new EventEmitter();
  @Output() emtAvailableAmt: EventEmitter<any> = new EventEmitter();
  accountId: number;
  popTitle: any;
  amount: number = 0.0;
  orgamount: number = 0;
  paymentAmount: number = 0;
  pledgeList: Array<any>;
  orgPledgeList: Array<any>;
  isSameAmount: boolean = true;
  totalAmount: number = 0;
  orgTotalAmount: number = 0;
  PageName: any = "PayPledge";
  isOneDate: any = false;
  userAmount: number;
  nopledgeMessage: string = "";
  userLeftAmount: number = 0;
  amountErrorMsg: boolean = false;
  isPayAllDisabled: boolean = false;
  showForm: boolean = false;
  pledges: any = [];
  totalpaidAmount: number = 0;
  editamount: number = 0;
  hasPledges: boolean = true;
  modalOptions: NgbModalOptions;
  pledgeId: number;
  filtercount: number = 0;
  greaterAmountError: boolean = false;
  isAutoApplyDisabled: boolean = false;
  objSelectedFilter = {
    reasonId: null,
    locationId: null,
    collectorId: null,
    campaignId: null,
  };
  showUpcoming: boolean = false;
  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;

  @Input("selectedDateRange") selectedDateRange?: any;
  private calendarSubscription: Subscription;
  @Input() set DonorId(data: any) {
    if (data) {
      this.accountId = data;
    }
  }
  @Input() set PledgeId(data: any) {
    if (data) {
      this.pledgeId = data;
    }
  }

  @Input() set cardPledge(isPledgeCard: boolean) {
    if (isPledgeCard) {
      this.GetPayPledgeList();
    }
  }
  @Input() set payPledgeList(data: any) {
    if (data == true && !this.commonMethodService.isBackTranctionCliked) {
      this.GetPayPledgeList();
    }
    if (this.commonMethodService.isBackTranctionCliked) {
      this.reassignedData();
    }
  }
  @Input() set DonationAmount(data: any) {
    this.pledges = [];
    if (data) {
      this.amount = data == undefined ? 0.0 : data;
      this.orgamount = this.amount;
      this.userAmount = this.amount;
      this.userLeftAmount = this.amount;
      this.editamount = this.amount;
      this.paymentAmount = 0;
      this.totalAmount = 0;
    } else {
      this.amount = 0.0;
      this.orgamount = 0.0;
      this.userAmount = 0.0;
      this.userLeftAmount = 0.0;
      this.editamount = 0.0;
      this.paymentAmount = 0.0;
    }
    if (!this.commonMethodService.isBackTranctionCliked) {
      this.GetPayPledgeList();
    }
    if (this.commonMethodService.isBackTranctionCliked) {
      this.reassignedData();
    }
  }
  constructor(
    public activeModal: NgbActiveModal,
    private localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private pledgepaymentService: PledgePaymentService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {}

  showPastPledge(list: Array<any>) {
    return list.filter((item: any) => {
      return moment(item.pledgeDate, "MM-DD-YYYY").isBefore();
    });
  }

  getMainList() {
    if (this.showUpcoming) {
      return this.orgPledgeList;
    }
    return this.pledgeList;
  }

  GetPayPledgeList() {
    if (this.accountId != undefined) {
      this.pledges = [];
      this.totalAmount = 0;
      this.isAutoApplyDisabled = false;
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.commonMethodService.payPledgeCount = 0;
      this.commonMethodService.pledgeRemainingAmountTotal = 0;
      this.pledgepaymentService
        .donorPledgePaymentList(this.accountId, eventGuId)
        .subscribe((res: any) => {
          if (res.unpaidPledges != null) {
            this.totalAmount = 0;
            this.hasPledges = true;
            var list = res.unpaidPledges.sort(
              (d1, d2) =>
                new Date(d1.pledgeDate).getTime() -
                new Date(d2.pledgeDate).getTime()
            );

            let total = 0;
            list.forEach((element) => {
              total += element.pledgeRemainingAmount;
            });
            this.commonMethodService.payPledgeCount = list.length;
            this.commonMethodService.pledgeRemainingAmountTotal = total;

            for (var i = 0; i < list.length; i++) {
              list[i].amountError = false;
              list[i].isDisabled = false;
              list[i].checkboxDisabled = false;
              list[i].balance = "";
              list[i].paidAmount = 0.0;
              list[i].checkbxClass = "unchecked";
              list[i].isPledgeChecked = false;
              list[i].showbalance = list[i].pledgeRemainingAmount;
              list[i].orgbalance = list[i].showbalance;
              list[i].oldpaidAmount = null;
              this.totalpaidAmount += list[i].pledgePaidAmount;
              list[i].showorginalbalance = list[i].showbalance;
              if (list[i].showbalance == list[i].pledgeTotalAmount) {
                list[i].isSameAmount = true;
              } else {
                list[i].isSameAmount = false;
              }
            }

            this.orgPledgeList = list;
            this.pledgeList = this.showPastPledge([...list]);
            if (this.selectedDateRange != undefined) {
              this.pledgeList = this.pledgeList.filter((item: any) => {
                return (
                  new Date(item.pledgeDate).getTime() >=
                    new Date(this.selectedDateRange.startDate).getTime() &&
                  new Date(item.pledgeDate).getTime() <=
                    new Date(this.selectedDateRange.endDate).getTime()
                );
              });
            }

            if (this.pledgeList.length == this.orgPledgeList.length) {
              this.showUpcoming = true;
            }
            this.pledgeList.map((a) => {
              this.totalAmount += a.showbalance;
            });
            this.orgTotalAmount = this.totalAmount;
            if (this.totalAmount > this.userAmount) {
              this.isPayAllDisabled = true;
            } else {
              this.isPayAllDisabled = false;
            }

            if (this.pledgeId != undefined) {
              this.showForm = true;
              $("#payoffpledge").attr("checked", true);
              if (this.orgTotalAmount) {
                this.commonMethodService.getPledgeAmount(this.orgTotalAmount);
              }
              for (var i = 0; i < this.pledgeList.length; i++) {
                this.emtDisablePledgePayment.emit(true);
                if (this.pledgeList[i].pledgeId == this.pledgeId) {
                  //this.pledges.push(this.pledgeList[i]);
                  // this.pledgeList[i].isPledgeChecked = true;
                  this.selectAmount(true, "", "singlepay", this.pledgeId);
                }
              }
            }
            /** Set pay Pledge off on new transaction after existing, end */

            // this.pledgeList = this.pledgeList.sort(function (a, b) {
            //   return b.isPledgeChecked - a.isPledgeChecked;
            // });
          } else {
            this.hasPledges = false;
            this.amount = 0;
            this.pledgeList = [];
            this.orgPledgeList = this.pledgeList;
          }
        });
      this.SubmitPledgePay();
    }
  }

  ChangeTextValue(event, value, balance, pledgeId) {
    if (event.target.value.includes("-")) {
      event.target.value = "";
    }
    balance == "NaN" ? "" : balance;
    if (event.target.value != "") {
      if (parseInt(event.target.value) > balance) {
        if (parseInt(event.target.value) != balance) {
          var checkbox = document.getElementById(pledgeId) as HTMLInputElement;
          this.pledgeList.forEach((element) => {
            if (element.pledgeId == pledgeId) {
              (element.isDisabled = false), (element.balanceError = true);
              this.emtDisableTabs.emit(true);
              // element.balance =event.target.value,
              // element.pledgePaidAmount=element.pledgePaidAmount
              // (element.showbalance = element.showorginalbalance);
              if (checkbox.checked) {
                element.isDisabled = true;
                element.showbalance = element.showorginalbalance + balance;
                element.showorginalbalance = balance;
              }
            }
          });
        }

        checkbox.checked = false;
      } else {
        this.pledgeList.forEach((element) => {
          if (element.pledgeId == pledgeId) {
            element.amountError = false;
            this.greaterAmountError = false;
            this.emtDisableTabs.emit(false);
            if (Number(event.target.value) <= Number(element.showbalance)) {
              element.balance = Number(event.target.value);
            } else {
              element.pledgePaidAmount = element.pledgePaidAmount;
            }
            element.isDisabled = false;

            var leftamount =
              this.userLeftAmount + Number(element.oldpaidAmount);
            if (
              Number(event.target.value) > this.userLeftAmount &&
              element.paidAmount != Number(event.target.value)
            ) {
              if (leftamount >= Number(event.target.value)) {
                element.amountError = false;
                this.greaterAmountError = false;
                this.emtDisableTabs.emit(false);
              } else {
                element.amountError = true;
                this.greaterAmountError = true;
                this.emtDisableTabs.emit(true);
                return false;
              }
            }

            element.paidAmount = Number(event.target.value).toFixed(2);

            var checkbox = document.getElementById(
              pledgeId
            ) as HTMLInputElement;
            if (
              this.pledges.filter((e) => e.PledgeID === pledgeId).length == 0
            ) {
              this.pledges.push({
                PledgeID: Number(pledgeId),
                PaidAmount: Number(event.target.value),
                RemainingAmount:
                  Number(element.pledgeTotalAmount) -
                  Number(event.target.value),
              });
            } else {
              this.pledges.forEach((e) => {
                if (e.PledgeID == pledgeId) {
                  (e.PledgeID = Number(pledgeId)),
                    (e.PaidAmount = Number(event.target.value)),
                    (e.RemainingAmount =
                      Number(element.pledgeTotalAmount) -
                      Number(event.target.value));
                }
              });
            }
            this.SubmitPledgePay();
          }
        });
      }

      this.isAutoApplyDisabled = true;
    } else {
      if (balance != "") {
        if (balance != event.target.value) {
          this.pledgeList.forEach((element) => {
            if (element.pledgeId == pledgeId) {
              (element.isDisabled = false),
                (element.balanceError = false),
                (element.amountError = false),
                (this.greaterAmountError = false);
              this.emtDisableTabs.emit(false);
              element.balance = "";

              if (
                Number(event.target.value) > this.userLeftAmount &&
                element.paidAmount != Number(event.target.value)
              ) {
                if (element.paidAmount > Number(event.target.value)) {
                  element.amountError = false;
                  this.greaterAmountError = false;
                  this.emtDisableTabs.emit(false);
                } else {
                  element.amountError = true;
                  this.greaterAmountError = true;
                  this.emtDisableTabs.emit(true);
                  return false;
                }
              }
              element.paidAmount = Number(event.target.value);
            }
          });

          var checkbox = document.getElementById(pledgeId) as HTMLInputElement;
          checkbox.checked = false;
        }
      }
    }
  }

  AutoApply() {
    if (this.paymentAmount != this.totalAmount) {
      this.isAutoApplyDisabled = true;
      this.checkboxes.forEach((ele) => {
        ele.nativeElement.checked = false;
      });
      var totalAmount = Number(this.userAmount);
      this.userLeftAmount = 0;
      this.paymentAmount = 0;
      this.amount = Number(this.userAmount);
      this.pledges = [];
      //this.amount=this.userAmount;
      this.pledgeList.forEach((element) => {
        if (this.amount > 0) {
          if (element.showbalance <= this.amount) {
            var balance = element.showbalance;
            let amount = element.balance;
            element.balance = balance;
            totalAmount -= balance;
            element.isDisabled = true;
            this.pledges.push({
              PledgeID: Number(element.pledgeId),
              PaidAmount: Number(element.balance),
              RemainingAmount: element.showbalance - element.balance,
            });
            this.amount -= amount;
            if (Number(this.amount) == 0) {
              element.checkboxDisabled = false;
            }
            element.showbalance =
              Number(element.showorginalbalance) - Number(element.balance);
            this.paymentAmount += Number(amount);
            element.showbalance -= amount;
          } else {
            let amount = element.balance;
            element.balance += Number(this.amount);
            totalAmount -= element.balance;
            element.isDisabled = true;
            this.pledges.push({
              PledgeID: Number(element.pledgeId),
              PaidAmount: Number(element.balance),
              RemainingAmount: element.showbalance - element.balance,
            });
            this.amount -= amount;
            element.showbalance =
              Number(element.showorginalbalance) - Number(element.balance);
            this.paymentAmount += Number(amount);
            element.showbalance -= amount;

            //element.balance=totalAmount-element.balance;
            if (totalAmount < element.showbalance) {
              element.checkbxClass = "halfchecked";
            } else if (totalAmount == element.showbalance) {
              element.checkbxClass = "checked";
            }
          }

          if (Number(this.amount) == 0) {
            element.checkboxDisabled = false;
          }
          if (this.amount >= element.balance) {
            this.paymentAmount += Number(element.balance);
          } else {
            this.paymentAmount += Number(this.amount);
          }

          this.amount = totalAmount;
          element.balance = Number(element.balance).toFixed(2);

          //this.paymentAmount+=element.balance;
          //this.amount=this.userAmount-this.paymentAmount;
          this.checkboxes.forEach((ele) => {
            if (ele.nativeElement.id == element.pledgeId) {
              ele.nativeElement.checked = true;
              element.isPledgeChecked = true;
            }
          });

          this.count += 1;
        }
      });
      this.setReassignedData();
      this.SubmitPledgePay();
    }
  }

  count = 0;
  selectAmount(event, amount, type, pledgeId) {
    if (type == "payall") {
      this.pledges = [];
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
      if (event.target.checked) {
        this.paymentAmount = amount;
        this.amount = this.editamount - this.totalAmount;
        this.pledgeList.forEach((element) => {
          if (element.showbalance) {
            if (
              this.pledges.filter((e) => e.PledgeID === pledgeId).length == 0
            ) {
              this.pledges.push({
                PledgeID: Number(element.pledgeId),
                PaidAmount: Number(element.showbalance),
                RemainingAmount: 0,
              });
            }
            amount = amount - element.showbalance;
          } else {
            if (
              this.pledges.filter((e) => e.PledgeID === pledgeId).length == 0
            ) {
              this.pledges.push({
                PledgeID: Number(element.pledgeId),
                PaidAmount: Number(amount),
                RemainingAmount: element.showbalance - amount,
              });
            }
          }
        });
      } else {
        this.paymentAmount = 0;
        this.amount = this.userAmount;
        this.pledges = [];
      }
    } else {
      if (event == true) {
      } else {
        amount = (
          document.getElementById(
            "pledge_" + event.target.id
          ) as HTMLInputElement
        ).value;
      }
      if (amount != "") {
        amount = parseFloat(amount);
      }
      if (event == true || (event.target && event.target.checked)) {
        if (this.count < 0) {
          this.count = 0;
        }
        this.count += 1;
        if (this.amount >= 0) {
          if (amount == "") {
            this.pledgeList.forEach((element) => {
              if (element.pledgeId == pledgeId) {
                if (element.orgbalance >= this.userLeftAmount) {
                  if (this.userLeftAmount < element.showbalance) {
                    element.checkbxClass = "halfchecked";
                  } else if (this.userLeftAmount == element.showbalance) {
                    element.checkbxClass = "checked";
                  }
                  element.balance = Number(this.userLeftAmount).toFixed(2);
                  amount = element.balance;
                  element.oldpaidAmount = amount;
                  element.isDisabled = true;
                  this.userLeftAmount -= amount;
                  element.showbalance -= amount;
                  this.paymentAmount += Number(amount);
                  this.amount -= amount;
                  if (Number(this.amount) == 0) {
                    element.checkboxDisabled = false;
                  }
                  element.showbalance =
                    Number(element.showorginalbalance) -
                    Number(element.balance);
                  if (
                    this.pledges.filter((e) => e.PledgeID === pledgeId)
                      .length == 0
                  ) {
                    this.pledges.push({
                      PledgeID: Number(element.pledgeId),
                      PaidAmount: Number(amount),
                      RemainingAmount: element.showbalance,
                    });
                  }
                } else {
                  if (this.userLeftAmount > element.showbalance) {
                    element.checkbxClass = "checked";
                  }
                  element.balance = Number(element.orgbalance).toFixed(2);
                  amount = element.balance;
                  element.isDisabled = true;
                  element.oldpaidAmount = amount;
                  this.userLeftAmount -= amount;
                  this.paymentAmount += Number(amount);
                  this.amount -= amount;
                  if (Number(this.amount) == 0) {
                    element.checkboxDisabled = false;
                  }
                  element.showbalance =
                    Number(element.showorginalbalance) -
                    Number(element.balance);
                  if (
                    this.pledges.filter((e) => e.PledgeID === pledgeId)
                      .length == 0
                  ) {
                    this.pledges.push({
                      PledgeID: Number(element.pledgeId),
                      PaidAmount: Number(amount),
                      RemainingAmount: element.showbalance,
                    });
                  } else {
                    if (
                      this.amount == 0 &&
                      element.checkbxClass == "unchecked" &&
                      element.checkbxClass != "checked"
                    ) {
                      if (!element.isPledgeChecked) {
                        element.checkboxDisabled = true;
                      }
                    } else {
                      element.checkbox = false;
                    }
                  }
                }
              }
            });
            this.pledgeList.forEach((element) => {
              if (
                this.amount == 0 &&
                element.checkbxClass == "unchecked" &&
                element.checkbxClass != "checked"
              ) {
                if (!element.isPledgeChecked) {
                  element.checkboxDisabled = true;
                }
              }
            });
            this.SubmitPledgePay();
          } else {
            if (this.amount >= 0) {
              this.pledgeList.forEach((element) => {
                if (element.pledgeId == pledgeId) {
                  if (this.greaterAmountError || element.balanceError) {
                    element.balance = "";
                    element.isDisabled = false;
                    element.paidAmount = 0.0;
                    if (this.greaterAmountError) {
                      this.greaterAmountError = false;
                    }
                    if (element.balanceError) {
                      element.balanceError = false;
                    }
                  }
                  if (!this.greaterAmountError && !element.balanceError) {
                    if (element.showbalance > 0) {
                      element.checkbxClass = "halfchecked";
                    } else if (element.showbalance == 0) {
                      element.checkbxClass = "checked";
                    }
                  }
                  if (
                    this.pledges.filter((e) => e.PledgeID === pledgeId)
                      .length == 0
                  ) {
                    this.pledges.push({
                      PledgeID: Number(element.pledgeId),
                      PaidAmount: Number(amount),
                      RemainingAmount: element.showbalance - amount,
                    });
                  }
                }
              });
            }
          }
        }
      } else {
        if (!this.greaterAmountError) {
          var balance = this.pledgeList
            .filter((s) => s.pledgeId == pledgeId)
            .reduce((s) => s.balance).balance;
          if (amount <= balance) {
            if (this.paymentAmount > 0) {
              this.paymentAmount -= Number(amount);
              this.paymentAmount = Number(this.paymentAmount.toFixed(2));
            }
            this.amount += Number(amount);
            this.userLeftAmount += Number(amount);
          }

          this.pledgeList.forEach((element) => {
            if (element.pledgeId == pledgeId) {
              element.balance = "";
              element.oldpaidAmount = null;
              var el = document.getElementById("pledge_" + pledgeId);
              element.checkbxClass = "unchecked";
              element.isDisabled = false;
              element.showbalance += amount;
              this.count -= 1;
              if (Number(this.amount) == 0) {
                element.checkboxDisabled = false;
              }
            } else {
              if (Number(this.amount == 0)) {
                element.checkboxDisabled = true;
              } else {
                element.checkboxDisabled = false;
              }
            }
          });
          this.pledges = this.pledges.filter(
            (obj) => obj.PledgeID !== pledgeId
          );
        } else {
        }
      }
    }

    if (this.count > 0) {
      this.isAutoApplyDisabled = true;
    }
    if (this.count <= 0) {
      this.isAutoApplyDisabled = false;
    }

    this.commonMethodService.pledgeList = this.pledgeList;
    this.commonMethodService.pledgeAmount = this.amount;
    this.commonMethodService.pledgePaymentAmount = this.paymentAmount;
    this.commonMethodService.pledgeOrgTotalAmount = this.orgTotalAmount;
    this.SubmitPledgePay();
  }

  RemoveValue(pledgeId, balance) {
    setTimeout(() => {
      this.pledgeList.forEach((element) => {
        if (
          element.pledgeId == pledgeId &&
          element.balance == "" &&
          element.paidAmount != 0
        ) {
          (element.isDisabled = false),
            (element.balanceError = false),
            (element.amountError = false),
            (element.isPledgeChecked = false);
          this.greaterAmountError = false;
          this.emtDisableTabs.emit(false);
          element.balance == "";
        }
        if (!element.balanceError && !element.amountError) {
          if (element.pledgeId == pledgeId) {
            element.balance = parseFloat(element.balance).toFixed(2);
          }
          if (element.pledgeId == pledgeId) {
            if (element.paidAmount != "" && element.paidAmount != null) {
              if (element.oldpaidAmount != null) {
                this.amount += Number(element.oldpaidAmount);
                this.paymentAmount -= Number(element.oldpaidAmount);
              } else {
                element.oldpaidAmount = Number(element.paidAmount);
                this.amount -= Number(element.paidAmount);
                this.paymentAmount += Number(element.paidAmount);
              }
              element.isDisabled = true;
              this.userLeftAmount = this.amount;
              element.showbalance =
                Number(element.orgbalance) - Number(element.paidAmount);
              element.balance = Number(element.paidAmount);
              element.paidAmount = Number(element.paidAmount).toFixed(2);
              if (element.showbalance == 0) {
                element.isPledgeChecked = true;
                element.checkbxClass = "checked";
              }
              if (element.showbalance > 0) {
                element.isPledgeChecked = true;
                element.checkbxClass = "halfchecked";
              }
            } else {
              // if (!!element.oldpaidAmount) {
              this.paymentAmount -= Number(element.oldpaidAmount);
              this.amount += Number(element.oldpaidAmount);
              // }
              this.userLeftAmount = this.amount;
              element.showbalance = element.orgbalance;
              element.oldpaidAmount = 0;
            }
          }
        }
      });
      this.emtAvailableAmt.emit(this.amount);
    }, 500);
  }

  datesUpdated(event) {
    if (event.startDate != null && event.endDate != null) {
      this.selectedDateRange = event;
      this.pledgeList = this.getMainList();
      if (this.objSelectedFilter.reasonId != null) {
        this.pledgeList = this.pledgeList.filter(
          (x) => x.paymentReasonId == this.objSelectedFilter.reasonId
        );
      }
      if (this.objSelectedFilter.collectorId != null) {
        this.pledgeList = this.pledgeList.filter(
          (x) => x.collectorId == this.objSelectedFilter.collectorId
        );
      }
      if (this.objSelectedFilter.campaignId != null) {
        this.pledgeList = this.pledgeList.filter(
          (x) => x.campaignId == this.objSelectedFilter.campaignId
        );
      }
      if (this.objSelectedFilter.locationId != null) {
        this.pledgeList = this.pledgeList.filter(
          (x) => x.locationId == this.objSelectedFilter.locationId
        );
      }
      this.selectedDateRange.startDate = moment(event.startDate).toDate();
      this.selectedDateRange.endDate = moment(event.endDate).toDate();
      this.pledgeList = this.pledgeList.filter((item: any) => {
        return (
          new Date(item.pledgeDate).getTime() >=
            new Date(this.selectedDateRange.startDate).getTime() &&
          new Date(item.pledgeDate).getTime() <=
            new Date(this.selectedDateRange.endDate).getTime()
        );
      });
      if (this.pledgeList.length == 0) {
        this.nopledgeMessage = "No pledges in this date range.";
      } else {
        this.nopledgeMessage = "";
        this.pledgeList = this.pledgeList;
      }
    } else {
      //this.pledgeList = this.orgPledgeList;
      this.pledgeList = this.getMainList();
      this.selectedDateRange = undefined;
    }
  }

  OpenPayPledgeFilter() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup paypledge_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaypledgeFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.objFilterValues = this.objSelectedFilter;
    modalRef.componentInstance.emtFilterValues.subscribe((res) => {
      if (res) {
        this.objSelectedFilter = res;
        this.filtercount = 0;
        this.pledgeList = this.getMainList();
        if (res.reasonId != null) {
          this.filtercount += 1;
          this.pledgeList = this.pledgeList.filter(
            (x) => x.paymentReasonId == res.reasonId
          );
        }
        if (res.collectorId != null) {
          this.filtercount += 1;
          this.pledgeList = this.pledgeList.filter(
            (x) => x.collectorId == res.collectorId
          );
        }
        if (res.campaignId != null) {
          this.filtercount += 1;
          this.pledgeList = this.pledgeList.filter(
            (x) => x.campaignId == res.campaignId
          );
        }
        if (res.locationId != null) {
          this.filtercount += 1;
          this.pledgeList = this.pledgeList.filter(
            (x) => x.locationId == res.locationId
          );
        }
        if (
          this.selectedDateRange.startDate != null &&
          this.selectedDateRange.endDate != null
        )
          this.pledgeList = this.pledgeList.filter((item: any) => {
            return (
              new Date(item.pledgeDate).getTime() >=
                new Date(this.selectedDateRange.startDate).getTime() &&
              new Date(item.pledgeDate).getTime() <=
                new Date(this.selectedDateRange.endDate).getTime()
            );
          });
      }
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  SubmitPledgePay() {
    this.emtOutputPledgePayData.emit(this.pledges);
    this.emtAvailableAmt.emit(this.amount);
    //this.activeModal.dismiss();
  }

  OnCheckboxChange(event) {
    if (event.target.checked) {
      this.showForm = true;
      if (this.DonationAmount != undefined) {
        this.SubmitPledgePay();
      }
      this.emtDisablePledgePayment.emit(true);
    } else {
      this.showForm = false;
      this.emtDisablePledgePayment.emit(false);
    }
  }

  showAllPledge() {
    this.showUpcoming = true;
    this.pledgeList = this.orgPledgeList;
    this.totalAmount = 0;
    this.pledgeList.map((a) => {
      this.totalAmount += a.showbalance;
    });

    if (this.totalAmount > this.userAmount) {
      this.isPayAllDisabled = true;
    } else {
      this.isPayAllDisabled = false;
    }

    if (
      this.selectedDateRange &&
      this.selectedDateRange.startDate &&
      this.selectedDateRange.endDate
    ) {
      this.datesUpdated({
        startDate: this.selectedDateRange.startDate,
        endDate: this.selectedDateRange.endDate,
      });
    }
  }

  reassignedData() {
    this.showForm = true;
    $("#payoffpledge").attr("checked", true);
    this.orgTotalAmount = this.commonMethodService.pledgeOrgTotalAmount;
    this.pledgeList = this.commonMethodService.pledgeList;
    this.amount = this.commonMethodService.pledgeAmount;
    this.paymentAmount = this.commonMethodService.pledgePaymentAmount;
    this.isAutoApplyDisabled = this.commonMethodService.isAutoApplyDisabled;
  }

  setReassignedData() {
    this.commonMethodService.pledgePaymentAmount = this.paymentAmount;
    this.commonMethodService.pledgeAmount = this.amount;
    this.commonMethodService.pledgeOrgTotalAmount = this.orgTotalAmount;
    this.commonMethodService.pledgeList = this.pledgeList;
    this.commonMethodService.isAutoApplyDisabled = this.isAutoApplyDisabled;
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "payPledgeDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "PayPledge" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.datesUpdated(this.selectedDateRange);
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
