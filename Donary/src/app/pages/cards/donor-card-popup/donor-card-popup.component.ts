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
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CardService } from "src/app/services/card.service";
import { DonorService } from "src/app/services/donor.service";
import { ScheduleService } from "src/app/services/schedule.service";
import { TagObj, TagService } from "src/app/services/tag.service";
import Swal from "sweetalert2";
import { DonorFilterPopupComponent } from "../../donor/donor-filter-popup/donor-filter-popup.component";
import { DonorSaveComponent } from "../../donor/donor-save/donor-save.component";
import { ReminderPopupComponent } from "../../notifications/reminder-popup/reminder-popup.component";
import { PdfviewerPopupComponent } from "../payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { PaymentlistCardPopupComponent } from "../paymentlist-card-popup/paymentlist-card-popup.component";
import { PledgelistCardPopupComponent } from "../pledgelist-card-popup/pledgelist-card-popup.component";
import { SchedulelistCardPopupComponent } from "../schedulelist-card-popup/schedulelist-card-popup.component";
import { AddTransactionPopupComponent } from "./../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { PaymentCardPopupComponent } from "./../payment-card-popup/payment-card-popup.component";
import { ExportStatementPopupComponent } from "./export-statement-popup/export-statement-popup.component";
import { SavecardPopupComponent } from "./savecard-popup/savecard-popup.component";
import { PledgeCardPopupComponent } from "../pledge-card-popup/pledge-card-popup.component";
import { PledgeService } from "src/app/services/pledge.service";
import { NotificationSidebarPopupComponent } from "../../notifications/notification-sidebar-popup/notification-sidebar-popup.component";
import { NotificationService as notification } from "src/app/services/notification.service";
import { LocationCardPopupComponent } from "../location-card-popup/location-card-popup.component";
import { LocationService } from "src/app/services/location.sevice";
import { FamilyService } from "src/app/services/family.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { environment } from "./../../../../environments/environment";
import { Subscription } from "rxjs";

export enum Relationship {
  Father = "אב",
  FatherInLaw = "חמיו",
  Son = "בנו",
  SonInLaw = "חתנו",
}

declare var $: any;
@Component({
  selector: "app-donor-card-popup",
  templateUrl: "./donor-card-popup.component.html",
  styleUrls: ["./donor-card-popup.component.scss"],
  standalone: false,
})
export class DonorCardPopupComponent implements OnInit {
  @Input() AccountId: any;
  @Output() emtOutputSendMail: EventEmitter<any> = new EventEmitter();
  @Output() emtEditDonorUpdated: EventEmitter<boolean> = new EventEmitter();
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @Input("selectedDateRange") selectedDateRange?: any;

