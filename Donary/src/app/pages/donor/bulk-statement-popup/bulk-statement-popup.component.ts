import { Component, inject, Input, OnInit, ViewChild } from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
import { PrintReceiptPopupComponent } from "../../transaction/receipt-actions/print-receipt-popup/print-receipt-popup.component";
import { PrintSingleReceiptPopupComponent } from "../../transaction/receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { BulkAdvanceStatementComponent } from "../bulk-advance-statement/bulk-advance-statement.component";
import { AddressValidateService } from "src/app/services/address-validate.service";
import { Subscription } from "rxjs";
import { environment } from "src/environments/environment";
import * as _ from "lodash";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { AnalyticsService } from "src/app/services/analytics.service";

@Component({
  selector: "app-bulk-statement-popup",
  templateUrl: "./bulk-statement-popup.component.html",
  standalone: false,
  styleUrls: ["./bulk-statement-popup.component.scss"],
})
export class BulkStatementPopupComponent implements OnInit {
  modalOptions: NgbModalOptions;
  selectedDateRange: any = { startDate: null, endDate: null };
  recordSelectedArray: any = [];
  isSelected: boolean;
  isDevEnv: boolean;
  minBalance: number;
  maxBalance: number;
  isloading: boolean = false;
  statementType: any;
  isOnlyPledgePayment: boolean = true;
  hidePaymentsList: boolean = false;
  hide0BalancePledges: boolean = true;
  statementTypeList: Array<{ id: string; itemName: string }> = [
    {
      id: "",
      itemName: "",
    },
  ];
  gridData: Array<any>;
  selectedData: Array<any>;
  uiPageSettingId: any = null;
  PageName: string = "Bulk Statement";
  isOneDate: boolean = false;
  EngHebCalPlaceholder: string = "All Time";
  class_id: string = "";
  class_hid: string = "";
  private calendarSubscription: Subscription;
  popTitle: any;
  otherInfo: any;
  analytics = inject(AnalyticsService);

  @Input() set Info(Info: any) {
    this.otherInfo = Info;
  }

  @Input() set SelectedId(data) {
    if (data) {
      this.recordSelectedArray = data;
    }
  }
  @Input() set grid(data) {
    if (data) {
      this.gridData = data;
    }
  }
  @Input() set List(selectedData) {
    if (selectedData) {
      this.selectedData = selectedData;
    }
  }

  @Input() donorIds: any;

  selectedRecordsLength: number = 0;
  donorIdsLength: number = 0;
  notRecievingStatments: number = 0;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private addressValidateService: AddressValidateService,
    public messengerService: MessengerService,
    private uiPageSettingService: UIPageSettingService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    this.selectedRecordsLength = this.recordSelectedArray.length;
    this.donorIdsLength = this.donorIds ? this.donorIds.length : 0;
    this.notRecievingStatments =
      this.selectedRecordsLength - this.donorIdsLength;

