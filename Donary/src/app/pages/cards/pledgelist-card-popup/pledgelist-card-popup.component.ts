import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CardService } from "src/app/services/card.service";
import { CollectorService } from "src/app/services/collector.service";
import { PledgeService } from "src/app/services/pledge.service";
import Swal from "sweetalert2";
import { TransactionAdvancedFilterPopupComponent } from "../../transaction/transaction-advanced-filter-popup/transaction-advanced-filter-popup.component";
import { DonorCardPopupComponent } from "../donor-card-popup/donor-card-popup.component";
import { PledgeCardPopupComponent } from "../pledge-card-popup/pledge-card-popup.component";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";
declare var $: any;
@Component({
  selector: "app-pledgelist-card-popup",
  templateUrl: "./pledgelist-card-popup.component.html",
  styleUrls: ["./pledgelist-card-popup.component.scss"],
  standalone: false,
})
export class PledgelistCardPopupComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  // selectedDateRange: any = { startDate: null, endDate: null };
  @Input("selectedDateRange") selectedDateRange?: any;
  objAdvancedSearch: any = {
    pledgeStatus: [
      { id: 1, itemName: "Open" },
      { id: 2, itemName: "Partially Paid" },
      { id: 5, itemName: "Running" },
    ],
  };
  filtercount: number = 1;
  gridData: Array<any>;
  window_class = "drag_popup donor_card father_card";
  accountId: number;
  reasonId: any;
  collectorId: any;
  campaignId: any;
  locationId: any;
  deviceId: any;
  popTitle: any;
  skeletonitems = [{}, {}, {}, {}];
  skeletonitems2 = [{}, {}, {}, {}, {}, {}, {}, {}];
  gridFilterData: Array<any>;

  isinitialize: number = 0;
  page = 1;
  pageSize = 5;
  showArrow = false;
  PageName: any = "PledgeListCard";
  isOneDate: any = false;
  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;
  private calendarSubscription: Subscription;

  constructor(
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    public commonService: CommonMethodService,
    private notificationService: NotificationService,
    public collectorService: CollectorService,
    private pledgeService: PledgeService,
    public activeModal: NgbActiveModal,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  @Output() emtOutputPledgeListCardData: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputPledgeCloseCard: EventEmitter<any> = new EventEmitter();
  @Input() set PledgeCardListData(PledgeListCardValue: any) {
    if (PledgeListCardValue) {
      this.setValue(PledgeListCardValue);
    }
    this.isloading = false;
  }

  @Input() set AccountId(accountId: number) {
    this.accountId = accountId;
    this.colFields = this.colFields.filter((o) => o.sortName !== "nameId");
  }
  @Input() set ReasonId(reasonId: any) {
    if (reasonId) {
      this.reasonId = reasonId;
      this.colFields = this.colFields.filter((o) => o.sortName !== "reasonId");
    }
  }
  @Input() set CollectorId(collectorId: any) {
    if (collectorId) {
      this.collectorId = collectorId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "collectorId"
      );
    }
  }

  @Input() set CampaignId(campaignId: any) {
    if (campaignId) {
      this.campaignId = campaignId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "campaignId"
      );
    }
  }

  @Input() set LocationId(locationId: any) {
    if (locationId) {
      this.locationId = locationId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "locationId"
      );
    }
  }

  @Input() set DeviceId(deviceId: any) {
    if (deviceId) {
      this.deviceId = deviceId;
      this.colFields = this.colFields.filter((o) => o.sortName !== "deviceId");
    }
  }

  isPledgeIdColVisible: boolean = true;
  isPledgeDateColVisible: boolean = true;
  isPledgeAmountColVisible: boolean = true;
  isPledgePaidColVisible: boolean = true;
  isPledgeBalanceColVisible: boolean = true;
  isPledgeStatusColVisible: boolean = true;

  // other fields
  isPledgeNameColVisible: boolean = true; //changes
  isPledgeReasonNameColVisible: boolean = true; //changes
  isPledgeCampaignColVisible: boolean = true; //changes
  isPledgeLocationNameColVisible: boolean = false;
  isPledgeCollectorColVisible: boolean = false;
  isPledgeSourceColVisible: boolean = false;

  isloading: boolean;
  modalOptions: NgbModalOptions;

  // Date-range picker related properties
  open: string = "left";
  drop: string = "down";
  showClearButton: boolean = true;
  alwaysShowCalendars: boolean = true;
  placeholder: string = "All time";
  showCustomRangeLabel: boolean = true;
  linkedCalendars: boolean = true;

  colFields: any = [
    {
      colName: "NAME",
      visibleCondition: this.isPledgeNameColVisible,
      sortName: "nameId",
    },
    {
      colName: "CAMPAIGN",
      visibleCondition: this.isPledgeCampaignColVisible,
      sortName: "campaignId",
    },
    {
      colName: "REASON",
      visibleCondition: this.isPledgeReasonNameColVisible,
      sortName: "reasonId",
    },
    {
      colName: "PLEDGE#",
      visibleCondition: this.isPledgeIdColVisible,
      sortName: "pledgeNum",
    },
    {
      colName: "DATE",
      visibleCondition: this.isPledgeDateColVisible,
      sortName: "pledgeDate",
    },
    {
      colName: "AMOUNT",
      visibleCondition: this.isPledgeAmountColVisible,
      sortName: "amount",
    },
    {
      colName: "PAID",
      visibleCondition: this.isPledgePaidColVisible,
      sortName: "paidAmount",
    },
    {
      colName: "BALANCE",
      visibleCondition: this.isPledgeBalanceColVisible,
      sortName: "balance",
    },
    {
      colName: "STATUS",
      visibleCondition: this.isPledgeStatusColVisible,
      sortName: "status",
    },

    {
      colName: "LOCATION",
      visibleCondition: this.isPledgeLocationNameColVisible,
      sortName: "locationId",
    },
    {
      colName: "COLLECTOR",
      visibleCondition: this.isPledgeCollectorColVisible,
      sortName: "collectorId",
    },
    {
      colName: "SOURCE",
      visibleCondition: this.isPledgeSourceColVisible,
      sortName: "deviceId",
    },
  ];

  setValue(PledgeCardValue: any) {
    if (PledgeCardValue) {
      PledgeCardValue.forEach((s) => {
        if (s.status == "Paid") {
          s.status_class = "pledge_paid";
        } else if (s.status == "Open") {
          s.status_class = "pledge_open";
        } else if (s.status == "Partially Paid") {
          s.status_class = "pledge_partial";
        } else if (s.status == "Void") {
          s.status_class = "pledge_void";
        } else if (s.status == "Running") {
          s.status_class = "pledge_running";
        }
      });
    }
    this.gridData = PledgeCardValue;
    this.gridFilterData = this.gridData.filter(
      (x) =>
        x.status == "Open" ||
        x.status == "Partially Paid" ||
        x.status == "Running"
    );
    this.showArrow = this.gridFilterData.length <= 5 ? false : true;
    this.isloading = false;
  }

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        start: (event, ui) => {
          // Find the parent modal element
          let parentModal = ui.helper.closest(".modal");
          // Remove 'modal-position' and add 'modal-position-drag'
          parentModal
            .removeClass("modal-position")
            .addClass("modal-position-drag");
        },
        handle: ".modal__custom_header",
      });
    });
    this.isloading = true;
    this.gridData = null;
  }

  setGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "pledge#":
        this.isPledgeIdColVisible = isVisible;
        break;
      case "date":
        this.isPledgeDateColVisible = isVisible;
        break;
      case "paid":
        this.isPledgePaidColVisible = isVisible;
        break;
      case "amount":
        this.isPledgeAmountColVisible = isVisible;
        break;
      case "balance":
        this.isPledgeBalanceColVisible = isVisible;
        break;
      case "status":
        this.isPledgeStatusColVisible = isVisible;
        break;
      case "name":
        this.isPledgeNameColVisible = isVisible;
        break;
      case "reason":
        this.isPledgeReasonNameColVisible = isVisible;
        break;
      case "campaign":
        this.isPledgeCampaignColVisible = isVisible;
        break;
      case "location":
        this.isPledgeLocationNameColVisible = isVisible;
        break;
      case "collector":
        this.isPledgeCollectorColVisible = isVisible;
        break;
      case "source":
        this.isPledgeSourceColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }
  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "pledge#":
        return this.isPledgeIdColVisible;
      case "date":
        return this.isPledgeDateColVisible;
      case "paid":
        return this.isPledgePaidColVisible;
      case "amount":
        return this.isPledgeAmountColVisible;
      case "balance":
        return this.isPledgeBalanceColVisible;
      case "status":
        return this.isPledgeStatusColVisible;
      case "name":
        return this.isPledgeNameColVisible;
      case "reason":
        return this.isPledgeReasonNameColVisible;
      case "campaign":
        return this.isPledgeCampaignColVisible;
      case "location":
        return this.isPledgeLocationNameColVisible;
      case "collector":
        return this.isPledgeCollectorColVisible;
      case "source":
        return this.isPledgeSourceColVisible;
    }
  }

  dropFields(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
  }

  dropColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
  }

  ChangePageSize(val, className) {
    $("#page_id5").removeClass("active");
    $("#page_id10").removeClass("active");
    $("#page_id15").removeClass("active");
    this.pageSize = val;
    $("#" + className).addClass("active");

    if (this.gridFilterData.length / this.pageSize <= 1) {
      this.showArrow = false;
    } else {
      this.showArrow = true;
    }
  }

  search(keyword) {
    this.isloading = true;
    var record = this.gridData;
    var filterdRecord;
    keyword = keyword.toLowerCase();
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.pledgeNum &&
              obj.pledgeNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.amount &&
              obj.amount.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.paidAmount &&
              obj.paidAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.status &&
              obj.status.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.balance &&
              obj.balance.toString().toLowerCase().indexOf(searchValue) > -1)
        );
        this.gridFilterData = filterdRecord;
        record = this.gridFilterData;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
    this.showArrow = this.gridFilterData.length <= 5 ? false : true;
    this.isloading = false;
  }

  closePopup() {
    this.activeModal.dismiss();
    this.emtOutputPledgeCloseCard.emit(true);
  }

  openAdvanceSearchFilterPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "advance_search payment-list-donar",
    };
    const modalRef = this.commonService.openPopup(
      TransactionAdvancedFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isPledgeTab = true;
    modalRef.componentInstance.isListPage = true;
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;

    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;

        this.filtercount = 0;
        for (let key of Object.keys(this.objAdvancedSearch)) {
          let filtervalue = this.objAdvancedSearch[key];
          if (
            filtervalue == undefined ||
            filtervalue.length == 0 ||
            !filtervalue
          ) {
          } else {
            if (key == "isBatchClicked" || key == "batchNum") {
              if (
                (key == "isBatchClicked" && filtervalue) ||
                (key == "batchNum" && filtervalue)
              ) {
                this.filtercount += 1;
              }
            } else {
              this.filtercount += 1;
            }
          }
        }

        this.filterLocalData();
      }
    );
  }

  filterLocalData(data = this.gridData) {
    this.gridFilterData = data.filter((o) => {
      if (!this.objAdvancedSearch) {
        return true;
      }
      return this.inAllFields(o);
    });
  }

  inAllFields(o) {
    return this.inArray(this.objAdvancedSearch.pledgeStatus, o.status);
  }
  inArray(filterKeyArray: Array<{ itemName: any }> | null, rowFieldValue: any) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }
    const result = filterKeyArray.find((d) => d.itemName == rowFieldValue);
    if (result) {
      return true;
    }
    return false;
  }

  openPledgeCardPopup(pledgeId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup pledgeCard",
    };
    const modalRef = this.commonService.openPopup(
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

  searchPledgeListData() {
    this.isloading = true;
    var objDonorCard = {};
    if (this.collectorId != undefined) {
      objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        collectorId: this.collectorId,
        fromDate:
          this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        toDate:
          this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.collectorService
        .getCollectorPaymentList(objDonorCard)
        .subscribe((res: any) => {
          if (res) {
            this.setValue(res);
          } else {
            this.gridData = null;
            this.gridFilterData = null;
          }
          this.isloading = false;
        });
    } else if (this.campaignId != undefined) {
      objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        CampaignIds: [this.campaignId],
        fromDate:
          this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        toDate:
          this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.cardService.getPledgeCardList(objDonorCard).subscribe((res: any) => {
        if (res) {
          this.setValue(res);
        } else {
          this.gridData = null;
          this.gridFilterData = null;
        }
        this.isloading = false;
      });
    } else if (this.locationId != undefined) {
      objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        Locations: [this.locationId],
        fromDate:
          this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        toDate:
          this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.cardService.getPledgeCardList(objDonorCard).subscribe((res: any) => {
        if (res) {
          this.setValue(res);
        } else {
          this.gridData = null;
          this.gridFilterData = null;
        }
        this.isloading = false;
      });
    } else if (this.deviceId != undefined) {
      objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        DeviceIds: [this.deviceId],
        fromDate:
          this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        toDate:
          this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
      this.cardService.getPledgeCardList(objDonorCard).subscribe((res: any) => {
        if (res) {
          this.setValue(res);
        } else {
          this.gridData = null;
          this.gridFilterData = null;
        }
        this.isloading = false;
      });
    } else {
      if (this.reasonId == undefined) {
        objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          accountId: this.accountId,
          fromDate:
            this.selectedDateRange.startDate != null
              ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
              : null,
          toDate:
            this.selectedDateRange.endDate != null
              ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
              : null,
        };
      } else {
        objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          ReasonIds: [this.reasonId],
          fromDate:
            this.selectedDateRange.startDate != null
              ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
              : null,
          toDate:
            this.selectedDateRange.endDate != null
              ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
              : null,
        };
      }

      this.cardService.getPledgeCardList(objDonorCard).subscribe((res: any) => {
        if (res) {
          this.setValue(res);
        } else {
          this.gridData = null;
          this.gridFilterData = null;
        }
        this.isloading = false;
      });
    }
  }
  ChangeShowEntriesDwn() {
    $(".dropwond-page").toggleClass("no-open");
    $(".btn-show-entries").toggleClass("active");
  }
  OpenDonorCard(accountID) {
    this.isloading = true;
    this.window_class =
      "drag_popup donor_card father_card" +
      "_" +
      this.commonService.initialDonorCard;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: this.window_class,
    };
    this.commonService.initialDonorCard += 1;

    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,
    };
    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      if (res) {
        const modalRef = this.commonService.openPopup(
          DonorCardPopupComponent,
          this.modalOptions
        );
        modalRef.componentInstance.AccountId = accountID;
        this.isloading = false;
        modalRef.componentInstance.DonorCardData = res;
      } else {
        Swal.fire({
          title: "No data found",
          text: "",
          icon: "error",
          confirmButtonText: this.commonService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });
  }
  checkLenDonorName(donorJewish, donorName) {
    if (donorJewish) {
      return donorJewish.length > 10 ? true : false;
    } else if (donorName) {
      return donorName.length > 10 ? true : false;
    }
  }

  openHebrewCalendarPopup() {
    this.commonService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "pledgeListDynamicsCalender"
    );
    this.calendarSubscription = this.commonService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "PledgeListCard" &&
          this.commonService.isCalendarClicked == true
        ) {
          this.commonService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.searchPledgeListData();
        }
      });
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    }
  }
}
