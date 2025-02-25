import { Component, OnInit, ViewChild } from "@angular/core";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CampaignTransactionService } from "src/app/services/campaign-transaction.service";
import { CardService } from "src/app/services/card.service";
import * as XLSX from "xlsx";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { SupportPopupComponent } from "../support-popup/support-popup.component";
import { CampaignTransGridFilterPopupComponent } from "./campaign-trans-grid-filter-popup/campaign-trans-grid-filter-popup.component";
import { XLSXService } from "src/app/services/xlsx.service";

@Component({
  selector: "app-campaign-transaction",
  templateUrl: "./campaign-transaction.component.html",
  standalone: false,
  styleUrls: ["./campaign-transaction.component.scss"],
})
export class CampaignTransactionComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  selectedDateRange: any = {
    startDate: moment(new Date()).subtract(29, "days"),
    endDate: moment(new Date()),
  };
  objAdvancedSearch: any;
  modalOptions: NgbModalOptions;
  isloading: boolean;
  gridData: Array<any>;
  gridFilterData: Array<any>;
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;

  colFields: any = [
    { colName: "Full Name", isVisible: true },
    { colName: "Full Name Jewish", isVisible: true },
    { colName: "Payment Type", isVisible: true },
    { colName: "Campaign", isVisible: true },
    { colName: "Transaction No", isVisible: true },
    { colName: "Pledged Amount", isVisible: true },
    { colName: "Scheduled Amount", isVisible: true },
    { colName: "Paid Amount", isVisible: true },
    { colName: "Balance", isVisible: true },
  ];
  isCampaignFullNameColVisible: boolean = true;
  isCampaignFullNameJewishColVisible: boolean = true;
  isCampaignPaymentTypeColVisible: boolean = true;
  isCampaignNameColVisible: boolean = true;
  isCampaignTransactionNoColVisible: boolean = true;
  isCampaignPledgedAmountColVisible: boolean = true;
  isCampaignScheduledAmountColVisible: boolean = true;
  isCampaignPaidAmountColVisible: boolean = true;
  isCampaignBalanceColVisible: boolean = true;

  constructor(
    public commonMethodService: CommonMethodService,
    private notificationService: NotificationService,
    private cardService: CardService,
    private campaignTransactionService: CampaignTransactionService,
    private localstoragedataService: LocalstoragedataService,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.searchCampaignData();
  }

  datesUpdated(event) {
    this.searchCampaignData();
  }
  CalendarFocus() {
    this.pickerDirective.open();
  }
  searchCampaignData() {
    this.isloading = true;
    var objsearchCampaign = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      donors:
        this.objAdvancedSearch && this.objAdvancedSearch.donors.length > 0
          ? this.objAdvancedSearch.donors.map((s) => s.id)
          : null,
      campaignIds:
        this.objAdvancedSearch && this.objAdvancedSearch.campaigns.length > 0
          ? this.objAdvancedSearch.campaigns.map((s) => s.id)
          : null,
      dateFrom: moment(this.selectedDateRange.startDate).format("YYYY-MM-DD"),
      dateTo: this.selectedDateRange.endDate,
    };
    this.campaignTransactionService
      .getCampaignTransactions(objsearchCampaign)
      .subscribe(
        (res: any) => {
          // hide loader
          this.isloading = false;
          this.isFiltered = false;
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

  openAdvanceSearchFilterPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      CampaignTransGridFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.searchCampaignData();
      }
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
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,
    };

    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      modalRef.componentInstance.DonorCardData = res;
    });
  }

  search(keyword) {
    this.isloading = true;
    var record = this.gridData;
    var filterdRecord;
    this.totalRecord = this.gridData.length;
    this.isFiltered = false;
    keyword = keyword.toLowerCase();
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.transNum &&
              obj.transNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.pledgedAmount &&
              obj.pledgedAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.paymentType &&
              obj.paymentType.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.scheduledAmount &&
              obj.scheduledAmount
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.paidAmount &&
              obj.paidAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.balance &&
              obj.balance.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.campaignName &&
              obj.campaignName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );
        this.gridFilterData = filterdRecord;
        record = this.gridFilterData;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
    this.isloading = false;
  }

  OpenHelpPage() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    this.commonMethodService.openPopup(
      SupportPopupComponent,
      this.modalOptions
    );
  }

  setGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "fullname":
        this.isCampaignFullNameColVisible = isVisible;
        break;
      case "fullnamejewish":
        this.isCampaignFullNameJewishColVisible = isVisible;
        break;
      case "paymenttype":
        this.isCampaignPaymentTypeColVisible = isVisible;
        break;
      case "campaign":
        this.isCampaignNameColVisible = isVisible;
        break;
      case "transactionno":
        this.isCampaignTransactionNoColVisible = isVisible;
        break;
      case "pledgedamount":
        this.isCampaignPledgedAmountColVisible = isVisible;
        break;
      case "scheduledamount":
        this.isCampaignScheduledAmountColVisible = isVisible;
        break;
      case "paidamount":
        this.isCampaignPaidAmountColVisible = isVisible;
        break;
      case "balance":
        this.isCampaignBalanceColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }

  public downloadExcel() {
    this.isloading = true;
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let FullName = item && item.fullName;
        let FullNameJewish = item && item.fullNameJewish;
        let PaymentType = item && item.paymentType;
        let Campaign = item && item.campaignName;
        let TransactionNo = item && item.transNum;
        let PledgedAmount = item && item.pledgedAmount;
        let ScheduledAmount = item && item.scheduledAmount;
        let PaidAmount = item && item.paidAmount;
        let Balance = item && item.balance;

        let row = {};
        if (this.isCampaignFullNameColVisible) {
          row["Full Name"] = FullName;
        }
        if (this.isCampaignFullNameJewishColVisible) {
          row["Full Name Jewish"] = FullNameJewish;
        }
        if (this.isCampaignPaymentTypeColVisible) {
          row["Payment Type"] = PaymentType;
        }
        if (this.isCampaignNameColVisible) {
          row["Campaign"] = Campaign;
        }

        if (this.isCampaignTransactionNoColVisible) {
          row["Transaction #"] = TransactionNo;
        }
        if (this.isCampaignPledgedAmountColVisible) {
          row["Pledged Amount"] =
            item.pledgedAmount == null ? 0 : item.pledgedAmount;
        }
        if (this.isCampaignScheduledAmountColVisible) {
          row["Scheduled Amount"] =
            item.scheduledAmount == null ? 0 : item.scheduledAmount;
        }
        if (this.isCampaignPaidAmountColVisible) {
          row["Paid Amount"] = PaidAmount;
        }
        if (this.isCampaignBalanceColVisible) {
          row["Balance"] = Balance;
        }

        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Transaction Campaign List");
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const excelData: Blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(excelData, filename);
    this.isloading = false;
  }
}