    if (!this.commonMethodService.statementTypeList[0].id) {
      this.commonMethodService.getStatementTemplates();
    }
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "bulkStatmentList",
    };

    if (!this.commonMethodService.statementType) {
      this.commonMethodService.getUiPageSetting(objLayout);
    }
  }

  closePopup() {
    this.activeModal.dismiss();
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedPaymentCollectors = [];
  }

  datesUpdated(event) {
    this.isSelected = false;
    this.selectedDateRange = event;
  }
  onItemSelect(item: any) {
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "bulkStatmentList",
      setting: !!item ? JSON.stringify(item) : null,
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {});
  }

  Send() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup advance_receipt advance_action bulk_advance_statement",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkAdvanceStatementComponent,
      this.modalOptions
    );
    let resultArray = [];
    for (const item of this.recordSelectedArray) {
      let donorDetails = this.gridData.find((x) => x.accountId == item);
      resultArray.push(donorDetails);
    }

    // address validation
    let listMailData = _(resultArray)
      .chain()
      .groupBy((p) => p.accountId)
      .map((props) => {
        return {
          ..._.head(props),
          //paymentIds: _.map(props, (p) => p.paymentId),
        };
      })
      .value();

    modalRef.componentInstance.List = listMailData;
    modalRef.componentInstance.Info = { type: "Statement" };
    modalRef.componentInstance.Duration = this.selectedDateRange;
    modalRef.componentInstance.OnlyPledgePayment = this.isOnlyPledgePayment;
    modalRef.componentInstance.statementTypeV =
      this.commonMethodService.statementType;
    modalRef.componentInstance.PaymentAndBalancePledges = {
      hidePaymentsList: this.hidePaymentsList,
      hide0BalancePledges: this.hide0BalancePledges,
    };
    modalRef.componentInstance.objAdvancedSearch = {
      reasonIds:
        this.commonMethodService.selectedPaymentReasons.length > 0
          ? this.commonMethodService.selectedPaymentReasons.map((s) => s.id)
          : null,
      collectorIds:
        this.commonMethodService.selectedPaymentCollectors.length > 0
          ? this.commonMethodService.selectedPaymentCollectors.map((s) => s.id)
          : null,
      locationIds:
        this.commonMethodService.selectedPaymentLocations.length > 0
          ? this.commonMethodService.selectedPaymentLocations.map((s) => s.id)
          : null,
      campaignIds:
        this.commonMethodService.selectedFromCampaignList.length > 0
          ? this.commonMethodService.selectedFromCampaignList.map((s) => s.id)
          : null,
    };
  }
  Print() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    // let paymentIds = this.recordSelectedArray;
    let paymentIds = this.isDevEnv ? this.donorIds : this.recordSelectedArray;
    var objAdvancedSearch = {
      reasonIds:
        this.commonMethodService.selectedPaymentReasons &&
        this.commonMethodService.selectedPaymentReasons.length > 0
          ? this.commonMethodService.selectedPaymentReasons.map((s) => s.id)
          : null,
      collectorIds:
        this.commonMethodService.selectedPaymentCollectors &&
        this.commonMethodService.selectedPaymentCollectors.length > 0
          ? this.commonMethodService.selectedPaymentCollectors.map((s) => s.id)
          : null,
      locationIds:
        this.commonMethodService.selectedPaymentLocations &&
        this.commonMethodService.selectedPaymentLocations.length > 0
          ? this.commonMethodService.selectedPaymentLocations.map((s) => s.id)
          : null,
      campaignIds:
        this.commonMethodService.selectedFromCampaignList &&
        this.commonMethodService.selectedFromCampaignList.length > 0
          ? this.commonMethodService.selectedFromCampaignList.map((s) => s.id)
          : null,
    };
    let objMailReceipt = {
      type: "Statement",
      Ids: paymentIds,
      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
      ReceiverEmailAddress: this.localstoragedataService.getLoginUserEmail(),
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      StatementSpecificFilters: objAdvancedSearch,
      MinPledgeBalance: this.minBalance,
      MaxPledgeBalance: this.maxBalance,
      statementType: this.commonMethodService.statementType
        ? this.commonMethodService.statementType[0].id
        : "",
      isOnlyPledgePayment: this.isOnlyPledgePayment,
      hidePaymentsList: this.hidePaymentsList,
      hide0BalancePledges: this.hide0BalancePledges,
    };

    if (paymentIds?.length < 50) {
      // const modalRef = this.commonMethodService.openPopup(PrintReceiptPopupComponent, this.modalOptions);
      const modalRef = this.commonMethodService.openPopup(
        PrintSingleReceiptPopupComponent,
        this.modalOptions
      );
      this.messengerService.BulkPrintReceipt(objMailReceipt).subscribe(
        (res: any) => {
          this.isloading = false;
          if (this.otherInfo.type == "Statement")
            this.analytics.bulkStatementsPrintDonor();

          if (res.receiptFileUrl) {
            modalRef.componentInstance.fileDetails = {
              filename: res.receiptFileUrl,
              filetype: res.contentType,
            };
          } else {
            Swal.fire({
              title: "Try Again!",
              text: "No receipt found", //res.errorResponse,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
            modalRef.close(PrintReceiptPopupComponent);
          }
        },
        (error) => {
          this.isloading = false;
          console.log(error);
          modalRef.close(PrintReceiptPopupComponent);
          Swal.fire({
            title: "Error while fetching data !!",
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
    } else {
      Swal.fire({
        title: "Print Receipt",
        text: `Receipts will be send to ${this.localstoragedataService.getLoginUserEmail()}`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Process",
        confirmButtonColor: "#7b5bc4",
        cancelButtonText: "Cancel",
      }).then((result) => {
        // On Confirm
        if (result.isConfirmed) {
          this.isloading = true;
          this.messengerService.BulkPrintReceipt(objMailReceipt).subscribe(
            (res: any) => {
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
            },
            (error) => {
              this.isloading = false;
              console.log(error);
              Swal.fire({
                title: "Error while fetching data !!",
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
        }
      });
    }
  }

  AdvancePrintReceipt() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_receipt advance_mail",
    };
    const modalRef = this.commonMethodService.openPopup(
      PrintReceiptPopupComponent,
      this.modalOptions
    );
    let resultArray = [];
    this.gridData = this.gridData.map((x) => {
      x.paymentId = x.accountId;
      return x;
    });
    for (const item of this.recordSelectedArray) {
      let donorDetails = this.gridData.find((x) => x.paymentId == item);
      resultArray.push(donorDetails);
    }
    modalRef.componentInstance.List = resultArray;
    modalRef.componentInstance.Info = { type: "Statement" };
    modalRef.componentInstance.Duration = this.selectedDateRange;

    modalRef.componentInstance.emtOutput.subscribe(() => {
      this.commonMethodService.sendPaymentTrans(true);
    });
  }

  onDeSelectAllItems() {
    this.commonMethodService.statementType = null;
    this.onItemSelect(null);
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.datesUpdated(this.selectedDateRange);
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items?.pageName == this.PageName &&
          this.commonMethodService.isCalendarClicked
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
    }
  }
}
