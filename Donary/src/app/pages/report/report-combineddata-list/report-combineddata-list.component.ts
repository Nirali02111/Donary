import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CampaignTransactionService } from "src/app/services/campaign-transaction.service";
import { CardService } from "src/app/services/card.service";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { ReportCombineddataCardpopupComponent } from "../report-combineddata-cardpopup/report-combineddata-cardpopup.component";

@Component({
  selector: "app-report-combineddata-list",
  templateUrl: "./report-combineddata-list.component.html",
  styleUrls: ["./report-combineddata-list.component.scss"],
  standalone: false,
})
export class ReportCombineddataListComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  isloading: boolean;
  selectedDateRange: any = {
    startDate: moment(new Date()).subtract(29, "days"),
    endDate: moment(new Date()),
  };

  colFields: any = [
    { colName: "Donor Name", isVisible: true, colId: "campaignDonorNameId" },
    { colName: "Campaign", isVisible: true, colId: "campaignNameId" },
    {
      colName: "Total Amount",
      isVisible: true,
      colId: "campaignTotalAmountId",
    },
    { colName: "Paid", isVisible: true, colId: "campaignPaidId" },
    { colName: "Pending", isVisible: true, colId: "campaignPendingId" },
    { colName: "Balance", isVisible: true, colId: "campaignBalanceId" },
  ];
  gridData: Array<any>;
  gridFilterData: Array<any>;
  paymentTypeChipData: Array<any>;
  objAdvancedSearch: any;

  filtercount: number = 0;
  cardFilter = [];
  totalRecord: number = 0;
  modalOptions: NgbModalOptions;
  paymentTypeChipClassName: string = "info-box bg-gradient-info";
  cardType: any = [{ id: 1, itemName: "Campaign" }];
  isCampaignDonorNameColVisible: boolean = true;
  isCampaignNameColVisible: boolean = true;
  isCampaignTotalAmountColVisible: boolean = true;
  isCampaignPaidAmountColVisible: boolean = true;
  isCampaignPendingAmountColVisible: boolean = true;
  isCampaignBalanceColVisible: boolean = true;

  headerList: any = [
    {
      colName: "Donor Name",
      visibleCondition: this.isCampaignDonorNameColVisible,
      sortName: "fullNameJewish",
    },
    {
      colName: "Campaign",
      visibleCondition: this.isCampaignNameColVisible,
      sortName: "campaignName",
    },
    {
      colName: "Total Amount",
      visibleCondition: this.isCampaignTotalAmountColVisible,
      sortName: "totalAmount",
    },
    {
      colName: "Paid",
      visibleCondition: this.isCampaignPaidAmountColVisible,
      sortName: "paidAmount",
    },
    {
      colName: "Pending",
      visibleCondition: this.isCampaignPendingAmountColVisible,
      sortName: "pendingAmount",
    },
    {
      colName: "Balance",
      visibleCondition: this.isCampaignBalanceColVisible,
      sortName: "balance",
    },
  ];
  constructor(
    public commonMethodService: CommonMethodService,
    private notificationService: NotificationService,
    private localStorageDataService: LocalstoragedataService,
    private campaignTransactionService: CampaignTransactionService,
    private cardService: CardService
  ) {}

  ngOnInit() {
    this.searchCampaignTransactionsData();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
  }

  dropColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
  }

  searchCampaignTransactionsData() {
    this.isloading = true;
    var objsearchCampaign = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      donors:
        this.objAdvancedSearch && this.objAdvancedSearch.donors.length > 0
          ? this.objAdvancedSearch.donors.map((s) => s.id)
          : null,
      campaignIds:
        this.objAdvancedSearch && this.objAdvancedSearch.campaigns.length > 0
          ? this.objAdvancedSearch.campaigns.map((s) => s.id)
          : null,
      dateFrom: this.selectedDateRange.startDate,
      dateTo: this.selectedDateRange.endDate,
    };
    this.campaignTransactionService
      .getCampaignTransactions(objsearchCampaign)
      .subscribe(
        (res: any) => {
          // hide loader
          this.isloading = false;
          if (res) {
            this.totalRecord = res.length;
            this.gridData = res;
            this.gridFilterData = this.gridData;
          } else {
            this.totalRecord = 0;
            this.gridData = null;
            this.gridFilterData = this.gridData;
          }
          this.isloading = false;
        },
        (error) => {
          this.isloading = false;
          console.log(error);
        }
      );
  }
  setGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "donorname":
        this.isCampaignDonorNameColVisible = isVisible;
        break;
      case "campaign":
        this.isCampaignNameColVisible = isVisible;
        break;
      case "totalamount":
        this.isCampaignTotalAmountColVisible = isVisible;
        break;
      case "paid":
        this.isCampaignPaidAmountColVisible = isVisible;
        break;
      case "pending":
        this.isCampaignPendingAmountColVisible = isVisible;
        break;
      case "balance":
        this.isCampaignBalanceColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }

  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "donorname":
        return this.isCampaignDonorNameColVisible;
      case "campaign":
        return this.isCampaignNameColVisible;
      case "totalamount":
        return this.isCampaignTotalAmountColVisible;
      case "paid":
        return this.isCampaignPaidAmountColVisible;
      case "pending":
        return this.isCampaignPendingAmountColVisible;
      case "balance":
        return this.isCampaignBalanceColVisible;
    }
  }

  datesUpdated(event) {
    this.searchCampaignTransactionsData();
  }

  openCombinedDataCardPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup combined_data",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReportCombineddataCardpopupComponent,
      this.modalOptions
    );
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
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      accountId: accountID,
    };

    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      modalRef.componentInstance.DonorCardData = res;
    });
  }
  CalendarFocus() {
    this.pickerDirective.open();
  }
  openAdvanceSearchFilterPopup() {}

  cardTypeChange(cardType) {
    if (cardType) {
      this.searchCampaignTransactionsData();
    }
  }
  GetPaymentTransByPaymentChipType(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.id).toString()
          : null;
      switch (cardTypeValue) {
        case "1": //Pledge
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.campaignId == objPaymentTypeChip.paymentTypeId
            );
          }
          break;
        case "2": //Reason
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.paymentReasonId == objPaymentTypeChip.paymentTypeId
            );
          }
          break;
        case "3": //Location
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.locationId == objPaymentTypeChip.paymentTypeId
            );
          }
          break;
        case "4": //Donor
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.accountId == objPaymentTypeChip.paymentTypeId
            );
          }
          break;
      }

      this.paymentTypeChipData.forEach(
        (ele) => (ele.paymentTypeChipCSSClass = "info-box bg-gradient-info")
      );
      objPaymentTypeChip.paymentTypeChipCSSClass =
        "info-box bg-gradient-success";
    }
  }

  search(keyword) {}

  public downloadExcel() {}
}
