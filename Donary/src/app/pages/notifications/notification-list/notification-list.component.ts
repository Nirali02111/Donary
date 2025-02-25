import {
  Component,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { NgbModalOptions, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { NotificationService } from "src/app/services/notification.service";
import { ReminderPopupComponent } from "../reminder-popup/reminder-popup.component";

import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import * as moment from "moment";

import Swal from "sweetalert2";
import { UserService } from "src/app/services/user.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorTransactionCardPopupComponent } from "../../cards/donor-transaction-card-popup/donor-transaction-card-popup.component";
import { CardService } from "src/app/services/card.service";
import { PledgeService } from "src/app/services/pledge.service";
import { NotificationFilterComponent } from "../notification-filter/notification-filter.component";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";

import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";

import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { Subscription } from "rxjs";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-notification-list",
  templateUrl: "./notification-list.component.html",
  styleUrls: ["./notification-list.component.scss"],
  standalone: false,
})
export class NotificationListComponent implements OnInit {
  isBrowser = false;
  notificationAction = false;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild("upcomingCalendar", {
    static: false,
    read: DaterangepickerDirective,
  })
  upComingPickerDirective: DaterangepickerDirective;

  selectedDateRange: any = {
    startDate: moment(new Date()).subtract(29, "days"),
    endDate: moment(new Date()),
  };
  selectedUpcomingDateRange: any = {
    startDate: moment(new Date()),
    endDate: moment(new Date()).add(6, "days"),
  };
  filtercount: number = 1;
  isloading: boolean = false;
  showBox: boolean = true;
  isloader = false;
  gridFilterData: any = [];
  notificationComments: any = [];
  //selectedDateRange: any;
  startDate: any = [];
  popTitle: any;
  filterRecord: number;
  isFiltered: boolean;
  PageName: any = "NotificationList";
  PageName2: any = "NotificationListHebrew";
  isOneDate: any = false;
  isSidebarOnedate: any = true;
  modalOptions: NgbModalOptions;
  totalRecord: boolean;
  // Editor = DecoupledEditor;//ClassicEditor;
  Editor;
  dueDate: any;
  createdDate: any;
  recurringType: string;
  scheduleStatus: string;
  repeatId: any = [];
  repeatList = [];
  transactionType: string;
  transactionTypeTxt: string;
  assignee: string;
  email: string;
  phone: string;
  paymentDate: any;
  paymentDateJewish: string;
  fullName: string;
  fullNameJewish: string;
  note: string;
  notifyEmail: boolean;
  isCancelSchedule: boolean = false;
  notifySMS: boolean;
  amount: number = 0;
  status: string;
  campaignName: string;
  title: string;
  locationName: string;
  status_class: string;
  paymenttype_icn: string;
  accountNum: string;
  defaultLocationNameJewish: string;
  donorFullName: string;
  donorFullNameJewish: string;
  father: string;
  fatherInLaw: string;
  phoneNumber: string;
  address: string;
  donor: string;
  recordTypeId: number;
  recordId: number;
  SelectedPaymentArray = [];
  showPaymentBox: boolean = false;
  notificationId;
  statusId;
  selectedDonorId;
  selectedOldDonorId;
  assigneeId;
  assigneeName: string;
  categoryID;
  typeID;
  isSelectedNotification = false;
  assigneeList: Array<any> = [];
  changeHtml: boolean = true; //false;//for issue
  isAssigneeloader: boolean = true;
  isDateLabel: boolean = false; //true;
  isgridDisable: boolean = false;
  cardNotification: boolean = false;
  isLinkedDonorCard: boolean = true;
  isAttachedTrans: boolean = true;
  isAttachedTransX: boolean = true;
  isSearchDisable: boolean = true;
  btnTitleMarkComplete = "Mark Complete";
  nonEditable: boolean = false;
  linkDonor = false;
  gridData: Array<any>;
  filterStatus = "1";
  statusLabel = "";
  status_labelClass = "";
  usersListEmail: Array<any> = [];
  usersListText: Array<any> = [];
  usersListEmaildp;
  usersListTextdp;
  usersListEmaildpw;
  usersListTextdpw;
  userCreatedName: string;
  phone_linkDonar: string;
  email_linkDonar: string;
  address_linkDonar: string;
  assigneeEmail: string;
  assigneePhone: string;
  index = -1;
  linkDonorId: number;
  filterAssignee: any;
  alertInfo: any;
  alertDonorDetails: any;
  public tools: object = {
    items: [
      "Bold",
      "Italic",
      "Underline",
      "OrderedList",
      "UnorderedList",
      "CreateLink",
    ],
  };
  EngHebCalPlaceholder: string = "Next 7 Days";
  EngPlaceholder: string = "All Time";
  presetOption: string;
  class_id: string;
  class_hid: string;
  repeatName: string;
  private calendarSubscription: Subscription;
  private calendarSubscription2: Subscription;
  isRecurringId: boolean = true;
  private analytics = inject(AnalyticsService);

  constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
    public commonMethodService: CommonMethodService,
    public notificationService: NotificationService,
    public localstorageService: LocalstoragedataService,
    protected userService: UserService,
    public cardService: CardService,
    public pledgeService: PledgeService,
    private render: Renderer2,
    private router: Router,
    private commonAPIMethodService: CommonAPIMethodService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {
    this.isBrowser = isPlatformBrowser(this._platformId);
    if (this.isBrowser) {
      const DecoupledEditor = require("@ckeditor/ckeditor5-build-decoupled-document");
      this.Editor = DecoupledEditor;
    }
    if (this.router.getCurrentNavigation().extras.state) {
      var notification =
        this.router.getCurrentNavigation().extras.state.details;

      this.userService
        .getUsersList(this.localstorageService.getLoginUserEventGuId())
        .subscribe(
          (res) => {
            if (res) {
              for (var i = 0; i < res.length; i++) {
                if (res[i].firstname || res[i].lastName) {
                  this.assigneeList.push({
                    itemName: res[i].firstname + " " + res[i].lastname,
                    id: res[i].userId,
                  });
                }
              }
              // email dropdwn
              for (let index = 0; index < res.length; index++) {
                const element = res[index];
                if (element.email) {
                  this.usersListEmail.push({
                    itemName: element.email,
                    id: element.email,
                    userId: element.userId,
                  });
                }
                if (element.phone) {
                  this.usersListText.push({
                    itemName: element.phone,
                    id: element.phone,
                    userId: element.userId,
                  });
                }
              }
              this.getNotification(notification);
              this.isAssigneeloader = false;
            }
          },
          (err) => {}
        );
    }
  }

  ngOnInit() {
    this.analytics.visitedReminders();
    this.commonMethodService.formatAmount(0);
    const eventGuId = this.localstorageService.getLoginUserEventGuId();
    this.userService.getUsersList(eventGuId).subscribe(
      (res) => {
        if (res) {
          for (var i = 0; i < res.length; i++) {
            if (res[i].firstname || res[i].lastName) {
              this.assigneeList.push({
                itemName: res[i].firstname + " " + res[i].lastname,
                id: res[i].userId,
              });
            }
          }
          // email dropdwn

          for (let index = 0; index < res.length; index++) {
            const element = res[index];
            if (element.email) {
              this.usersListEmail.push({
                itemName: element.email,
                id: element.email,
                userId: element.userId,
              });
            }
            if (element.phone) {
              this.usersListText.push({
                itemName: element.phone,
                id: element.phone,
                userId: element.userId,
              });
            }
          }
          this.isAssigneeloader = false;
        }
      },
      (err) => {}
    );

    this.commonAPIMethodService.getScheduleRepeatTypes().subscribe(
      (res: any) => {
        for (var i = 0; i < res.length; i++) {
          this.repeatList.push({
            itemName: res[i].field,
            id: res[i].valueID,
          });
        }
      },
      (err) => {}
    );
    this.GetListData();
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }
    $(".editor_cls").each(function () {
      //alert();
      this.Editor.replace(this, {
        height: 100,
        removePlugins: "blockquote",
      });
    });