  @Input() navTabId: number = 0;
  private calendarSubscription: Subscription;
  paymentDetails: any;
  @Input() set DonorCardData(DonorCardValue: any) {
    if (DonorCardValue) {
      this.paymentDetails = DonorCardValue;
      this.accountId = DonorCardValue.accountId;
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "donorcard",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.donorCardFilteritem) {
            this.objAdvancedSearch = this.uiPageSetting.donorCardFilteritem;
            if (
              !this.uiPageSetting.donorCardStartDate &&
              !this.uiPageSetting.donorCardEndDate
            ) {
              this.selectedDateRange = undefined;
            } else {
              this.selectedDateRange = {
                startDate: moment(this.uiPageSetting.donorCardStartDate),
                endDate: moment(this.uiPageSetting.donorCardEndDate),
              };
            }
            this.searchDonorCardData();
          }
        } else {
          this.LoadDonorCard(DonorCardValue);
          this.getFamilyData();
        }
      });
    }
  }

  @Input() set selectDateRange(date: any) {
    if (date) {
      this.startDate = date.startDate;
      this.endDate = date.endDate;
      this.selectedDateRange.startDate = date.startDate;
      this.selectedDateRange.endDate = date.endDate;
    }
  }

  @Input() set objAdvanceSearch(advanceSearch: any) {
    if (advanceSearch) {
      this.objAdvancedSearch = advanceSearch;
      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true
        ) {
        } else {
          this.filtercount += 1;
        }
      }
    }
  }
  popTitle: any;
  modalOptions: NgbModalOptions;
  objDonorSave: any;
  isDevEnv: boolean;
  accountId: Int32Array;
  globalId: number;
  fatherId: number;
  fatherInLawId: number;
  fullName: string;
  lstEmail: [];
  lstAddress: [];
  lstPhoneNumber: [];
  advancedFieldValues: any[] = [];
  donorTagList: Array<TagObj> = [];
  families = [];
  runningCount: number = 0;
  fullNameJewish: string;
  PageName: any = "DonorCard";
  isOneDate: any = false;
  address: string;
  cityStateZip: string;
  group: string;
  class: string;
  totalPayments: string;
  totalPledges: string;
  totalSchedules: string;
  totalRaised: number = 0;
  changelog: string;
  mostRecentPayment: string;
  mostRecentPaymentDate: string;
  mostRecentPledge: string;
  mostRecentPledgeDate: string;
  upcomingScheduleDate: string;
  fatherName: string;
  fatherInLawName: string;
  phoneList: [];
  isloading: boolean = true;
  skeletonitems: any = [{}, {}, {}, {}];
  locationDetails: any;
  accountWalletDetails: any;
  startDate: any = null;
  endDate: any = null;
  defaultLocation: string;
  totalLocationsCount: number;
  fatherNameJewish: string;
  exportPhoneList = [];
  exportEmailList = [];
  exportAddressList = [];
  objAdvancedSearch: any;
  window_class = "drag_popup donor_card father_card";
  initial = 0;
  //navTabId = 0;
  makeTransactionPermission: boolean = false;
  status_class: string;
  reminderStatus: string;
  fatherInLawNameJewish: string;
  locationGridData: Array<any>;

  isinitialize: number = 0;
  filtercount: number = 0;
  isDonorActive: boolean;
  lstDonorReceiptLog: Array<any>;
  lstRelatedNotifications: Array<any>;
  isNotificationSidebar: boolean = true;
  familyMember = [];
  familyMember1 = [];
  resValue: any;
  uiPageSettingId = null;
  uiPageSetting: any;
  allowPaymentListCard: boolean = true;
  allowPledgeListCard: boolean = true;
  allowScheduleListCard: boolean = true;
  englishToHebrewMap: Record<string, Relationship> = {
    Father: Relationship.Father,
    FatherInLaw: Relationship.FatherInLaw,
    Son: Relationship.Son,
    SonInLaw: Relationship.SonInLaw,
  };
  isWalletDisable: boolean = false;

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;

  constructor(
    public activeModal: NgbActiveModal,
    public ngbModal: NgbModal,
    public commonMethodService: CommonMethodService,
    private donorService: DonorService,
    private notificationService: NotificationService,
    private cardService: CardService,
    private scheduleService: ScheduleService,
    private localstoragedataService: LocalstoragedataService,
    public tagService: TagService,
    private pledgeService: PledgeService,
    private notification: notification,
    private locationService: LocationService,
    private familyService: FamilyService,
    private uiPageSettingService: UIPageSettingService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  @Output() emtOutputDonorCardData: EventEmitter<any> = new EventEmitter();

  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
  }

  setValue(DonorCardDataValue: any) {
    if (DonorCardDataValue.lstPhoneNumber) {
      let phoneNumberList = [];
      for (var i = 0; i < DonorCardDataValue.lstPhoneNumber.length; i++) {
        var phoneLbl = DonorCardDataValue.lstPhoneNumber[i].split(":");
        var formattedphone = this.formatPhoneNumber(phoneLbl[1]);
        phoneNumberList.push({ number: formattedphone, type: phoneLbl[0] });
        this.exportPhoneList.push({ label: phoneLbl[0], value: phoneLbl[1] });
      }
      DonorCardDataValue.phoneNumberList = phoneNumberList;
    }
    if (DonorCardDataValue.lstEmail) {
      let emaillist = [];
      for (var i = 0; i < DonorCardDataValue.lstEmail.length; i++) {
        var emailLbl = DonorCardDataValue.lstEmail[i].split(":");
        emaillist.push({
          email: emailLbl[1],
          type: emailLbl[0] != null ? emailLbl[0].toUpperCase() : null,
        });
        this.exportEmailList.push({ label: emailLbl[0], value: emailLbl[1] });
      }
      DonorCardDataValue.emaillist = emaillist;
    }

    if (DonorCardDataValue.lstAddress) {
      let addresslit = [];
      for (var i = 0; i < DonorCardDataValue.lstAddress.length; i++) {
        DonorCardDataValue.lstAddress[i].addressLabel =
          DonorCardDataValue.lstAddress[i].addressLabel != null
            ? DonorCardDataValue.lstAddress[i].addressLabel.toUpperCase()
            : null;
        addresslit.push(DonorCardDataValue.lstAddress[i]);
        this.exportAddressList.push(DonorCardDataValue.lstAddress[i]);
      }
      DonorCardDataValue.addresslit = addresslit;
    }
    for (var i = 0; i < DonorCardDataValue.phoneNumberList.length; i++) {
      DonorCardDataValue.phoneNumberList[i].type =
        DonorCardDataValue.phoneNumberList[i].type != null
          ? DonorCardDataValue.phoneNumberList[i].type.toUpperCase()
          : null;
    }
    this.phoneList = DonorCardDataValue.phoneNumberList;
    if (DonorCardDataValue.fullName == "") {
      this.fullName =
        DonorCardDataValue.title +
        " " +
        DonorCardDataValue.firstName +
        " " +
        DonorCardDataValue.lastName;
    } else {
      this.fullName = DonorCardDataValue.fullName;
    }
    if (DonorCardDataValue.fullNameJewish == "") {
      this.fullNameJewish =
        DonorCardDataValue.titleJewish +
        " " +
        DonorCardDataValue.firstNameJewish +
        " " +
        DonorCardDataValue.lastNameJewish;
    } else {
      this.fullNameJewish = DonorCardDataValue.fullNameJewish;
    }
    this.address = DonorCardDataValue.address;
    this.cityStateZip = DonorCardDataValue.cityStateZip;
    this.group = DonorCardDataValue.group;
    this.class = DonorCardDataValue.class;
    this.totalPayments = DonorCardDataValue.totalPayments;
    this.totalPledges = DonorCardDataValue.totalPledges;
    this.totalSchedules = DonorCardDataValue.totalSchedules;
    this.mostRecentPayment = DonorCardDataValue.mostRecentPayment;
    this.mostRecentPaymentDate = DonorCardDataValue.mostRecentPaymentDate;
    this.mostRecentPledge = DonorCardDataValue.mostRecentPledge;
    this.mostRecentPledgeDate = DonorCardDataValue.mostRecentPledgeDate;
    this.upcomingScheduleDate = DonorCardDataValue.upcomingScheduleDate;
    this.lstPhoneNumber = DonorCardDataValue.lstPhoneNumber;
    this.lstEmail = DonorCardDataValue.emaillist;
    this.lstAddress = DonorCardDataValue.lstAddress;
    this.accountId = DonorCardDataValue.accountId;
    this.fatherInLawId = DonorCardDataValue.fatherInLawId;
    this.fatherId = DonorCardDataValue.fatherId;
    this.fatherName = DonorCardDataValue.fatherName;
    this.fatherInLawName = DonorCardDataValue.fatherInLawName;
    this.accountWalletDetails = DonorCardDataValue.lstAccountWalletDetails;
    this.locationDetails = DonorCardDataValue.lstLocation;
    this.defaultLocation = DonorCardDataValue.defaultLocation;
    this.totalLocationsCount = DonorCardDataValue.totalLocationsCount;
    this.fatherNameJewish = DonorCardDataValue.fatherNameJewish;
    this.fatherInLawNameJewish = DonorCardDataValue.fatherInLawNameJewish;
    this.locationGridData = DonorCardDataValue.lstLocation;
    this.totalRaised =
      Number(DonorCardDataValue.totalPayments) +
      Number(DonorCardDataValue.totalPledges) +
      Number(DonorCardDataValue.totalSchedules);
    this.changelog = DonorCardDataValue.changeLog;
    this.globalId = DonorCardDataValue.globalId;
    this.advancedFieldValues = DonorCardDataValue.advancedFields;
    this.isDonorActive = DonorCardDataValue.active;
    this.lstDonorReceiptLog = DonorCardDataValue.lstDonorReceiptLog;
    this.lstRelatedNotifications =
      DonorCardDataValue.lstRelatedNotifications || [];

    this.donorTagList = DonorCardDataValue.tags;
    this.families = this.setFamily(DonorCardDataValue.families) || [];
    this.runningCount = DonorCardDataValue.runningCount;
    if (this.advancedFieldValues) {
      this.advancedFieldValues.forEach((element) => {
        if (
          element.advancedField.type == "dropdown" &&
          element.advancedField.options != null &&
          element.advancedField.options.indexOf(",") > -1
        ) {
          element.advancedField.options =
            element.advancedField.options.split(",");
        } else {
          element.advancedField.options = [element.advancedField.options];
        }
      });
    }

    this.isloading = false;
  }

  LoadDonorCard(DonorCardValue: any) {
    this.setValue(DonorCardValue);
  }

  getHebrewWord(englishName: string): string | null {
    return this.englishToHebrewMap[englishName] || null;
  }

  setFamily(res: Array<any>) {
    if (res) {
      let familyMember = [];
      let fatherMember = [];
      let fatherInLawMember = [];
      let memberLength = 0;
      this.familyMember = [];

      res.forEach((element) => {
        if (element.familyType == "Own") {
          element.familyMembers &&
            element.familyMembers.forEach((el) => {
              familyMember.push(el);
            });
        }
        if (element.familyType == "Father") {
          element.familyMembers &&
            element.familyMembers.forEach((el) => {
              fatherMember.push(el);
            });
        }
        if (element.familyType == "FatherInLaw") {
          element.familyMembers &&
            element.familyMembers.forEach((el) => {
              fatherInLawMember.push(el);
            });
        }
      });

      if (familyMember.length > memberLength) {
        memberLength = familyMember.length;
      }
      if (fatherMember.length > memberLength) {
        memberLength = fatherMember.length;
      }
      if (fatherInLawMember.length > memberLength) {
        memberLength = fatherInLawMember.length;
      }

      for (let i = 0; i < memberLength; i++) {
        this.familyMember.push({
          family: familyMember[i] != undefined ? familyMember[i] : null,
          father: fatherMember[i] != undefined ? fatherMember[i] : null,
          fatherInLaw:
            fatherInLawMember[i] != undefined ? fatherInLawMember[i] : null,
        });
      }
      return this.familyMember;
    }
    return [];
  }
  // family data functionality code started

  canEditDonor(): boolean {
    if (!this.globalId) {
      return true;
    }

    if (this.globalId === 688008) {
      return false;
    }

    return true;
  }

  ngOnInit() {
    this.ngbModal.activeInstances.subscribe((i) => {
      if (i.length !== 0) {
        const havePaymentCard = i.filter((o) => {
          return o.componentInstance instanceof PaymentlistCardPopupComponent;
        });
        const havePledgeCard = i.filter((o) => {
          return o.componentInstance instanceof PledgelistCardPopupComponent;
        });
        const haveScheduleCard = i.filter((o) => {
          return o.componentInstance instanceof SchedulelistCardPopupComponent;
        });

        if (havePaymentCard.length !== 0) {
          this.allowPaymentListCard = false;
        } else {
          this.allowPaymentListCard = true;
        }
        if (havePledgeCard.length !== 0) {
          this.allowPledgeListCard = false;
        } else {
          this.allowPledgeListCard = true;
        }
        if (haveScheduleCard.length !== 0) {
          this.allowScheduleListCard = false;
        } else {
          this.allowScheduleListCard = true;
        }
      }
    });
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".cards_secton,.top_row,.modal__custom_header,.tab_draggable",
        cursor: "grab",
        cancel: ".name_colm,.sub_tab_wrap",
      });
    });
    this.makeTransactionPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Transaction")
      .map((x) => x.isActive)[0];
    //this.isloading = true;
    this.commonMethodService.getUpdateDonorCard().subscribe((res: boolean) => {
      if (res) {
        var objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          accountId: this.accountId,
        };
        this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
          // hide loader
          this.isloading = true;
          this.LoadDonorCard(res);
        });
      }
    });

    //this.DonorCardData
  }

  getCopyText(): string {
    if (this.fullName && this.fullNameJewish)
      return `${this.fullName.toString()} ${this.fullNameJewish.toString()}`;
    if (this.fullName && !this.fullNameJewish)
      return `${this.fullName.toString()}`;
    if (!this.fullName && this.fullNameJewish)
      return `${this.fullNameJewish.toString()}`;
    return "";
  }

  CopyText(event) {
    event.preventDefault();
    let payload = this.getCopyText();
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", payload);
      e.preventDefault();
    };

    document.addEventListener("copy", listener, false);
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
  }

  contains_hebrew(str) {
    var hebrewstr = /[\u0590-\u05FF]/.test(str);
    if (hebrewstr) {
      return "hebrew_lng";
    } else {
      return "";
    }
  }

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "donor_filter modal_responsive ",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = true;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.searchDonorCardData();
      }
    );
  }

  SaveLayout() {
    let setting = {
      donorCardFilteritem: this.objAdvancedSearch,
      donorCardStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      donorCardEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "donorcard",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSetting = res.uiPageSetting;
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
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

  OpenDonorCard(accountID) {
    if (accountID) {
      this.window_class =
        "drag_popup donor_card father_card" +
        "_" +
        this.commonMethodService.initialDonorCard;
      this.isloading = false;

      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: this.window_class,
      };
      this.commonMethodService.initialDonorCard += 1;

      var objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: accountID,
      };
      this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
        if (res) {
          const modalRef = this.commonMethodService.openPopup(
            DonorCardPopupComponent,
            this.modalOptions
          );
          this.isloading = false;
          modalRef.componentInstance.DonorCardData = res;
          modalRef.componentInstance.navTabId =
            this.commonMethodService.initialDonorCard;
        } else {
          Swal.fire({
            title: "No data found",
            text: "",
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

  makeTransactionPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddTransactionPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.donorDetails = {
      jewishname: this.fullNameJewish,
      fullname: this.fullName,
      accountId: this.accountId,
      globalId: this.globalId,
      paymentDetails: this.paymentDetails,
      type: "DonorCard",
    };
  }

  closePopup() {
    this.activeModal.dismiss();
    if (this.commonMethodService.initialDonorCard > 0) {
      this.commonMethodService.initialDonorCard -= 1;
    }
    this.emtOutputSendMail.emit(this.resValue);
  }

  datesUpdated(event) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.startDate;
    this.endDate = this.selectedDateRange.endDate;
    if (
      this.isinitialize == 1 &&
      (event.startDate != null || event.endDate != null)
    ) {
      this.searchDonorCardData();
      if (event.startDate == null && event.endDate == null) {
        this.selectedDateRange = undefined;
      }
    }

    this.isinitialize = 1;
  }

  searchDonorCardData() {
    this.isloading = true;
    if (this.objAdvancedSearch) {
      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true
        ) {
        } else {
          this.filtercount += 1;
        }
      }
    }
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: this.accountId,
      fromDate:
        this.selectedDateRange && this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange && this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      listFilters: {
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
            : null,
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
        tags:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.tags &&
          this.objAdvancedSearch.tags.length > 0
            ? this.objAdvancedSearch.tags.map((s) => s.tagName)
            : null,
      },
    };
    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      if (res) {
        this.setValue(res);
      }
    });
  }

  EditWallet(type, walletId) {
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_wallet",
    };

    if (type == "add") {
      const modalRef = this.commonMethodService.openPopup(
        SavecardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.Type = type;
      modalRef.componentInstance.AccountId = this.accountId;
      modalRef.componentInstance.emtSaveWallet.subscribe((res) => {
        if (res) {
          var objDonorCard = {
            eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            accountId: this.accountId,
          };
          this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
            // hide loader
            this.isloading = true;
            this.LoadDonorCard(res);
          });
        }
      });
    } else {
      this.isWalletDisable = true;
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.donorService
        .getWalletById(eventGuId, walletId)
        .subscribe((res: any) => {
          if (res) {
            const modalRef = this.commonMethodService.openPopup(
              SavecardPopupComponent,
              this.modalOptions
            );
            this.isloading = false;
            modalRef.componentInstance.WalletData = res;
            modalRef.componentInstance.Type = type;
            modalRef.componentInstance.emtSaveWallet.subscribe((res) => {
              if (res) {
                var objDonorCard = {
                  eventGuId:
                    this.localstoragedataService.getLoginUserEventGuId(),
                  accountId: this.accountId,
                };
                this.cardService
                  .getDonorCard(objDonorCard)
                  .subscribe((res: any) => {
                    // hide loader
                    this.isWalletDisable = false;
                    this.isloading = true;
                    this.LoadDonorCard(res);
                  });
              }
            });

            modalRef.dismissed.subscribe(() => (this.isWalletDisable = false));
          } else {
            Swal.fire({
              title: "No data found",
              text: "",
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

  openPaymentListCardPopup(accountID) {
    document.body.classList.add("modal-open");
    if (!this.allowPaymentListCard) return;

    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup reason_payment payment_list donor_payment modal-position",
      container: "#card-payment",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentlistCardPopupComponent,
      this.modalOptions
    );

    var objPaymentListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,
      DateFrom:
        this.startDate != null && this.selectedDateRange
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      DateTo:
        this.endDate != null && this.selectedDateRange
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
      deviceIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.sourceId &&
        this.objAdvancedSearch.sourceId.length > 0
          ? this.objAdvancedSearch.sourceId.map((s) => s.id)
          : null,
    };
    this.cardService
      .getPaymentCardList(objPaymentListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.PaymentCardListData = res;
        modalRef.componentInstance.AccountId = accountID;
      });
    modalRef.componentInstance.emtOutputPaymentCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.top_row,.modal__custom_header",
          cursor: "grab",
        });
      }
    });
    modalRef.result
      .then(() => {
        this.allowPaymentListCard = true;
      })
      .catch(() => {
        this.allowPaymentListCard = true;
      });
  }

  openScheduleListCardPopup(accountID) {
    document.body.classList.add("modal-open");
    if (!this.allowScheduleListCard) return;
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup schedule_list reason_schedule donor_schedule modal-position",
      container: "#card-shedule",
    };
    const modalRef = this.commonMethodService.openPopup(
      SchedulelistCardPopupComponent,
      this.modalOptions
    );
    var objScheduleListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,
      dateFrom:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      dateTo:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
      deviceIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.sourceId &&
        this.objAdvancedSearch.sourceId.length > 0
          ? this.objAdvancedSearch.sourceId.map((s) => s.id)
          : null,
    };
    this.scheduleService
      .getSchedulePaymentPledgeList(objScheduleListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedPaymentDateRange =
            this.selectedDateRange;
          modalRef.componentInstance.selectedPledgeDateRange =
            this.selectedDateRange;
        }
        modalRef.componentInstance.ScheduleCardListData = res;
        modalRef.componentInstance.AccountId = accountID;
      });
    modalRef.componentInstance.emtOutputScheduleCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.top_row,.modal__custom_header",
          cursor: "grab",
        });
      }
    });
    modalRef.result
      .then(() => {
        this.allowScheduleListCard = true;
      })
      .catch(() => {
        this.allowScheduleListCard = true;
      });
  }

  openPledgeListCardPopup(accountId) {
    document.body.classList.add("modal-open");
    if (!this.allowPledgeListCard) return;
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup pledge_list reason_pledge donor_pledge modal-position",
      container: "#card-pledge",
    };
    const modalRef = this.commonMethodService.openPopup(
      PledgelistCardPopupComponent,
      this.modalOptions
    );
    var objPledgeListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountId,
      fromDate:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
      deviceIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.sourceId &&
        this.objAdvancedSearch.sourceId.length > 0
          ? this.objAdvancedSearch.sourceId.map((s) => s.id)
          : null,
    };
    this.cardService
      .getPledgeCardList(objPledgeListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.PledgeCardListData = res;
        modalRef.componentInstance.AccountId = accountId;
      });
    modalRef.componentInstance.emtOutputPledgeCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.top_row,.modal__custom_header",
          cursor: "grab",
        });
      }
    });
    modalRef.result
      .then(() => {
        this.allowPledgeListCard = true;
      })
      .catch(() => {
        this.allowPledgeListCard = true;
      });
  }

  EditDonor(accountId) {
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup donor_popup edit_donor_transaction modal_responsive modal_edit",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveComponent,
      this.modalOptions
    );
    var accountID = this.AccountId ? this.AccountId : accountId;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorById(eventGuId, accountID)
      .subscribe((res: any) => {
        this.isloading = false;
        modalRef.componentInstance.Type = "edit";
        modalRef.componentInstance.EditDonorData = res;
      });
    modalRef.componentInstance.emtOutputEditDonor.subscribe((res: any) => {
      if (res) {
        this.isloading = true;

        var objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          accountId: accountId,
        };
        this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
          this.isloading = false;
          if (res) {
            this.resValue = res;
            // this.emtOutputDonorCardData.emit(true)
            this.LoadDonorCard(res);
          }
        });
        if (this.commonMethodService.isDonorListsPage) {
          this.commonMethodService.triggerTotalPanelUpdate(true);
        }
      }
    });
    modalRef.componentInstance.emtOutputDismissCard.subscribe((res: any) => {
      if (res) {
        this.activeModal.dismiss();
      }
    });
  }

  UpdateDonor() {
    this.isloading = true;
    var objSaveDonorData: any = {};
    objSaveDonorData = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      createdBy: this.localstoragedataService.getLoginUserId(),
      accountId: this.accountId,
      statusId: 1,
    };
    this.donorService.UpdateDonor(objSaveDonorData).subscribe((res) => {
      if (res) {
        Swal.fire({
          title: "Donor reactivated",
          html:
            "<p>" +
            this.fullName +
            "</p><p>" +
            this.fullNameJewish +
            '</p><span class="donor-card-active">Active</span>',
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
            container: "reactivate_popup",
          },
        }).then(() => {
          this.isloading = true;
          var objDonorCard = {
            eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            accountId: this.accountId,
          };
          this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
            // hide loader
            this.isloading = true;
            this.LoadDonorCard(res);
            var donarList = [res];
            this.commonMethodService.sendDonorSingle(donarList);
          });
        });
      }
    });
  }

  ExportStatement() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup export_statement",
    };
    const modalRef = this.commonMethodService.openPopup(
      ExportStatementPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.DonorInfo = {
      accountId: this.accountId,
      phoneNumberList: this.exportPhoneList,
      emailList: this.exportEmailList,
      address: this.address,
      cityStateZip: this.cityStateZip,
    };

    modalRef.componentInstance.emitAddressUpdated.subscribe((obj) => {
      this.address = obj.address;
      this.cityStateZip = obj.cityStateZip;
    });
  }

  class_fatherId;
  class_fatherInLawId;
  contains_heb_fatherId(str, fatherId) {
    if (fatherId) {
      this.class_fatherId = "";
    } else {
      this.class_fatherId = "class-not-fatherId";
    }
    return /[\u0590-\u05FF]/.test(str);
  }
  contains_heb_fatherInLawId(str, fatherInLawId) {
    if (fatherInLawId) {
      this.class_fatherInLawId = "";
    } else {
      this.class_fatherInLawId = "class-not-fatherId";
    }
    return /[\u0590-\u05FF]/.test(str);
  }
  OpenPdf(documentPath) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      PdfviewerPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Title = "Document Preview";
    modalRef.componentInstance.filePath = documentPath;
  }

  AddReminderPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reminder_card donar-r-card ",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReminderPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.donorDetails = {
      jewishname: this.fullNameJewish,
      fullname: this.fullName,
      accountId: this.accountId,
    };
    modalRef.componentInstance.emtOutputUpdateCard.subscribe(() => {
      this.isloading = true;
      let objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: this.accountId,
      };
      this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
        this.isloading = true;
        this.LoadDonorCard(res);
      });
    });
  }

  openLocationCard(locationId) {
    if (locationId != null && locationId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup location_card donor_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        LocationCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.LocationId = locationId;
      var objCollectorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        locationId: locationId,
      };
      this.locationService
        .getLocationCard(objCollectorCard)
        .subscribe((res: any) => {
          this.isloading = false;
          if (res) {
            modalRef.componentInstance.LocationCardData = res;
          }
        });
    }
  }

  openReminderCardPopup(cardId, isPayment) {
    if (cardId != null && cardId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: false,
        keyboard: true,
        windowClass: "drag_popup payment_card",
      };

      if (isPayment) {
        const modalRef = this.commonMethodService.openPopup(
          PaymentCardPopupComponent,
          this.modalOptions
        );
        const objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          paymentId: cardId,
        };
        this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
          // hide loader
          this.isloading = false;
          modalRef.componentInstance.PaymentCardData = res;
        });
      } else {
        const modalRef = this.commonMethodService.openPopup(
          PledgeCardPopupComponent,
          this.modalOptions
        );
        const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
        this.pledgeService
          .GetPledgeCard(eventGuid, cardId)
          .subscribe((res: any) => {
            // hide loader
            this.isloading = false;
            modalRef.componentInstance.PledgeCardData = res;
          });
      }
    }
  }
  openNotificationSidebarPopup(notificationId = 1) {
    if (notificationId != null && notificationId != 0) {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup donor_card donor_card_payment",
      };
      const modalRef = this.commonMethodService.openPopup(
        NotificationSidebarPopupComponent,
        this.modalOptions
      );
      let eventGuId = this.localstoragedataService.getLoginUserEventGuId();

      this.notification
        .getNotificationById(notificationId, eventGuId)
        .subscribe((res: any) => {
          this.isloading = false;
          modalRef.componentInstance.Data = res;
        });
    }
  }

  //code for get family data
  acc_id: number;
  getFamilyData() {
    this.acc_id = +this.accountId;
    this.familyService.Get(this.acc_id).subscribe(() => {});
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "donarCardDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "DonorCard" &&
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
          this.searchDonorCardData();
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
  @HostListener("document:keyup", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.onEscapePress();
    }
  }
  onEscapePress() {
    this.dismissAll();
  }
  dismissAll() {
    this.ngbModal.dismissAll("by escape key");
    this.ngbModal.activeInstances.subscribe((instances) => {
      const havePledgeCard = instances.filter((o) => {
        return o.componentInstance instanceof PledgelistCardPopupComponent;
      });

      if (havePledgeCard.length !== 0) {
        this.allowPledgeListCard = false;
      } else {
        this.allowPledgeListCard = true;
      }
    });
  }
}
