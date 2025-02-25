import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2,
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
import { CardService } from "src/app/services/card.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { NotificationService } from "src/app/services/notification.service";
import { PledgeService } from "src/app/services/pledge.service";
import { UserService } from "src/app/services/user.service";
import Swal from "sweetalert2";
import { isPlatformBrowser } from "@angular/common";

import { DonorTransactionCardPopupComponent } from "../../cards/donor-transaction-card-popup/donor-transaction-card-popup.component";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";
declare let $: any;
@Component({
  selector: "app-notification-sidebar-popup",
  templateUrl: "./notification-sidebar-popup.component.html",
  styleUrls: ["./notification-sidebar-popup.component.scss"],
  standalone: false,
})
export class NotificationSidebarPopupComponent implements OnInit {
  isBrowser = false;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild("upcomingCalendar", {
    static: false,
    read: DaterangepickerDirective,
  })
  upComingPickerDirective: DaterangepickerDirective;

  EngPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;
  popTitle: any;
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
  PageName: any = "NotificationSidebar";
  isOneDate: any = true;
  gridFilterData: any = [];
  notificationComments: any = [];
  startDate: any = [];
  filterRecord: number;
  isFiltered: boolean;
  modalOptions: NgbModalOptions;
  totalRecord: boolean;
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
  linkDonorId: number;
  SelectedPaymentArray = [];
  showPaymentBox: boolean = false;
  notificationId;
  statusId;
  selectedDonorId;
  assigneeId;
  categoryID;
  typeID;
  isSelectedNotification = false;
  assigneeList: Array<any> = [];
  changeHtml: boolean = true;
  isAssigneeloader: boolean = true;
  isDateLabel: boolean = false;
  isgridDisable: boolean = false;
  cardNotification: boolean = false;
  isLinkedDonorCard: boolean = true;
  isAttachedTrans: boolean = true;
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
  linkedToAlertID: number;
  alertInfo = [];
  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();
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
  private calendarSubscription: Subscription;
  constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
    public commonMethodService: CommonMethodService,
    public notificationService: NotificationService,
    public localstorageService: LocalstoragedataService,
    protected userService: UserService,
    public cardService: CardService,
    public pledgeService: PledgeService,
    private render: Renderer2,
    private commonAPIMethodService: CommonAPIMethodService,
    public activeModal: NgbActiveModal,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {
    this.isBrowser = isPlatformBrowser(this._platformId);
    if (this.isBrowser) {
      const DecoupledEditor = require("@ckeditor/ckeditor5-build-decoupled-document");
      this.Editor = DecoupledEditor;
    }
  }
  @Input() set Data(item: any) {
    if (item) {
      const eventGuId = this.localstorageService.getLoginUserEventGuId();
      this.userService.getUsersList(eventGuId).subscribe(
        (res) => {
          if (res) {
            for (let i = 0; i < res.length; i++) {
              if (res[i].firstname || res[i].lastName) {
                this.assigneeList.push({
                  itemName: res[i].firstname + " " + res[i].lastname,
                  id: res[i].userId,
                });
              }
            }

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
            this.getNotification(item);
            this.isAssigneeloader = false;
          }
        },
        (err) => {}
      );

      this.commonAPIMethodService.getScheduleRepeatTypes().subscribe(
        (res: any) => {
          for (let i = 0; i < res.length; i++) {
            this.repeatList.push({
              itemName: res[i].field,
              id: res[i].valueID,
            });
          }
        },
        (err) => {}
      );
      if (this.commonMethodService.localDonorList.length == 0) {
        this.commonMethodService.getDonorList();
      }
    }
  }
  ngOnInit() {
    $(".editor_cls").each(function () {
      this.Editor.replace(this, {
        height: 100,
        removePlugins: "blockquote",
      });
    });
  }
  setclsClickedComplete = "";
  setclsClickedDelete = "";
  onMarkCompleted(statusIdPass: number) {
    if (statusIdPass == 3) {
      if (this.btnTitleMarkComplete == "Completed") {
        statusIdPass = 1;
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

    this.isSelectedNotification = false;
    this.isloading = true;
    this.statusId = statusIdPass;

    this.statusLabel = this.getStatusLabel(this.statusId);
    this.status_labelClass = this.getStatusClass(this.statusId);
    let obj = {
      EventGuId: this.localstorageService.getLoginUserEventGuId(),
      NotificationId: this.notificationId,
      TypeId: this.typeID,
      CategoryId: this.categoryID,
      Title: this.title,
      DueDateTime: this.dueDate,
      AssigneeId: this.assigneeId[0].id,
      Note: this.note,
      StatusId: statusIdPass,
      LinkDonorId: this.selectedDonorId,
      LoginUserId: this.localstorageService.getLoginUserId(),
      Email: this.email,
      Phone: this.phone,
      NotifySMS: this.notifySMS,
      NotifyEmail: this.notifyEmail,
      recordTypeId: this.recordTypeId,
    };
    this.notificationService.saveNotification(obj).subscribe(
      (res) => {
        if (res) {
          this.isloading = false;
          this.GetListData();
        }
      },
      (err) => {
        this.isloading = false;
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
        }).then(() => {});
      }
    );
  }
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