    $("#notificationScroll tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        var idx = $("#notificationScroll tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("notificationScroll").scrollTop = 0;
        }
        $("#notificationScroll tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        var idx = $("#notificationScroll tr:focus").attr("tabindex");
        idx++;
        $("#notificationScroll tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("notificationScroll").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("notificationScroll").scrollLeft += 30;
      }
    };
  }
  linkDonorPopup(linkDonorId) {
    if (linkDonorId != null && linkDonorId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup donor_card",
      };
      var objDonorCard = {
        eventGuId: this.localstorageService.getLoginUserEventGuId(),
        accountId: linkDonorId,
      };
      this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
        if (res) {
          const modalRef = this.commonMethodService.openPopup(
            DonorCardPopupComponent,
            this.modalOptions
          );
          modalRef.componentInstance.AccountId = linkDonorId;
          this.isloading = false;
          modalRef.componentInstance.DonorCardData = res;
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

  openAdvanceSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "device_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      NotificationFilterComponent,
      this.modalOptions
    );
    //this.filterStatus="Unread";
    //this.objAdvancedSearch.deviceStatusList = this.deviceStatusList;
    modalRef.componentInstance.AdvancedFilterData = this.filterStatus;
    modalRef.componentInstance.AdvancedFilterAAData = this.filterAssignee;
    //modalRef.componentInstance.isTotalPanelOpen = this.isTotalPanelVisible;
    modalRef.componentInstance.emtOutputSourceFilterData.subscribe(
      (objResponse) => {
        var temp = this.gridData;
        if (objResponse.status == "") {
          if (objResponse.assigneeId != "null") {
            var result = temp.filter(
              (x) => x.assigneeId[0].id == objResponse.assigneeId
            );
            this.gridFilterData = result;
            this.filterAssignee = objResponse.assigneeId;
          } else {
            this.gridFilterData = temp;
          }
          this.filterAssignee = objResponse.assigneeId;
          this.filterStatus = "";
        } else if (objResponse.status == "0") {
          if (objResponse.assigneeId != "null") {
            var result = temp.filter(
              (x) => x.assigneeId[0].id == objResponse.assigneeId
            );
            this.gridFilterData = result;
            this.filterAssignee = objResponse.assigneeId;
          } else {
            this.gridFilterData = this.gridData;
          }
          this.filterStatus = "0";
          this.filtercount = 0;
        } else {
          if (
            objResponse.assigneeId === "null" ||
            objResponse.assigneeId === false
          ) {
            var result = temp.filter((x) => x.statusId == objResponse.status);
            this.filterAssignee = objResponse.assigneeId;
          } else {
            var result = temp.filter(
              (x) =>
                x.statusId == objResponse.status &&
                x.assigneeId[0].id == objResponse.assigneeId
            );
            this.filterAssignee = objResponse.assigneeId;
          }
          this.gridFilterData = result;
          this.filterStatus = objResponse.status;
          this.filtercount = 1;
        }

        this.totalRecord = this.gridFilterData.length;
      }
    );
  }

  RemoveDonor() {
    this.nonEditable = false;
    this.donor = null;
    this.selectedDonorId = 0;
    this.isAttachedTrans = false;
    this.isSearchDisable = false;
    this.showBox = false;
    this.RemoveLinkedTransaction();
  }

  inputFocus(e) {
    let oldClass = e.target.getAttribute("class");
    if (
      oldClass &&
      oldClass.toString().toLowerCase().indexOf("selected-item") == -1 &&
      oldClass.toString().toLowerCase().indexOf("pure-checkbox") == -1
    ) {
      this.render.addClass(e.target, "selected");
    }
  }

  SearchDonor(event) {
    if (event.target.value.length > 2) {
      this.isSearchDisable = false;
      this.SearchGlobalDonor();
    } else {
      this.showBox = false;
      this.isSearchDisable = true;
    }
  }

  SearchGlobalDonor() {
    var text = $("#donorText")
      .val()
      .toLowerCase()
      .replace(/[().-]/g, "");
    if (text && text.length > 2) {
      this.showBox = true;
      this.isloader = true;
      this.commonMethodService.donorList =
        this.commonMethodService.localDonorList;
      this.showBox = true;
      this.search(text);
    } else {
      this.showBox = false;
    }
  }

  RemoveAssignee() {
    this.showPaymentBox = false;
    this.transactionType = null;
    this.transactionTypeTxt = "ATTACH TO ";
  }

  onClickedOutside() {
    this.showBox = false;
  }

  SelectDonor(accountId) {
    this.isSearchDisable = true;
    this.showBox = false;
    this.nonEditable = true;
    this.linkDonor = true;
    this.selectedDonorId = 0;
    this.donor = null;
    this.nonEditable = false;
    this.linkDonor = true;
    this.isAttachedTrans = false;
    this.isAttachedTransX = false;
    this.recordTypeId = this.recordTypeId;
    if (this.selectedOldDonorId == accountId) {
      this.isAttachedTrans = false;
    } else {
      this.isAttachedTrans = true;
      this.transactionTypeTxt = "ATTACH TO ";
      this.recordId = null;
    }
    this.isLinkedDonorCard = false;

    this.selectedDonorId = accountId;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.donor = this.commonMethodService.donorList[0].fullNameJewish
      ? this.commonMethodService.donorList[0].fullNameJewish
      : this.commonMethodService.donorList[0].displayText;
    this.accountNum = this.commonMethodService.donorList[0].accountNum;
    this.defaultLocationNameJewish =
      this.commonMethodService.donorList[0].defaultLocation;
    this.fullName = this.commonMethodService.donorList[0].fullName;
    this.fullNameJewish = this.commonMethodService.donorList[0].fullNameJewish;
    this.father = this.commonMethodService.donorList[0].father;
    this.fatherInLaw = this.commonMethodService.donorList[0].fatherInLaw;
    this.phoneNumber = this.commonMethodService.donorList[0].phonenumbers;
    this.address = this.commonMethodService.donorList[0].address;
    this.assigneeId = this.assigneeId;
    this.isAttachedTransX = true;

    this.SaveNotification();
  }

  private getCommonNotification(title) {
    return Swal.fire({
      title: title,
      showCancelButton: true,
      confirmButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CONFIRM.YES_SAVE"
      ),
      cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
      confirmButtonColor: "#7b5bc4",
    });
  }

  emailCheckbox(event) {
    if (event.target.checked) {
      this.getCommonNotification(
        this.commonMethodService.getTranslate(
          "WARNING_SWAL.ENABLE_EMAIL_REMINDER"
        )
      ).then((result) => {
        if (result.value) {
          this.SaveNotification();
        }
      });

      return;
    }

    this.getCommonNotification(
      this.commonMethodService.getTranslate("WARNING_SWAL.STOP_EMAIL_REMINDER")
    ).then((result) => {
      if (result.value) {
        this.SaveNotification();
      }
    });
  }

  smsCheckbox(event) {
    if (event.target.checked) {
      this.getCommonNotification(
        this.commonMethodService.getTranslate(
          "WARNING_SWAL.ENABLE_TEXT_REMINDER"
        )
      ).then((result) => {
        if (result.value) {
          this.SaveNotification();
        }
      });

      return;
    }

    this.getCommonNotification(
      this.commonMethodService.getTranslate("WARNING_SWAL.STOP_TEXT_REMINDER")
    ).then((result) => {
      if (result.value) {
        this.SaveNotification();
      }
    });
  }

  search(keyword) {
    var record = this.commonMethodService.donorList;
    keyword = keyword.toLowerCase();
    var filterdRecord;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
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
              obj.emails.toString().toLowerCase().indexOf(searchValue) > -1)
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
    this.isloader = false;
  }

  ChangeDate() {
    this.isDateLabel = false;
  }

  CloseNotificationCard() {
    this.cardNotification = false;
  }

  AddReminderPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reminder_card modal_responsive",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReminderPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isMobileView = true;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.GetListData();
      }
    );
  }

  GetListData() {
    this.gridFilterData = [];
    this.gridData = [];
    this.totalRecord = this.gridFilterData.length;
    const eventGuId = this.localstorageService.getLoginUserEventGuId();
    const fromDate =
      this.selectedUpcomingDateRange.startDate &&
      this.selectedUpcomingDateRange.startDate != undefined
        ? moment(this.selectedUpcomingDateRange.startDate).format("YYYY-MM-DD")
        : "";
    const toDate =
      this.selectedUpcomingDateRange.endDate &&
      this.selectedUpcomingDateRange.endDate != undefined
        ? moment(this.selectedUpcomingDateRange.endDate).format("YYYY-MM-DD")
        : "";
    this.isloading = true;
    this.notificationService
      .getNotificationList(eventGuId, fromDate, toDate, "")
      .subscribe(
        (res) => {
          console.log(res);
          res = res || [];
          this.gridData = res;
          if (this.assigneeList.length > 0) {
            res.forEach((element) => {
              element.assigneeId = this.assigneeList.filter(
                (x) => x.id == element.assigneeId
              );
            });
          }
          if (this.repeatList.length > 0) {
            res.forEach((element) => {
              element.repeatId = this.repeatList.filter(
                (x) => x.id == element.recurringTypeId
              );
            });
          }
          // res=res.filter(x=>x.status!='Canceled' && x.status!="Completed");
          res =
            this.filterStatus == "0"
              ? this.gridData
              : res.filter((x) => x.statusId == this.filterStatus);
          this.isloading = false;
          this.gridFilterData = res;
          this.totalRecord = this.gridFilterData.length;
          this.isgridDisable = false;
        },
        (err) => {
          this.isloading = false;
          this.isgridDisable = false;
        }
      );
  }

  datesUpdated(event) {
    if (event.startDate != null) {
      this.selectedDateRange = event;
      this.dueDate = moment(this.selectedDateRange.startDate).format(
        "YYYY-MM-DD h:mmA"
      );
      //this.isDateLabel=true; //for issue
      this.assigneeId = this.assigneeId;

      this.SaveNotification();
    } else if (event.startDate == null && event.startDate == null) {
      this.selectedDateRange = undefined;
    }
  }

  getNotification(data) {
    if (!this.isgridDisable) {
      this.isloading = true;
      if (data) {
        this.alertDonorDetails = data;
        this.cardNotification = true;
        this.isAttachedTrans = data.recordID == null ? true : false;
        this.linkDonor = data.linkDonorId == null ? false : true;
        this.dueDate = data.dueDateTime
          ? moment(data.dueDateTime).format("MM/DD/YYYY h:mmA")
          : "";
        // this.createdDate=data.createdDate? moment(data.createdDate).format("lll") :  "";
        this.userCreatedName = data.userCreatedName;
        this.selectedDateRange = data.dueDateTime
          ? {
              startDate: moment(data.dueDateTime),
              endDate: moment(data.dueDateTime),
            }
          : "";
        this.EngPlaceholder = moment(data.dueDateTime).format("MM/DD/YYYY");
        this.assignee = data.assignee ? data.assignee : "";
        this.email = data.emailAddress ? data.emailAddress : "";
        this.phone = data.phoneNumber ? data.phoneNumber : "";
        this.notifyEmail = data.notifyEmail;

        this.notifySMS = data.notifySMS;
        this.note = data.note ? data.note : "";
        this.transactionTypeTxt =
          data.recordID != null
            ? "ATTACHED TO " + data.recordType
            : "ATTACH TO";
        this.transactionType = data.recordType;
        this.paymentDate = data.transactionDate;
        this.paymentDateJewish = data.transactionJewishDate;
        this.fullName = data.donorFullName;
        this.donorFullName = data.fullName;
        this.donorFullNameJewish = data.fullNameJewish;
        this.amount = data.amount;
        this.status = data.transactionStatus;
        this.campaignName = data.campaignName;
        this.locationName = data.locationName;
        this.defaultLocationNameJewish = data.defaultLocationNameJewish;
        this.title = data.title;
        this.accountNum = data.accountNum;
        this.fullName = data.fullName;
        this.father = data.father;
        this.fatherInLaw = data.fatherInLaw;
        this.phoneNumber = data.phoneNumber;
        this.address = data.address;
        this.recordTypeId = data.recordTypeID;
        this.recordId = data.recordID;
        if (data.recurringTypeId) {
          this.repeatId = this.repeatList.filter(
            (x) => x.id == data.recurringTypeId
          );
          this.repeatName = this.repeatId[0].itemName;
          this.isRecurringId = true;
        } else {
          this.isRecurringId = false;
        }

        this.fullNameJewish =
          data.fullNameJewish === null || data.fullNameJewish === undefined
            ? data.fullName
            : data.fullNameJewish;

        if (data.transactionStatus == "Success") {
          this.status_class = "paymnt_success";
        } else if (data.transactionStatus == "Declined") {
          this.status_class = "paymnt_declined";
        } else if (data.transactionStatus == "Error") {
          this.status_class = "paymnt_error";
        } else if (data.transactionStatus == "Voided") {
          this.status_class = "paymnt_voided";
        } else if (data.transactionStatus == "Refunded") {
          this.status_class = "paymnt_refunded";
        } else if (data.transactionStatus == "Processing") {
          this.status_class = "paymnt_processing";
        } else if (data.transactionStatus == "Paid") {
          this.status_class = "pledge_paid";
        } else if (data.transactionStatus == "Open") {
          this.status_class = "pledge_open";
        } else if (data.transactionStatus == "Partially Paid") {
          this.status_class = "pledge_partial";
        } else if (data.transactionStatus == "Voided") {
          this.status_class = "pledge_void";
        } else if (data.transactionStatus == "Schedule") {
          this.status_class = "schedule_shdl";
        } else if (data.transactionStatus == "Complete") {
          this.status_class = "schedule_complete";
        } else if (data.transactionStatus == "Canceled") {
          this.status_class = "schedule_canceled";
        } else if (data.transactionStatus == "Pending") {
          this.status_class = "schedule_pending";
        } else if (data.transactionStatus == "Failed") {
          this.status_class = "schedule_failed";
        } else if (data.transactionStatus == "Paused") {
          this.status_class = "schedule_paused";
        } else if (data.transactionStatus == "Error") {
          this.status_class = "schedule_error";
        }

        if (data.paymentType == "Cash") {
          this.paymenttype_icn = "cash_icon";
        } else if (data.paymentType == "Check") {
          this.paymenttype_icn = "check_icon";
        } else if (data.paymentType == "OJC") {
          this.paymenttype_icn = "ojc_icon";
        } else if (data.paymentType == "Credit Card") {
          this.paymenttype_icn = "creditcard_icon";
        } else if (data.paymentType == "Other") {
          this.paymenttype_icn = "other_icon";
        } else {
          this.paymenttype_icn = "";
        }
        // get values for update
        this.notificationId = data.notificationId;
        this.selectedDonorId = data.linkDonorId;
        //var assignee=this.assigneeList.filter(x=>x.id==data.assigneeId);
        this.assigneeId = Array.isArray(data.assigneeId)
          ? data.assigneeId
          : this.assigneeList.filter((x) => x.id == data.assigneeId);
        this.categoryID = data.categoryID;
        this.typeID = data.typeID;
        this.recordId = data.recordID;
        this.isSelectedNotification = true;
        this.statusId = data.statusId; //added new
        this.setclsClickedComplete = "";
        this.setclsClickedDelete = "";
        this.isLinkedDonorCard = this.selectedDonorId != null ? false : true;
        this.getNotificationById(); //added new
        $(".clicked-complete").removeClass("clicked-complete");
        $(".clicked-delete").removeClass("clicked-delete");
        if (data.status == "Completed") {
          this.btnTitleMarkComplete = "Completed";
          this.setclsClickedComplete = " btn-wrap-completed";
        } else {
          this.btnTitleMarkComplete = "Mark Complete";
          this.setclsClickedComplete = "";
        }
        //
        this.statusLabel = this.getStatusLabel(data.statusId);
        this.status_labelClass = this.getStatusClass(data.statusId);
        // $('.active-record').removeClass('active-record');
        //event.currentTarget.className="active-record";
        this.getEmailDwn(data.assigneeId);
        this.getPhoneDwn(data.assigneeId);
      }
      this.isloading = false;
    }
  }

  openPaymentListCardPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup collector_card source_campaign attached-data-modal",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorTransactionCardPopupComponent,
      this.modalOptions
    );
    this.notificationService
      .getNotificationTransactionsDonors(
        this.localstorageService.getLoginUserEventGuId(),
        this.selectedDonorId
      )
      .subscribe(
        (res: any) => {
          if (res) {
            modalRef.componentInstance.DonorTransactionCardListData = res;
            this.isAttachedTransX = true;
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
    modalRef.componentInstance.emtOutputPaymentData.subscribe((objResponse) => {
      console.log(objResponse);
      this.isAttachedTrans = false;
      this.SelectedPaymentArray = [];
      this.SelectedPaymentArray.push(objResponse);
      if (objResponse.paymentId != objResponse.pledgeId) {
        this.recordTypeId = 1;
        this.recordId = objResponse.paymentId;
        let objDonorCard = {
          eventGuId: this.localstorageService.getLoginUserEventGuId(),
          paymentId: objResponse.paymentId,
        };
        this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
          this.isloading = false;
          if (res) {
            this.paymentDate = res.paymentDate;
            this.paymentDateJewish = res.paymentDateJewish;
            this.fullName = res.fullName;
            this.fullNameJewish = res.fullNameJewish;
            this.amount = res.amount;
            if (res.status == "Success") {
              this.status_class = "paymnt_success";
            } else if (res.status == "Declined") {
              this.status_class = "paymnt_declined";
            } else if (res.status == "Error") {
              this.status_class = "paymnt_error";
            } else if (res.status == "Voided") {
              this.status_class = "paymnt_voided";
            } else if (res.status == "Refunded") {
              this.status_class = "paymnt_refunded";
            } else if (res.status == "Processing") {
              this.status_class = "paymnt_processing";
            }
            if (res.paymentType == "Cash") {
              this.paymenttype_icn = "cash_icon";
            } else if (res.paymentType == "Check") {
              this.paymenttype_icn = "check_icon";
            } else if (res.paymentType == "OJC") {
              this.paymenttype_icn = "ojc_icon";
            } else if (res.paymentType == "Credit Card") {
              this.paymenttype_icn = "creditcard_icon";
            } else if (res.paymentType == "Other") {
              this.paymenttype_icn = "other_icon";
            }

            this.status = res.status;
            this.campaignName = res.campaignName;
            this.locationName = res.locationName;
          }
        });
      } else if (objResponse.pledgeId) {
        this.recordTypeId = 2;
        this.recordId = objResponse.pledgeId;
        var eventGuid = this.localstorageService.getLoginUserEventGuId();
        this.pledgeService
          .GetPledgeCard(eventGuid, objResponse.pledgeId)
          .subscribe((res: any) => {
            // hide loader
            this.isloading = false;
            if (res) {
              this.paymentDate = res.pledgeDate;
              this.paymentDateJewish = res.pledgeJewishDate;
              this.donorFullName = res.donor;
              this.donorFullNameJewish = res.donorJewishName;
              this.amount = res.totalAmount;
              if (res.status == "Paid") {
                this.status_class = "pledge_paid";
              } else if (res.status == "Open") {
                this.status_class = "pledge_open";
              } else if (res.status == "Partially Paid") {
                this.status_class = "pledge_partial";
              } else if (res.status == "Voided") {
                this.status_class = "pledge_void";
              }
              this.status = res.status;
              this.paymenttype_icn = "";
              this.campaignName = res.campaign;
              this.locationName = res.location;
            }
          });
      } else if (objResponse.pledgeId) {
        this.recordTypeId = 3;
        this.recordId = objResponse.pledgeId;
        var eventGuid = this.localstorageService.getLoginUserEventGuId();
        this.pledgeService
          .GetPledgeCard(eventGuid, objResponse.pledgeId)
          .subscribe((res: any) => {
            // hide loader
            this.isloading = false;
            if (res) {
              this.paymentDate = res.pledgeDate;
              this.paymentDateJewish = res.pledgeJewishDate;
              this.donorFullName = res.donor;
              this.donorFullNameJewish = res.donorJewishName;
              this.amount = res.totalAmount;
              if (res.status == "Paid") {
                this.status_class = "schedule_paid";
              } else if (res.status == "Open") {
                this.status_class = "schedule_open";
              } else if (res.status == "Partially Paid") {
                this.status_class = "schedule_partial";
              } else if (res.status == "Voided") {
                this.status_class = "schedule_void";
              }
              this.status = res.status;
              this.paymenttype_icn = "";
              this.campaignName = res.campaign;
              this.locationName = res.location;
            }
          });
      }
      this.showPaymentBox = true;
      this.transactionType = objResponse.transactionType;
      this.transactionTypeTxt = "ATTACHED TO " + this.transactionType;
      this.assigneeId = this.assigneeId;

      this.SaveNotification();
    });
  }

  AssigneeClick() {
    this.changeHtml = true;
  }

  SelectAssignee(data) {
    var assignee = this.assigneeList.filter((x) => x.id == data.id);
    this.assignee = assignee[0].itemName;
    this.assigneeId = assignee;
    //this.changeHtml=false; for issue
    this.SaveNotification();
    this.getEmailDwn(this.assigneeId.map((x) => x.id).toString());
    this.getPhoneDwn(this.assigneeId.map((x) => x.id).toString());
  }

  SelectRepeat(data) {
    var repeat = this.repeatList.filter((x) => x.id == data.id);
    this.repeatId = repeat;
    this.SaveNotification();
  }

  RemoveLinkedDonor() {
    this.selectedOldDonorId = this.selectedDonorId;
    //this.selectedDonorId=0;
    this.isLinkedDonorCard = true;
    // this.donor=null;
    //this.nonEditable=false;
    //this.linkDonor=true;
    //this.isAttachedTrans=false;
    //this.isAttachedTransX=false
    //this.recordTypeId =  this.recordTypeId
    //this.SaveNotification();
  }

  RemoveLinkedTransaction() {
    this.assigneeId = this.assigneeId;
    this.isAttachedTrans = true;
    this.recordId = null;
    this.recordTypeId = this.recordTypeId ? this.recordTypeId : 4;
    this.transactionType = null;
    this.isAttachedTransX = false;
    this.transactionTypeTxt = "ATTACH TO ";
    this.showPaymentBox = false;
    this.linkDonor = this.selectedDonorId == 0 ? false : true;
    this.SaveNotification();
  }

  SaveNotification() {
    this.isloading = true;
    if (this.notificationId != undefined) {
      //var assigneeId = this.assigneeId ? this.assigneeId.map(s => s.id).toString() : 0;
      // var RecurringTypeId = this.repeatId ? this.repeatId.map(s => s.id).toString() : 0;
      var obj = {
        EventGuId: this.localstorageService.getLoginUserEventGuId(),
        NotificationId: this.notificationId,
        TypeId: "1",
        Title: this.title,
        DueDateTime: this.dueDate,
        AssigneeId: this.assigneeId
          ? this.assigneeId.map((s) => s.id).toString()
          : 0,
        Note: this.note,
        LinkDonorId: this.selectedDonorId,
        LoginUserId: this.localstorageService.getLoginUserId(),
        Email: this.email,
        Phone: this.phone,
        NotifySMS: this.notifySMS,
        NotifyEmail: this.notifyEmail,
        RecordTypeId:
          !this.recordId && this.selectedDonorId ? 4 : this.recordTypeId,
        RecordId: this.recordId,
        StatusId: this.statusId,
        isCancelSchedule: this.isCancelSchedule,
        RecurringModel: {
          RecurringCount: null,
          RecurringType: this.repeatId
            ? this.repeatId.map((s) => s.id).toString()
            : 0, //RecurringTypeId,
          ScheduleDateTime: null,
        },
      };
      this.notificationService.saveNotification(obj).subscribe(
        (res) => {
          if (res) {
            this.isloading = false;

            this.GetListData();
            this.getNotificationById();
          } else {
            this.isgridDisable = false;
            console.log("onReminder res error");
          }
        },
        (err) => {
          this.isloading = false;
          console.log(err);
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SOMETHING_WENT_WRONG"
            ),
            text: err.error,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            console.log("onReminder res error", err.error);
            // this.activeModal.dismiss();
          });
        }
      );
    }
  }
  SaveNoteTitle() {
    this.isgridDisable = true;
    this.assigneeId = this.assigneeId;

    this.SaveNotification();
  }

  SaveEndRecurring() {
    this.isgridDisable = true;
    this.isCancelSchedule = true;
    this.scheduleStatus = "Canceled";
    this.SaveNotification();
  }

  AssigneeLabel(event) {
    event.stopPropagation();
    //this.changeHtml=false; //for issue
  }
  setclsClickedComplete = "";
  setclsClickedDelete = "";

  onMarkCompleted(statusIdPass: number) {
    if (statusIdPass == 3) {
      if (this.btnTitleMarkComplete == "Completed") {
        statusIdPass = 1; //2;
        this.btnTitleMarkComplete = "Mark Complete";
        this.setclsClickedComplete = "clicked-complete";
      } else {
        statusIdPass = 3;
        this.btnTitleMarkComplete = "Completed";
        this.setclsClickedComplete = "clicked-complete btn-wrap-completed";
      }
    }
    if (statusIdPass == 4) {
      this.setclsClickedDelete = "clicked-delete";
    }

    //if(this.isSelectedNotification){
    this.isSelectedNotification = false;
    this.isloading = true;
    this.statusId = statusIdPass; //added new

    this.statusLabel = this.getStatusLabel(this.statusId); //added new
    this.status_labelClass = this.getStatusClass(this.statusId); // added new
    var obj = {
      EventGuId: this.localstorageService.getLoginUserEventGuId(),
      NotificationId: this.notificationId,
      TypeId: this.typeID,
      CategoryId: this.categoryID,
      Title: this.title,
      DueDateTime: this.dueDate,
      AssigneeId: this.assigneeId[0].id,
      Note: this.note,
      RecordTypeId: this.recordTypeId,
      //ReportTypeId: 0,
      //ReportId: 0,
      StatusId: statusIdPass,
      LinkDonorId: this.selectedDonorId,
      LoginUserId: this.localstorageService.getLoginUserId(),
      Email: this.email,
      Phone: this.phone,
      NotifySMS: this.notifySMS,
      NotifyEmail: this.notifyEmail,
      // RecurringModel:
      // {
      //   RecurringCount: 0,
      //   //RecurringType: null,//RecurringTypeId,
      //  // ScheduleDateTime: "2022-01-11T14:58:32.687Z"
      // }
    };
    this.notificationService.saveNotification(obj).subscribe(
      (res) => {
        if (res) {
          this.analytics.editedReminderStatus();

          this.isloading = false;
          this.GetListData();
        } else {
          console.log("onReminder res error");
        }
      },
      (err) => {
        this.isloading = false;
        console.log(err);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: err.error,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        }).then(() => {
          console.log("onReminder res error", err.error);
          // this.activeModal.dismiss();
        });
      }
    );
    //}
  }
  onDeleteStatus(statusIdPass: number) {
    this.onMarkCompleted(statusIdPass);
  }
  //
  notificationSearch(keyword) {
    var filterdRecord = [];
    var oldfilterRecord = [];

    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = this.gridData.filter(
          (obj) =>
            (obj.title &&
              obj.title.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.assignee &&
              obj.assignee.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.assigneeType &&
              obj.assigneeType.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );

        this.gridFilterData = filterdRecord.filter(
          (x) => x.statusId == this.filterStatus
        );
        oldfilterRecord = filterdRecord;
        this.totalRecord = this.gridFilterData.length;
      }
    } else {
      if (oldfilterRecord.length > 0) {
        this.gridFilterData = oldfilterRecord;
        this.totalRecord = this.gridFilterData.length;
      } else {
        this.gridFilterData = this.gridData.filter(
          (x) => x.statusId == this.filterStatus
        );
        this.totalRecord = this.gridFilterData.length;
      }
    }
  }
  //
  // date

  isRangeSelected = false;
  isinitializeSecond: number = 0;
  datesUpcomingUpdated(event) {
    //this.filterStatus="1";//added new
    //this.filtercount=1;
    if (this.isinitializeSecond == 1) {
      this.isloading = true;
      this.selectedUpcomingDateRange = event;
      //this.getDashboardValues();
      this.GetListData();
      this.isRangeSelected == true
        ? $("#upcomingcalendar").removeClass("custom_range")
        : $("#upcomingcalendar").addClass("custom_range");
      this.isRangeSelected = false;
    }
    if (
      this.selectedUpcomingDateRange.startDate &&
      this.selectedUpcomingDateRange.endDate
    ) {
      this.GetListData();
    } else {
      this.GetListData();
    }
  }
  upcomingRangeClicked(event) {
    this.isRangeSelected = true;
  }
  //
  getStatusLabel(statusIdPass) {
    if (statusIdPass == 1) {
      return "Active";
    }
    if (statusIdPass == 4) {
      return "Deleted";
    }
    if (statusIdPass == 3) {
      return "Completed";
    }
  }
  getStatusClass(statusIdPass) {
    if (statusIdPass == 1) {
      return "status-active";
    }
    if (statusIdPass == 4) {
      return "status-deleted";
    }
    if (statusIdPass == 3) {
      return "status-completed";
    }
  }
  tempUserListEmail;
  getEmailDwn(assigneeId = "") {
    this.tempUserListEmail = this.usersListEmail;
    this.tempUserListEmail = this.tempUserListEmail.filter(
      (x) => x.userId == assigneeId
    );
    this.usersListEmaildpw = this.tempUserListEmail;
  }
  tempUserListPhone;
  getPhoneDwn(assigneeId = "") {
    this.tempUserListPhone = this.usersListText;
    this.tempUserListPhone = this.tempUserListPhone.filter(
      (x) => x.userId == assigneeId
    );
    this.usersListTextdpw = this.tempUserListPhone;
  }
  public onReady(editor) {
    //console.log('items ',editor.ui.view.toolbar.items._items)
    var itemCls = editor.ui.view.toolbar.items._items;
    itemCls[0].element.classList.add("icon_bold");
    itemCls[1].element.classList.add("icon_italic");
    itemCls[2].element.classList.add("icon_underline");
    itemCls[3].element.classList.add("icon_file");
    itemCls[4].element.classList.add("icon_list");
    itemCls[5].element.classList.add("icon_ol");
    editor.ui.view.editable.element.parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.view.editable.element
    );
    $(".icon_bold").attr("id", "Id_icon_bold");
    $(".icon_italic").attr("id", "Id_icon_italic");
    $(".icon_underline").attr("id", "Id_icon_underline");
    $(".icon_file").attr("id", "Id_icon_file");
    $(".icon_list").attr("id", "Id_icon_list");
    $(".icon_ol").attr("id", "Id_icon_ol");
  }
  txtCommands: any;
  saveComments() {
    var obj = {
      NotificationId: this.notificationId,
      UserId: this.localstorageService.getLoginUserId(),
      Comments: this.txtCommands,
    };
    this.notificationService.saveComment(obj).subscribe(
      (res) => {
        if (res) {
          this.isloading = false;
          this.getNotificationById();
          this.txtCommands = null;
        } else {
          //console.log('onReminder res error')
        }
      },
      (err) => {
        this.isloading = false;
        console.log(err);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: err.error,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        }).then(() => {
          console.log("onReminder res error", err.error);
          // this.activeModal.dismiss();
        });
      }
    );
  }
  getNotificationById() {
    var eventGuid = this.localstorageService.getLoginUserEventGuId();
    this.notificationComments = [];
    this.notificationService
      .getNotificationById(this.notificationId, eventGuid)
      .subscribe((res) => {
        if (res) {
          this.linkDonorId = res.linkDonorId;
          this.phone_linkDonar = res.phone;
          this.email_linkDonar = res.email;
          this.address_linkDonar = res.address;
          this.createdDate = res.createdDate;
          this.repeatId = this.repeatList.filter(
            (x) => x.itemName == res.recurringType
          );
          this.notificationComments = res.notificationComments.reverse();
          this.recurringType = res.recurringType;
          this.scheduleStatus = res.scheduleStatus;
          this.assigneeEmail = res.assigneeEmail;
          this.assigneePhone = res.assigneePhone;
          this.alertInfo = res.alertInfo;
        }
      });
  }
  isHebrew_lng(s) {
    var c,
      whietlist =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    // if whitelist string doesn't include the character, break
    for (c in s) // character in string
      if (!whietlist.includes(s[c])) {
        if (s[c] != " ") {
          return true;
        }
      }
    return false;
  }
  seperateHebrewAndEnglishName(str) {
    // var result = str.replace(/\s*(\b[a-z\s]+\b)\s*/ig, '<span class="lan-eng">$1 </span>');
    // result = result.replace(/(^|[^\u0590-\u05FF])([\u0590-\u05FF]+)(?![\u0590-\u05FF])/g, '$1<span class="lng_hebrew">$2 </span>');
    // return result;
    var re =
      /(^|[^\u0590-\u05FF])([\u0590-\u05FF]+)(?![\u0590-\u05FF])|(\b[a-z)-9\s]+\b)/gi;
    var res = [];
    var m;
    while ((m = re.exec(str)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      if (m[1] !== undefined) {
        res.push('<span class="lng_hebrew">' + m[2].trim() + "</span> ");
      } else {
        res.push('<span class="lan-eng">' + m[3].trim() + "</span> ");
      }
    }
    return res.join("");
  }

  ngOnDestroy() {
    document.onkeydown = () => {};
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "dynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "NotificationListHebrew" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedUpcomingDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.presetOption = this.EngHebCalPlaceholder;
          this.class_id = this.hebrewEngishCalendarService.id;
          this.class_hid = this.hebrewEngishCalendarService.hid;
          this.GetListData();
        }
      });
  }

  onClickedOutsidePopover(event: any, p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  CalendarFocus() {
    this.pickerDirective.open();
  }
  openPopup(actions: string) {
    if (actions === "Recreate Schedule") {
      this.openAddTransactionPopup();
    }
  }
  openAddTransactionPopup() {
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
    modalRef.componentInstance.alertDonorDetails = this.alertDonorDetails;
  }

  openCalendarPopup(pl1: any) {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true,
      "dueDateDynamicsCalender",
      "modal-transaction-calender"
    );
    this.calendarSubscription2 = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "NotificationList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          pl1.close();
          this.calendarSubscription2.unsubscribe();
          this.selectedDateRange = items.obj;
          this.EngPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.datesUpdated(this.selectedDateRange);
        }
      });
  }
}
