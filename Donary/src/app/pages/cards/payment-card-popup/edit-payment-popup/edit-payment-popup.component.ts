import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
  ViewChild,
  inject,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { Subject, Subscription } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PaymentService } from "src/app/services/payment.service";
import Swal from "sweetalert2";
import { CampaignService } from "src/app/services/campaign.service";
import { CampaignCardPopupComponent } from "../../../cards/campaign-card-popup/campaign-card-popup.component";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { PledgePaymentService } from "src/app/services/pledge-payment.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { DonorSaveComponent } from "src/app/pages/donor/donor-save/donor-save.component";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;
@Component({
  selector: "app-edit-payment-popup",
  templateUrl: "./edit-payment-popup.component.html",
  styleUrls: ["./edit-payment-popup.component.scss"],
  standalone: false,
})
export class EditPaymentPopupComponent implements OnInit {
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild("donorInput") donorInput: ElementRef;
  isExpand: boolean = true;
  popTitle: any;
  selectedDate: any;
  isloading: boolean = true;
  paidValue: boolean = false;
  userpayAmount: number = 0;
  editamount: string;
  currencyAmount: any;
  totalpaidAmount: number = 0;
  PageName: any = "EditPaymentPopup";
  isOneDate: any = true;
  amount: number;
  orgamount: number;
  pledgeList: Array<any> = [];
  greaterAmountError: boolean = false;
  isSameAmount: boolean = true;
  totalAmount: number = 0;
  userAmount: number;
  paymentAmount: number = 0;
  userLeftAmount: number;
  receiptNum: number;
  donor: string;
  showBox: boolean = false;
  showOpenPledge: boolean = true;
  selectedDateRange: any = { startDate: null, endDate: null };
  isPayAllDisabled: boolean = false;
  pledges: any = [];
  appliedpledgelist = [];
  openpledgelist = [];
  paymentId: number;
  accountId: number;
  hasPledges: boolean = true;
  isGlobalList: boolean = true;
  displaySearchIcon = false;
  selectedDonorId: number;
  paymentStatusId: number;
  note: string;
  isChecked: boolean = false;
  nonEditable: boolean = false;
  removeDonor: boolean = true;
  originalAmt: string;
  originalPledgeLst = [];
  campaignID: number;
  isAppliedPledge: boolean = false;
  isDrpDisabled: boolean = false;
  isinitialize: number = 0;
  modalOptions: NgbModalOptions;
  showDatepicker: boolean = false;
  campingNonEditable: boolean = false;
  reasonNonEditable: boolean = false;
  status: string;
  batchNum: string;
  refNum: string;
  isRefNum: boolean = false;
  cardHolderName: string;
  isCardHolderName: boolean = false;
  isPledgeApplied: boolean = false;
  isBlock: boolean = false;
  checkStatusList: any = [
    { id: 9, itemName: "Pending" },
    { id: 10, itemName: "Deposited" },
    { id: 3, itemName: "Declined" },
  ];
  checkStatusId: any = [];
  isCheckStatusDwp: boolean = false;
  selectedAppliedPledge: boolean = false;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;

  EngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  class_id: string;
  class_hid: string;
  skeletonitems: any = [{}, {}];
  skeletonitems2: any = [{}, {}, {}, {}, {}];
  @Output() emtEditPayment: EventEmitter<any> = new EventEmitter();
  activeTab: string = "pymntinfo";
  private calendarSubscription: Subscription;
  @Input() set EditPaymentData(PaymentCardValue: any) {
    this.isloading = true;
    this.clearSelection();
    if (PaymentCardValue) {
      this.setValue(PaymentCardValue);
      this.getPaidValue(PaymentCardValue);
    }
  }
  @Input() set statusEditPaymentData(Status: any) {
    this.status = Status;
  }
  @Input() set isBatchNumEditPaymentData(batchnum: any) {
    this.batchNum = batchnum;
  }
  @Input() set EditPaymentTypeRefNum(item: any) {
    if (["Cash", "Check", "Other"].includes(item.paymentType)) {
      this.refNum = item.refNum;
      this.isRefNum = true;
    }
    if (item.paymentType == "Check") {
      this.isCheckStatusDwp = true;
      if (this.paymentStatusId == 2) {
        this.checkStatusId = this.checkStatusList.filter((x) => x.id == 10);
      } else if (this.paymentStatusId == 10) {
        this.checkStatusId = this.checkStatusList.filter((x) => x.id == 10);
      } else {
        this.checkStatusId = this.checkStatusList.filter(
          (x) => x.id == this.paymentStatusId
        );
      }
      if (this.checkStatusId.length > 0) {
        setTimeout(() => {
          this.onItemSelectCheckStatus(this.checkStatusId[0]), 10;
        });
      }
    }
  }
  setValue(data) {
    this.nonEditable = true;

    this.donor = data.accountName;
    this.selectedDonorId = data.accountID;
    this.isloading = false;

    // if dosn't have donor then remove x icon
    if (!this.donor) {
      this.nonEditable = false;
      this.donor = null;
    } else {
      this.nonEditable = true;
    }
    this.selectedDate = {
      startDate: moment(data.paymentDate),
      endDate: moment(data.paymentDate),
    };
    this.editamount = data.amount.toFixed(2);
    this.currencyAmount = data.currencyAmount;
    this.originalAmt = data.amount;
    this.userAmount = data.amount;
    this.accountId = data.accountID;
    this.paymentId = data.paymentId;
    this.receiptNum = data.receiptNum;
    this.paymentStatusId = data.statusId;
    this.note = data.note;
    this.campaignID = data.campaignID;
    this.isAppliedPledge =
      data.pledgePayments && this.getPaidValue(data) ? true : false;
    this.donarRemoveIcon(this.isAppliedPledge);

    this.cardHolderName = data.cardHolderName;
    this.isCardHolderName = this.cardHolderName ? true : false;
    this.commonMethodService.selectedPaymentReasons =
      this.commonMethodService.localReasonList.filter(
        (s) => s.id == data.paymentReasonID
      );
    this.commonMethodService.selectedFromCampaignList =
      this.commonMethodService.localCampaignList.filter(
        (s) => s.id == data.campaignID
      );
    this.commonMethodService.selectedPaymentLocations =
      this.commonMethodService.localLocationList.filter(
        (s) => s.id == data.locationID
      );
    this.commonMethodService.selectedPaymentCollectors =
      this.commonMethodService.localCollectorList.filter(
        (s) => s.id == data.collectorId
      );
    if (
      this.paymentStatusId == 1 ||
      this.paymentStatusId == 9 ||
      this.paymentStatusId == 10
    ) {
      this.showOpenPledge = true;
      this.originalPledgeLst = data.pledgePayments;
      this.GetPayPledgeList(data.pledgePayments);
    } else {
      this.showOpenPledge = false;
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    public donorPledgePaymentService: PledgePaymentService,
    private paymentService: PaymentService,
    private campaignService: CampaignService,
    private elementRef: ElementRef,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  handleClick = (ev) => {
    if (
      this.showDatepicker &&
      !this.elementRef.nativeElement
        .querySelector("ngx-daterangepicker-material")
        .contains(ev.target)
    ) {
      this.pickerDirective.open();
    } else {
      window.removeEventListener("click", this.handleClick);
    }
  };

  OnDivClick() {
    this.showDatepicker = false;
    window.removeEventListener("click", this.handleClick);
    return;
  }

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
      });
    });
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
  }

  EditAmount(event) {
    var amount = event.target.value;
    if (amount != "") {
      if (Number(amount) != Number(this.editamount)) {
        this.editamount = Number(amount).toFixed(2);
        this.userLeftAmount = Number(amount);
        if (this.amount != Number(amount)) {
          if (
            Number(amount) >= Number(this.originalAmt) &&
            this.paymentAmount == 0
          ) {
            var difference = Number(amount) - Number(this.originalAmt);
            this.amount = Number(this.originalAmt) + difference;
          } else if (
            Number(amount) < Number(this.originalAmt) &&
            this.paymentAmount == 0
          ) {
            var difference = Number(this.originalAmt) - Number(amount);
            this.amount = Number(this.originalAmt) - difference;
          }
          if (this.originalAmt < amount && this.paymentAmount != 0) {
            var difference = Number(amount) - this.paymentAmount - this.amount;
            this.amount += difference;
            //this.paymentAmount=Number(this.originalAmt)-difference;
          } else if (this.originalAmt >= amount && this.paymentAmount != 0) {
            if (this.paymentAmount < Number(amount)) {
              var difference = Number(this.originalAmt) - Number(amount);
              if (difference == 0) {
                difference = this.paymentAmount - Number(this.originalAmt);
              }
              this.amount -= difference;
            } else {
              this.amount = this.amount;
              this.paymentAmount = 0;
              this.GetPayPledgeList(this.originalPledgeLst);
            }
          }
        }
      }
    }
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  getPaidValue(data) {
    if (data.pledgePayments != null) {
      if (data.pledgePayments?.some((x) => x.paidAmount > 0)) {
        return true;
      }
    }
    return false;
  }

  clearSelection() {
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedPaymentCollectors = [];
  }

  GetPayPledgeList(pldgePaymentsList) {
    if (pldgePaymentsList != null) {
      if (pldgePaymentsList[0].pledgeAmount != null) {
        for (var i = 0; i < pldgePaymentsList.length; i++) {
          pldgePaymentsList[i].showbalance = parseFloat(
            pldgePaymentsList[i].balance
          ).toFixed(2);
          pldgePaymentsList[i].pledgeTotalAmount = parseFloat(
            pldgePaymentsList[i].pledgeAmount
          ).toFixed(2);
          pldgePaymentsList[i].balance =
            pldgePaymentsList[i].paidAmount > 0
              ? parseFloat(pldgePaymentsList[i].paidAmount).toFixed(2)
              : null;
        }
        this.isloading = false;
      }
      this.isChecked = true;
      pldgePaymentsList = pldgePaymentsList.sort(
        (d1, d2) =>
          new Date(d1.pledgeDate).getTime() - new Date(d2.pledgeDate).getTime()
      );
      pldgePaymentsList = pldgePaymentsList.sort(function (a, b) {
        return b.isCurrentPaymentPledge - a.isCurrentPaymentPledge;
      });
      if (this.isAppliedPledge) {
        this.removeDonor = true;
      }
      for (var i = 0; i < pldgePaymentsList.length; i++) {
        pldgePaymentsList[i].amountError = false;
        pldgePaymentsList[i].balanceError = false;
        pldgePaymentsList[i].isDisabled = false;
        pldgePaymentsList[i].oldpaidAmount = null;
        pldgePaymentsList[i].showbalance = parseFloat(
          pldgePaymentsList[i].showbalance
        ).toFixed(2);
        pldgePaymentsList[i].orgbalance =
          Number(pldgePaymentsList[i].showbalance) +
          Number(pldgePaymentsList[i].balance);
        pldgePaymentsList[i].balance =
          pldgePaymentsList[i].paidAmount > 0
            ? parseFloat(pldgePaymentsList[i].paidAmount).toFixed(2)
            : null;
        pldgePaymentsList[i].ppaidAmount = 0.0;
        pldgePaymentsList[i].checkbxClass = "unchecked";
        if (!pldgePaymentsList[i].isCurrentPaymentPledge) {
          this.appliedpledgelist.push(pldgePaymentsList[i]);
        } else {
          if (this.isAppliedPledge) {
            pldgePaymentsList[i].txtDisabled = true;
            pldgePaymentsList[i].orgbalance =
              Number(pldgePaymentsList[i].showbalance) +
              Number(pldgePaymentsList[i].balance);
            this.removeDonor = true;
          }
          this.paymentAmount += Number(pldgePaymentsList[i].balance);
          this.pledges.push({
            PledgeID: Number(pldgePaymentsList[i].pledgeId),
            PaidAmount: Number(pldgePaymentsList[i].balance),
            RemainingAmount:
              Number(pldgePaymentsList[i].pledgeTotalAmount) -
              Number(pldgePaymentsList[i].balance),
          });
          if (
            Number(pldgePaymentsList[i].pledgeTotalAmount) >
            Number(pldgePaymentsList[i].balance)
          ) {
            pldgePaymentsList[i].checkbxClass = "halfchecked";
          } else {
            pldgePaymentsList[i].checkbxClass = "checked";
          }
        }
        this.totalpaidAmount += Number(pldgePaymentsList[i].balance);
        pldgePaymentsList[i].showorginalbalance = Number(
          pldgePaymentsList[i].showbalance
        );
        if (
          pldgePaymentsList[i].showbalance ==
          Number(pldgePaymentsList[i].pledgeTotalAmount)
        ) {
          pldgePaymentsList[i].isSameAmount = true;
        } else {
          pldgePaymentsList[i].isSameAmount = false;
        }
        this.totalAmount += Number(pldgePaymentsList[i].showbalance);
      }

      this.amount = Number(this.editamount) - this.totalpaidAmount;
      if (this.amount < 0) {
        this.amount = 0;
        this.orgamount = 0;
      }
      this.userLeftAmount = this.amount;
      if (this.totalAmount > this.userAmount) {
        this.isPayAllDisabled = true;
      } else {
        this.isPayAllDisabled = false;
      }
      if (this.amount == 0) {
        pldgePaymentsList.forEach((item) => {
          if (!item.isCurrentPaymentPledge) {
            item.isDisabled = true;
            item.txtDisabled = true;
          }
        });
      }
      this.pledgeList = pldgePaymentsList;
    } else {
      this.isChecked = false;
      this.hasPledges = false;
      this.amount = 0;
      this.isExpand = false;
      this.isloading = false;
      this.pledgeList = [];
    }
  }

  disableSave() {
    return (
      this.pledgeList.filter((o) => {
        return o.amountError === true || o.balanceError == true;
      }).length !== 0
    );
  }

  RemoveValue(pledgeId) {
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
            (element.isCurrentPaymentPledge = false);
          this.greaterAmountError = false;
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
              element.txtDisabled = true;
              this.userLeftAmount = this.amount;
              element.showbalance =
                Number(element.showbalance) - Number(element.paidAmount);
              element.balance = Number(element.paidAmount);
              element.paidAmount = Number(element.paidAmount).toFixed(2);
              if (element.showbalance == 0) {
                element.isCurrentPaymentPledge = true;
                element.checkbxClass = "checked";
              }
              if (element.showbalance > 0) {
                element.isCurrentPaymentPledge = true;
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
      this.pledgeList.forEach((element) => {
        if (element.pledgeId != pledgeId) {
          if (this.amount == 0 && element.checkbxClass == "unchecked") {
            element.txtDisabled = true;
            element.isDisabled = true;
          }
        }
      });
    }, 200);
  }

  selectAmount(event, amount, type, pledgeId, checkbxClass) {
    if (type == "payall") {
      this.pledges = [];
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
      if (event.target.checked) {
        this.paymentAmount = amount;
        this.amount = Number(this.editamount) - this.totalAmount;

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
        if (
          event.target &&
          event.target.checked &&
          checkbxClass == "unchecked"
        ) {
          if (this.amount >= 0) {
            if (amount == "") {
              this.pledgeList.forEach((element) => {
                if (element.pledgeId == pledgeId) {
                  let isVisited = false;
                  let totalRemainingAmount;
                  if (!isVisited) {
                    totalRemainingAmount =
                      Number(element.showbalance) + Number(element.balance);
                    isVisited = true;
                  }

                  if (element.orgbalance >= this.userLeftAmount) {
                    if (this.userLeftAmount < element.showbalance) {
                      element.checkbxClass = "halfchecked";
                    } else if (this.userLeftAmount == element.showbalance) {
                      element.checkbxClass = "checked";
                    }
                    element.balance = Number(this.userLeftAmount).toFixed(2);
                    amount = element.balance;
                    element.oldpaidAmount = amount;
                    element.txtDisabled = true;
                    //element.isDisabled=true;
                    this.userLeftAmount -= amount;
                    element.showbalance -= amount;
                    this.paymentAmount += Number(amount);
                    this.amount -= amount;
                    if (Number(this.amount) == 0) {
                      element.isDisabled = false;
                    }
                  } else {
                    if (this.userLeftAmount > element.showbalance) {
                      element.checkbxClass = "checked";
                    }
                    element.balance = Number(element.orgbalance).toFixed(2);
                    amount = element.balance;
                    element.isDisabled = false;
                    element.txtDisabled = true;
                    if (this.amount == 0) {
                      element.isDisabled = true;
                    }
                    element.oldpaidAmount = amount;
                    this.userLeftAmount -= amount;
                    this.paymentAmount += Number(amount);
                    this.amount -= amount;
                  }
                  if (element.showbalance != 0) {
                    element.showbalance = Number(totalRemainingAmount) - amount;
                  } else {
                    element.showbalance = 0;
                  }
                  if (
                    this.pledges.filter((e) => e.pledgeID === pledgeId)
                      .length == 0
                  ) {
                    if (
                      this.pledges.filter((e) => e.PledgeID == element.pledgeId)
                        .length == 0
                    ) {
                      this.pledges.push({
                        PledgeID: Number(element.pledgeId),
                        PaidAmount: Number(amount),
                        RemainingAmount: element.showbalance - amount,
                      });
                    } else {
                      this.pledges.forEach((item) => {
                        if (item.PledgeID == element.pledgeId) {
                          item.PaidAmount = Number(amount);
                        }
                      });
                    }
                  }
                } else {
                  if (
                    this.amount == 0 &&
                    element.checkbxClass == "unchecked" &&
                    element.checkbxClass != "checked"
                  ) {
                    element.txtDisabled = true;
                    element.isDisabled = true;
                  } else {
                    element.checkbox = false;
                  }
                }
              });
              this.pledgeList.forEach((element) => {
                if (
                  this.amount == 0 &&
                  element.checkbxClass == "unchecked" &&
                  element.checkbxClass != "checked"
                ) {
                  element.txtDisabled = true;
                  element.isDisabled = true;
                }
              });
            } else {
              if (this.amount >= 0) {
                this.pledgeList.forEach((element) => {
                  if (element.pledgeId == pledgeId) {
                    if (this.greaterAmountError || element.balanceError) {
                      element.balance = "";
                      element.isDisabled = false;
                      element.paidAmount = 0.0;
                      setTimeout(() => {
                        if (element.orgbalance >= this.userLeftAmount) {
                          if (this.userLeftAmount < element.showbalance) {
                            element.checkbxClass = "halfchecked";
                          } else if (
                            this.userLeftAmount == element.showbalance
                          ) {
                            element.checkbxClass = "checked";
                          }
                          element.balance = Number(this.userLeftAmount).toFixed(
                            2
                          );
                          amount = element.balance;
                          element.oldpaidAmount = amount;
                          element.txtDisabled = true;
                          this.userLeftAmount -= amount;
                          element.showbalance -= amount;
                          this.paymentAmount += Number(amount);
                          this.amount -= amount;
                          element.paidAmount = element.balance;
                          if (Number(this.amount) == 0) {
                            element.isDisabled = false;
                          }

                          if (this.greaterAmountError) {
                            this.greaterAmountError = false;
                          }
                          if (element.balanceError) {
                            element.balanceError = false;
                          }
                          element.amountError = false;
                          if (
                            !this.greaterAmountError &&
                            !element.balanceError
                          ) {
                            if (element.showbalance > 0) {
                              element.checkbxClass = "halfchecked";
                            } else if (element.showbalance == 0) {
                              element.checkbxClass = "checked";
                            }
                          }
                          // Find the index of the pledge with the matching PledgeID
                          const pledgeIndex = this.pledges.findIndex(
                            (e) => e.PledgeID == pledgeId
                          );

                          if (pledgeIndex === -1) {
                            // If pledge doesn't exist, push a new one
                            this.pledges.push({
                              PledgeID: Number(element.pledgeId),
                              PaidAmount: Number(element.paidAmount),
                              RemainingAmount:
                                element.showorginalbalance -
                                Number(element.paidAmount),
                            });
                          } else {
                            // If pledge exists, update the existing entry
                            this.pledges[pledgeIndex].PaidAmount = Number(
                              element.paidAmount
                            );
                            this.pledges[pledgeIndex].RemainingAmount =
                              element.showorginalbalance -
                              Number(element.paidAmount);
                          }
                        } else {
                          if (this.userLeftAmount > element.showbalance) {
                            element.checkbxClass = "checked";
                          }
                          // Update the properties directly
                          element.balance = Number(element.orgbalance).toFixed(
                            2
                          );
                          const amount = element.balance;
                          element.isDisabled = false;
                          element.txtDisabled = true;
                          element.paidAmount = element.showbalance;
                          if (this.amount == 0) {
                            element.isDisabled = true;
                          }
                          element.oldpaidAmount = amount;
                          element.amount = amount;

                          this.userLeftAmount -= amount;
                          this.paymentAmount += Number(amount);
                          element.showbalance = 0;
                          this.amount -= amount;
                          if (this.greaterAmountError) {
                            this.greaterAmountError = false;
                          }
                          if (element.balanceError) {
                            element.balanceError = false;
                          }
                          if (
                            !this.greaterAmountError &&
                            !element.balanceError
                          ) {
                            if (element.showbalance > 0) {
                              element.checkbxClass = "halfchecked";
                            } else if (element.showbalance == 0) {
                              element.checkbxClass = "checked";
                            }
                          }
                          const pledgeIndex = this.pledges.findIndex(
                            (e) => e.PledgeID == pledgeId
                          );
                          if (pledgeIndex === -1) {
                            this.pledges.push({
                              PledgeID: Number(element.pledgeId),
                              PaidAmount: Number(element.paidAmount),
                              RemainingAmount: 0,
                            });
                          } else {
                            this.pledges[pledgeIndex].PaidAmount = Number(
                              element.paidAmount
                            );
                            this.pledges[pledgeIndex].RemainingAmount =
                              element.showorginalbalance -
                              Number(element.paidAmount);
                          }
                        }

                        this.pledgeList.forEach((element) => {
                          if (
                            this.amount == 0 &&
                            element.checkbxClass == "unchecked" &&
                            element.checkbxClass != "checked"
                          ) {
                            element.txtDisabled = true;
                            element.isDisabled = true;
                          }
                        });
                      }, 300);
                    }
                  }
                });
              }
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
            }
            this.amount += Number(amount);
            this.userLeftAmount += Number(amount);
          }
          this.pledgeList.forEach((element) => {
            if (element.pledgeId == pledgeId) {
              element.balance = "";
              element.oldpaidAmount = null;
              element.checkbxClass = "unchecked";
              element.isDisabled = false;
              element.txtDisabled = false;
              element.showbalance = Number(element.showbalance);
              element.showbalance += Number(amount);
              if (Number(this.amount) == 0) {
                element.isDisabled = false;
              }
              this.isPledgeApplied =
                element.isCurrentPaymentPledge == true ? true : false;
            } else {
              if (Number(this.amount == 0)) {
                element.isDisabled = true;
                element.txtDisabled = true;
              } else {
                element.isDisabled = false;
                if (element.checkbxClass == "unchecked") {
                  element.txtDisabled = false;
                }
              }
            }
          });
          if (!this.isAppliedPledge) {
            this.pledges = this.pledges.filter(
              (obj) => obj.PledgeID !== pledgeId
            );
          } else {
            this.pledges.forEach((element) => {
              if (element.PledgeID == pledgeId) {
                element.PaidAmount = 0;
              }
            });
          }
        } else {
        }
      }
    }
    this.donarRemoveIcon(event.target.checked);
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
              } else {
                element.amountError = true;
                this.greaterAmountError = true;
                return false;
              }
            }

            element.paidAmount = Number(event.target.value).toFixed(2);

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
          }
        });
      }
    } else {
      if (balance != "") {
        if (balance != event.target.value) {
          this.pledgeList.forEach((element) => {
            if (element.pledgeId == pledgeId) {
              (element.isDisabled = false),
                (element.balanceError = false),
                (element.amountError = false),
                (this.greaterAmountError = false);
              element.balance = "";

              if (
                Number(event.target.value) > this.userLeftAmount &&
                element.paidAmount != Number(event.target.value)
              ) {
                if (element.paidAmount > Number(event.target.value)) {
                  element.amountError = false;
                  this.greaterAmountError = false;
                } else {
                  element.amountError = true;
                  this.greaterAmountError = true;
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

  SubmitPledgePay() {
    this.isloading = true;
    var objUpdatePaymentData: any = {};

    objUpdatePaymentData = {
      PaymentId: this.paymentId,
      MacAddress: this.localstoragedataService.getLoginUserGuid(),
      //"Note": "string",
      CollectorId:
        this.commonMethodService.selectedPaymentCollectors.length != 0
          ? this.commonMethodService.selectedPaymentCollectors.reduce(
              (s) => s.id
            ).id
          : null,
      LocationId:
        this.commonMethodService.selectedPaymentLocations.length != 0
          ? this.commonMethodService.selectedPaymentLocations.reduce(
              (s) => s.id
            ).id
          : null,
      CampaignId:
        this.commonMethodService.selectedFromCampaignList.length != 0
          ? this.commonMethodService.selectedFromCampaignList.reduce(
              (s) => s.id
            ).id
          : null,
      PaymentDate: moment(this.selectedDate.startDate).format("YYYY-MM-DD"),
      ReasonId:
        this.commonMethodService.selectedPaymentReasons.length != 0
          ? this.commonMethodService.selectedPaymentReasons.reduce((s) => s.id)
              .id
          : null,
      AccountId: this.selectedDonorId,
      Amount: Number(this.editamount),
      StatusId:
        this.checkStatusId && this.checkStatusId.length > 0
          ? this.checkStatusId[0].id
          : this.paymentStatusId,
      Pledges: this.pledges.map((x) => {
        return {
          ...x,
          RemainingAmount: x.RemainingAmount < 0 ? 0 : x.RemainingAmount,
        };
      }),
      //Pledges: this.pledges.filter(x=>x.PaidAmount !=0),//added new
      Note: this.note,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      RefNum: this.refNum,
      cardHolderName: this.cardHolderName,
    };

    this.paymentService.UpdatePayment(objUpdatePaymentData).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.analytics.editedPayment();
          Swal.fire({
            title: res,
            confirmButtonText: "Close",
            iconHtml: "<img src='/assets/dist/img/checked_icon.svg' />",
            showCloseButton: true,
            customClass: {
              title: "edit_payment_success_title",
              confirmButton: "btn_ok",
              container: "payment-done",
            },
          });
          this.activeModal.dismiss();
          this.emtEditPayment.emit(res);
          this.commonMethodService.sendPaymentTrans(true);
        }
      },
      (error) => {
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
        this.isloading = false;
      }
    );
  }

  SearchGlobalDonor() {
    this.isGlobalList = true;
    var text = $("#donorText").val();
    this.showBox = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
  }

  SearchDonor(event) {
    this.showBox = true;
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      if ($("#globallist").is(":checked")) {
        if (event.keyCode === 13) {
          this.isGlobalList = true;
          this.showBox = true;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.isGlobalList = false;
        this.search(event.target.value);
      }
    }
  }

  search(keyword) {
    var record = this.commonMethodService.localDonorList;
    keyword = keyword.toLowerCase();
    var filterdRecord;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            obj.donorStatus == "Active" &&
            ((obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
              (obj.fullName &&
                obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
              (obj.fullNameJewish &&
                obj.fullNameJewish
                  .toLowerCase()
                  .toString()
                  .indexOf(searchValue) > -1) ||
              (obj.address &&
                obj.address.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
              (obj.cityStateZip &&
                obj.cityStateZip.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
              (obj.group &&
                obj.group.toString().toLowerCase().indexOf(searchValue) > -1) ||
              (obj.class &&
                obj.class.toString().toLowerCase().indexOf(searchValue) > -1) ||
              (obj.phoneLabels &&
                obj.phoneLabels.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
              (obj.phonenumbers &&
                obj.phonenumbers.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
              (obj.emailLabels &&
                obj.emailLabels.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
              (obj.emails &&
                obj.emails.toString().toLowerCase().indexOf(searchValue) > -1))
        );
        if (filterdRecord.length > 0) {
          for (var i = 0; i < filterdRecord.length; i++) {
            filterdRecord[i].id = filterdRecord[i].accountId;
            filterdRecord[i].displayText = filterdRecord[i].fullName;
          }
        }
        this.commonMethodService.donorList = filterdRecord;
        record = this.commonMethodService.donorList;
      }
    } else {
      this.commonMethodService.donorList = [];
    }
  }

  OnGlobalCheckboxChange(event) {
    if (event.target.checked) {
      this.displaySearchIcon = true;
    } else {
      this.displaySearchIcon = false;
    }
  }

  onClickedOutside() {
    this.showBox = false;
  }

  SelectDonor(accountId, isAddedFromCard, resValue = null) {
    this.showBox = false;
    this.nonEditable = true;
    this.displaySearchIcon = false;
    this.selectedDonorId = accountId;
    this.removeDonor = true;

    if (isAddedFromCard) {
      this.commonMethodService.donorList = [resValue];
      this.donor =
        this.commonMethodService.donorList[0]?.fullNameJewish != null
          ? this.commonMethodService.donorList[0]?.fullNameJewish
          : this.commonMethodService.donorList[0]?.fullName;
    } else {
      this.commonMethodService.donorList =
        this.commonMethodService.donorList.filter((s) => s.id == accountId);
      this.donor =
        this.commonMethodService.donorList[0]?.fullNameJewish != null
          ? this.commonMethodService.donorList[0]?.fullNameJewish
          : this.commonMethodService.donorList[0]?.displayText;
    }

    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();

    this.isloading = true;

    this.donorPledgePaymentService
      .donorPledgePaymentList(accountId, eventGuid)
      .subscribe((res: any) => {
        if (res) {
          if (res.unpaidPledges) {
            res.unpaidPledges.forEach((element) => {
              element.balance = element.pledgeRemainingAmount;
              element.paidAmount = 0;
              element.pledgeAmount = element.pledgeTotalAmount;
            });
            this.GetPayPledgeList(res.unpaidPledges);
            this.isloading = false;
          } else {
            this.isloading = false;
          }
        }
      });
  }
  RemoveDonor() {
    this.nonEditable = false;
    this.donor = null;
    this.selectedDonorId = -1; //null;//added new
    this.pledgeList = [];
    this.totalAmount = 0.0;
    this.amount = 0.0;
    this.paymentAmount = 0.0;
    this.removeDonor = false;
    this.donorInput.nativeElement.focus();
  }

  onVoidClick() {
    if (
      this.status == "batched" ||
      this.status == "Declined" ||
      this.status == "Error"
    ) {
      this.deletePayment(this.paymentId, this.status);
    } else {
      if (this.batchNum) {
        //issue refund api call
        Swal.fire({
          title: "Payment is batched!",
          text: "",
          showCancelButton: true,
          cancelButtonText: "Issue refund",
          confirmButtonText: "Void from portal",
          showCloseButton: true,
          customClass: {
            cancelButton: "btn-Issue-refund",
            confirmButton: "btn-Void-from-portal",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            //Void from portal button clicked
            var paymentIdsArray = [];
            paymentIdsArray.push("paymentIds=" + this.paymentId);
            this.onDeletePyament(paymentIdsArray);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            var txtRefundAmout = "";

            Swal.fire({
              title: "Please enter refund amount",
              input: "number",
              confirmButtonText: "Issue refund",
              showCloseButton: true,
              inputAttributes: {
                step: "any",
              },
              customClass: {
                confirmButton: "btn_ok",
                validationMessage: "my-validation-message",
                input: "form-control txt-Refun-dAmout",
              },
              preConfirm: (value) => {
                if (!value) {
                  Swal.showValidationMessage(
                    '<i class="fa fa-info-circle"></i> Amount is required'
                  );
                }
                if (
                  parseFloat(value) > parseFloat(this.currencyAmount.toString())
                ) {
                  Swal.showValidationMessage(
                    '<i class="fa fa-info-circle"></i> Please check refund amount'
                  );
                }
                txtRefundAmout = value;
              },
            }).then((res) => {
              if (res.isConfirmed) {
                this.refundPayment(this.paymentId, txtRefundAmout);
              }
            });
          }
        });
      } else {
        Swal.fire({
          title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
          text: this.commonMethodService.getTranslate("WARNING_SWAL.TEXT"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.YES_VOID_IT"
          ),
          cancelButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
          ),
        }).then((result) => {
          if (result.value) {
            this.isloading = true;
            var objVoidPayment = {
              paymentId: this.paymentId,
              loginUserId: this.localstoragedataService.getLoginUserId(),
              macAddress: this.localstoragedataService.getLoginUserGuid(),
              eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            };
            this.paymentService.VoidPayment(objVoidPayment).subscribe(
              (res: any) => {
                this.isloading = false;
                if (res) {
                  if (res.status == "Success") {
                    Swal.fire({
                      title: this.commonMethodService.getTranslate(
                        "WARNING_SWAL.SUCCESS_TITLE"
                      ),
                      text: res.message,
                      icon: "success",
                      confirmButtonText: this.commonMethodService.getTranslate(
                        "WARNING_SWAL.BUTTON.CONFIRM.OK"
                      ),
                      customClass: {
                        confirmButton: "btn_ok",
                      },
                    }).then(() => {
                      this.activeModal.dismiss();
                      this.commonMethodService.sendPaymentTrans(true);
                      this.emtEditPayment.emit(res);
                    });
                  } else if (res.status == "Error") {
                    this.deletePayment(this.paymentId, res.message);
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
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: this.commonMethodService.getTranslate("CANCELLED"),
              text: this.commonMethodService.getTranslate(
                "WARNING_SWAL.NO_ACTION_TAKEN"
              ),
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
            this.isloading = false;
          }
        });
      }
    }
  }

  openCampaignCardPopup(campaignId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup campaign_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      CampaignCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CampaignID = campaignId;
    const obj = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      CampaignId: campaignId,
    };
    this.campaignService.getCampaignCard(obj).subscribe(
      (res: any) => {
        this.isloading = false;
        modalRef.componentInstance.CampaignCardData = res;
        modalRef.componentInstance.CampaignId = campaignId;
      },
      () => {
        this.isloading = false;
      }
    );
  }

  //
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  //

  deletePayment(paymentId, status) {
    if (
      status.includes("CardKnox Void Failed") ||
      status.includes("refund") ||
      status.includes("credit") ||
      status.includes("Payment api key info not found") ||
      status.includes("Matbia Void Failed") ||
      status.includes("OneGiv could not be supported void")
    ) {
      Swal.fire({
        title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
        html:
          status +
          "<br> Payment cannot be voided.<br> This action will remove payment from DRM",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Delete",
        denyButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
        ),
        confirmButtonText: "Refund",
        showDenyButton: true,
        customClass: {
          confirmButton: "refund_btn",
          cancelButton: "delete_btn",
          denyButton: "keep_btn",
        },
      }).then((result) => {
        if (result.value) {
          var txtRefundAmout = "";

          Swal.fire({
            title: "Please enter refund amount",
            input: "number",
            confirmButtonText: "Issue refund",
            showCloseButton: true,
            inputAttributes: {
              step: "any",
            },
            customClass: {
              confirmButton: "btn_ok",
              validationMessage: "my-validation-message",
              input: "form-control txt-Refun-dAmout",
            },
            preConfirm: (value) => {
              if (!value) {
                Swal.showValidationMessage(
                  '<i class="fa fa-info-circle"></i> Amount is required'
                );
              }
              if (
                parseFloat(value) > parseFloat(this.currencyAmount.toString())
              ) {
                Swal.showValidationMessage(
                  '<i class="fa fa-info-circle"></i> Please check refund amount'
                );
              }
              txtRefundAmout = value;
            },
          }).then((res) => {
            if (res.isConfirmed) {
              this.refundPayment(paymentId, txtRefundAmout);
            }
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          var paymentIdsArray = [];
          paymentIdsArray.push(paymentId); //added new
          paymentIdsArray = paymentIdsArray.map((element) => {
            return element;
          });
          this.paymentService.DeletePayment(paymentIdsArray).subscribe(
            (res: any) => {
              this.isloading = false;
              ///
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
                this.activeModal.dismiss();
                this.commonMethodService.sendPaymentTrans(true);
                this.emtEditPayment.emit(res);
              });
              ///
            },
            () => {
              this.isloading = false;
            }
          );
        } else if (result.isDenied) {
          Swal.fire({
            title: this.commonMethodService.getTranslate("CANCELLED"),
            text: this.commonMethodService.getTranslate(
              "WARNING_SWAL.NO_ACTION_TAKEN"
            ),
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      });
    } else {
      Swal.fire({
        title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
        html:
          status +
          "</br> Payment cannot be voided.<br> This action will remove payment from DRM",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.YES_VOID_IT"
        ),
        cancelButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
        ),
      }).then((result) => {
        if (result.value) {
          var paymentIdsArray = [];
          paymentIdsArray.push(paymentId); //added new
          paymentIdsArray = paymentIdsArray.map((element) => {
            return element;
          });
          this.paymentService.DeletePayment(paymentIdsArray).subscribe(
            (res: any) => {
              this.isloading = false;
              console.log("delete response ", res);
              ///
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
                this.activeModal.dismiss();
                this.commonMethodService.sendPaymentTrans(true);
                this.emtEditPayment.emit(res);
              });
              ///
            },
            () => {
              this.isloading = false;
            }
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: this.commonMethodService.getTranslate("CANCELLED"),
            text: this.commonMethodService.getTranslate(
              "WARNING_SWAL.NO_ACTION_TAKEN"
            ),
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      });
    }
  }
  refundPayment(paymentId, amount) {
    var obj = {
      paymentId: paymentId,
      loginUserId: this.localstoragedataService.getLoginUserId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      amount: amount,
    };
    this.paymentService.RefundPayment(obj).subscribe((res: any) => {
      if (res) {
        Swal.fire({
          text: res.message,
          icon: res.status.toLowerCase(),
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        }).then(() => {
          this.activeModal.dismiss();
          this.commonMethodService.sendPaymentTrans(true);
          this.emtEditPayment.emit(res);
        });
      }
    });
  }
  onDeletePyament(paymentIdsArray) {
    paymentIdsArray = paymentIdsArray.map((element) => {
      return element;
    });
    this.paymentService.DeletePayment(paymentIdsArray).subscribe(
      (res: any) => {
        this.isloading = false;
        console.log("delete response ", res);
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
          this.activeModal.dismiss();
          this.commonMethodService.sendPaymentTrans(true);
          this.emtEditPayment.emit(res);
        });
      },
      () => {
        this.isloading = false;
      }
    );
  }
  setClsCheckStatusDrp(item) {
    if (item == "Pending") {
      return "check-pending";
    }
    if (item == "Deposited") {
      return "check-deposited";
    }
    if (item == "Declined") {
      return "check-declined";
    }
  }
  setDropDownSettings(
    placeholder: string,
    itemsShowLimit: number,
    multiple: boolean,
    singleSelection: boolean,
    enableSearch?: boolean,
    enableCheckAll?: boolean,
    position?: string,
    autoPosition?: boolean,
    disabled?: boolean,
    groupBy?: string
  ) {
    return {
      text: placeholder,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      classes: "myclass custom-class check-status-drop",
      labelKey: "itemName",
      noDataLabel: "No record found with search criteria",
      enableSearchFilter: enableSearch,
      enableCheckAll: enableCheckAll,
      autoPosition: autoPosition,
      enableFilterSelectAll: false,
      position: position,
      multiple: multiple,
      badgeShowLimit: itemsShowLimit,
      searchAutofocus: true,
      singleSelection: singleSelection,
      disabled: disabled,
      groupBy: groupBy,
    };
  }
  onItemSelectCheckStatus(event) {
    if (this.paymentStatusId == 3) {
      this.isDrpDisabled = true;
    }
    if (event.itemName == "Declined") {
      //
      this.pledges.forEach((element) => {
        element.PaidAmount = 0;
      });
    }
    let setCls = this.setClsCheckStatusDrp(event.itemName);
    $(".check-status-drop").removeClass("check-pending");
    $(".check-status-drop").removeClass("check-deposited");
    $(".check-status-drop").removeClass("check-declined");
    $(".check-status-drop").addClass(setCls);
  }
  donarRemoveIcon(IsAppliedPledge) {
    if (IsAppliedPledge) {
      this.removeDonor = false;
      this.nonEditable = false;
      this.campingNonEditable = false;
      this.reasonNonEditable = false;
      this.selectedAppliedPledge = true;
      this.isBlock = true;
      return false;
    }
    if (!this.isAppliedPledge) {
      const isChekedArray = [];
      this.checkboxes.forEach((element) => {
        isChekedArray.push(element.nativeElement.checked);
      });

      if (!isChekedArray.includes(true)) {
        this.removeDonor = true;
        this.nonEditable = true;
        this.campingNonEditable = true;
        this.reasonNonEditable = true;
        this.selectedAppliedPledge = false;
        this.isBlock = false;
      }
    }
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true,
      "editPaymentDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "EditPaymentPopup" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
        }
      });
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Edit_Transaction";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  AddNewDonor(donorNumber) {
    this.commonMethodService.AddNewDonor(donorNumber).then((value) => {
      if (value) {
        this.SelectDonor(value.accountId, true, value);
      }
    });
  }
  activateTab(val) {
    this.activeTab = val;
  }
}