  getNotification(data) {
    this.isloading = true;
    if (data) {
      this.alertInfo = data.alertInfo;
      this.linkedToAlertID = data.linkedToAlertID;
      this.isAttachedTrans = data.recordId == null ? true : false;
      this.linkDonor = data.linkDonorId == null ? false : true;
      this.dueDate = data.dueDateTime
        ? moment(data.dueDateTime).format("MM/DD/YYYY h:mmA")
        : "";
      this.EngPlaceholder = data.dueDateTime
        ? moment(data.dueDateTime).format("MM/DD/YYYY h:mmA")
        : "";
      this.userCreatedName = data.userCreatedName;
      this.selectedDateRange = data.dueDateTime
        ? {
            startDate: moment(data.dueDateTime),
            endDate: moment(data.dueDateTime),
          }
        : "";
      this.assignee = data.assignee ? data.assignee : "";
      this.email = data.email ? data.email : "";
      this.phone = data.phone ? data.phone : "";
      this.notifyEmail = data.notifyEmail;
      this.notifySMS = data.notifySMS;
      this.note = data.note ? data.note : "";
      this.transactionTypeTxt =
        data.recordId != null ? "ATTACHED TO " + data.recordType : "ATTACH TO";
      this.transactionType = data.recordType;
      this.paymentDate = data.transactionDate;
      this.paymentDateJewish = data.transactionJewishDate;
      this.fullName = data.fullName;
      this.fullNameJewish = data.fullNameJewish;
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
      this.fullNameJewish = data.fullNameJewish;
      this.father = data.father;
      this.fatherInLaw = data.fatherInLaw;
      this.phoneNumber = data.phone;
      this.address = data.address;
      this.linkDonorId = data.linkDonorId;
      this.recordTypeId = data.recordTypeID;
      this.recordId = data.recordId;
      this.repeatId = this.repeatList.filter(
        (x) => x.id == data.recurringTypeId
      );
      this.assigneeEmail = data.assigneeEmail;
      this.assigneePhone = data.assigneePhone;
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

      this.notificationId = data.notificationId;
      this.selectedDonorId = data.linkDonorId;

      this.assigneeId = Array.isArray(data.assigneeId)
        ? data.assigneeId
        : this.assigneeList.filter((x) => x.id == data.assigneeId);
      this.categoryID = data.categoryID;
      this.typeID = data.typeID;
      this.recordId = data.recordId;
      this.isSelectedNotification = true;
      this.statusId = data.statusId;
      this.setclsClickedComplete = "";
      this.setclsClickedDelete = "";
      this.isLinkedDonorCard = this.selectedDonorId != null ? false : true;
      this.phone_linkDonar = data.phone;
      this.email_linkDonar = data.email;
      this.address_linkDonar = data.address;
      this.createdDate = data.createdDate;
      this.repeatId = this.repeatList.filter(
        (x) => x.itemName == data.recurringType
      );
      this.notificationComments = data.notificationComments.reverse();
      this.recurringType = data.recurringType;
      this.scheduleStatus = data.scheduleStatus;
      $(".clicked-complete").removeClass("clicked-complete");
      $(".clicked-delete").removeClass("clicked-delete");
      if (data.status == "Completed") {
        this.btnTitleMarkComplete = "Completed";
        this.setclsClickedComplete = " btn-wrap-completed";
      } else {
        this.btnTitleMarkComplete = "Mark Complete";
        this.setclsClickedComplete = "";
      }

      this.statusLabel = this.getStatusLabel(data.statusId);
      this.status_labelClass = this.getStatusClass(data.statusId);

      this.getEmailDwn(data.assigneeId);
      this.getPhoneDwn(data.assigneeId);
    }
    this.isloading = false;
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

  getNotificationById() {
    let eventGuid = this.localstorageService.getLoginUserEventGuId();
    this.notificationComments = [];
    this.notificationService
      .getNotificationById(this.notificationId, eventGuid)
      .subscribe((res) => {
        if (res) {
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
          this.linkDonorId = res.linkDonorId;
        }
      });
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
    let text = $("#donorText")
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
    this.isAttachedTrans = true;
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
    } else {
      this.getCommonNotification(
        this.commonMethodService.getTranslate("WARNING_SWAL.STOP_TEXT_REMINDER")
      ).then((result) => {
        if (result.value) {
          this.SaveNotification();
        }
      });
    }
  }

  search(keyword) {
    let record = this.commonMethodService.donorList;
    keyword = keyword.toLowerCase();
    let filterdRecord;
    if (keyword != "") {
      let searchArray = keyword.split(" ");
      for (let searchValue of searchArray) {
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
          for (let i = 0; i < filterdRecord.length; i++) {
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
    this.activeModal.dismiss();
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

      this.assigneeId = this.assigneeId;

      this.SaveNotification();
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
        let eventGuid = this.localstorageService.getLoginUserEventGuId();
        this.pledgeService
          .GetPledgeCard(eventGuid, objResponse.pledgeId)
          .subscribe((res: any) => {
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
    let assignee = this.assigneeList.filter((x) => x.id == data.id);
    this.assignee = assignee[0].itemName;
    this.assigneeId = assignee;

    this.SaveNotification();
    this.getEmailDwn(this.assigneeId.map((x) => x.id).toString());
    this.getPhoneDwn(this.assigneeId.map((x) => x.id).toString());
  }

  SelectRepeat(data) {
    let repeat = this.repeatList.filter((x) => x.id == data.id);
    this.repeatId = repeat;
    this.SaveNotification();
  }

  RemoveLinkedDonor() {
    this.selectedDonorId = 0;
    this.isLinkedDonorCard = true;
    this.donor = null;
    this.nonEditable = false;
    this.linkDonor = false;

    this.RemoveLinkedTransaction();
  }

  RemoveLinkedTransaction() {
    this.assigneeId = this.assigneeId;
    this.isAttachedTrans = true;
    this.recordId = undefined;
    this.recordTypeId = this.recordTypeId;
    this.transactionType = null;
    this.transactionTypeTxt = "ATTACH TO ";
    this.showPaymentBox = false;
    this.linkDonor = this.selectedDonorId == 0 ? false : true;
    this.SaveNotification();
  }

  SaveNotification() {
    this.isloading = true;
    if (this.notificationId != undefined) {
      let obj = {
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
        recordTypeId: this.recordTypeId,
        linkedToAlertID: this.linkedToAlertID,
        RecurringModel: {
          RecurringCount: null,
          RecurringType: this.repeatId
            ? this.repeatId.map((s) => s.id).toString()
            : 0,
          ScheduleDateTime: null,
        },
      };
      this.notificationService.saveNotification(obj).subscribe(
        (res) => {
          if (res) {
            this.isloading = false;
            this.getNotificationById();
          } else {
            this.isgridDisable = false;
          }
        },
        (err) => {
          this.isloading = false;
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
          }).then(() => {});
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
  }

  onDeleteStatus(statusIdPass: number) {
    this.onMarkCompleted(statusIdPass);
  }

  notificationSearch(keyword) {
    let filterdRecord = [];
    let oldfilterRecord = [];

    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      let searchArray = keyword.split(" ");
      for (let searchValue of searchArray) {
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

  isRangeSelected = false;
  isinitializeSecond: number = 0;
  datesUpcomingUpdated(event) {
    if (this.isinitializeSecond == 1) {
      this.isloading = true;
      this.selectedUpcomingDateRange = event;

      this.isRangeSelected == true
        ? $("#upcomingcalendar").removeClass("custom_range")
        : $("#upcomingcalendar").addClass("custom_range");
      this.isRangeSelected = false;
    }
    if (
      this.selectedUpcomingDateRange.startDate &&
      this.selectedUpcomingDateRange.endDate
    ) {
    } else {
    }
  }
  upcomingRangeClicked(event) {
    this.isRangeSelected = true;
  }

  public onReady(editor) {
    let itemCls = editor.ui.view.toolbar.items._items;
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
    let obj = {
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
        }
      },
      (err) => {
        this.isloading = false;
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
        }).then(() => {});
      }
    );
  }

  isHebrew_lng(s) {
    let c,
      whietlist =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (c in s)
      if (!whietlist.includes(s[c])) {
        if (s[c] != " ") {
          return true;
        }
      }
    return false;
  }
  seperateHebrewAndEnglishName(str) {
    let re =
      /(^|[^\u0590-\u05FF])([\u0590-\u05FF]+)(?![\u0590-\u05FF])|(\b[a-z)-9\s]+\b)/gi;
    let res = [];
    let m;
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
  }

  openCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true,
      "notificationDynamicsCalender",
      "modal-transaction-calender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "NotificationSidebar" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngPlaceholder = moment(this.selectedDateRange.startDate).format(
            "YYYY-MM-DD h:mmA"
          );
          this.dueDate = moment(this.selectedDateRange.startDate).format(
            "YYYY-MM-DD h:mmA"
          );
          this.assigneeId = this.assigneeId;
          this.SaveNotification();
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
