import {
  Component,
  Input,
  OnInit,
  Renderer2,
  EventEmitter,
  Output,
  ViewChild,
  inject,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { NotificationService } from "src/app/services/notification.service";
import Swal from "sweetalert2";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import * as moment from "moment";
import { UserService } from "src/app/services/user.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorTransactionCardPopupComponent } from "../../cards/donor-transaction-card-popup/donor-transaction-card-popup.component";
import { CardService } from "src/app/services/card.service";
import { PledgeService } from "src/app/services/pledge.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

import { Subscription } from "rxjs";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;

@Component({
  selector: "app-reminder-popup",
  templateUrl: "./reminder-popup.component.html",
  standalone: false,
  styleUrls: ["./reminder-popup.component.scss"],
})
export class ReminderPopupComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  selectedDate: any;
  PageName: any = "ReminderPopupPage";
  isOneDate: any = true;
  isloading: boolean = false;
  assigneeId: any;
  //ReminderForm: FormGroup;
  notificationId: number;
  typeId: number;
  popTitle: any;
  title: any;
  recordId: number;
  recordTypeId: number;
  note: any;
  CategoryId: number;
  notificationTypeList = [];
  notificationCategoryList = [];
  assigneeList = [];
  RepeatList = [];
  notificationStatusList = [];
  notifySMS: boolean = false;
  notifyEmail: boolean = false;
  email: string;
  phone: string;
  repeatId: any;
  attachedId: any;
  filedClass: string = "";
  showBox: boolean = true;
  showPaymentBox: boolean = false;
  isGlobalList: boolean = false;
  nonEditable: boolean = false;
  donor: string;
  selectedDonorId: number;
  displaySearchIcon = true;
  attachedToList = [];
  dateOptionList = [];
  dueDateTime: string;
  dueDateTimePart: string;
  displayTransactionButton = false;
  modalOptions: NgbModalOptions;
  objAdvancedSearch: any;
  campaignId: any;
  startDate = moment(new Date());
  endDate: any = null;
  selectedDateRange = moment(new Date());
  isSearchDisable: boolean = true;
  transactionType: string;
  SelectedPaymentArray = [];
  isloader = false;
  paymentDate: string;
  paymentDateJewish: string;
  fullName: string;
  fullNameJewish: string;
  amount: any;
  status_class: string;
  paymenttype_icn: string;
  status: string;
  campaignName: string;
  locationName: string;
  isAssigneeloader: boolean = true;
  isLinkedDonor: boolean = false;
  isDateSelected: boolean = false;
  linkedToAlertID: number;
  accountID: number;
  recordType: string;
  EngHebCalPlaceholder: string = "";
  class_id: string;
  class_hid: string;
  skeletonitems: any = [{}, {}, {}, {}, {}];
  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputUpdateCard: EventEmitter<any> = new EventEmitter();
  private calendarSubscription: Subscription;
  @Input() set donorDetails(donorDetailsValue: any) {
    this.donor =
      donorDetailsValue.jewishname != null
        ? donorDetailsValue.jewishname
        : donorDetailsValue.fullname;
    this.selectedDonorId = donorDetailsValue.accountId;
    this.recordId = donorDetailsValue.accountId;
    this.isSearchDisable = true;
    this.showBox = false;
    this.nonEditable = true;
    this.displaySearchIcon = false;
    this.displayTransactionButton = true;
    this.isloader = false;
    this.recordTypeId = 4;
    this.commonMethodService.isLoaderNewTrans = false;
  }
  @Input() set transactionDetails(trans: any) {
    this.SelectedPaymentArray = [];
    this.SelectedPaymentArray.push(trans.details);
    this.recordId = trans.details.paymentId;
    this.paymentDate = trans.details.paymentDate;
    this.transactionType = "Payment";
    this.recordTypeId = 1;
    this.donor =
      trans.details.fullNameJewish != null
        ? trans.details.fullNameJewish
        : trans.details.fullName;
    this.selectedDonorId = trans.details.accountId;
    this.paymentDateJewish = trans.details.paymentDateJewish;
    this.fullName = trans.details.fullName;
    this.fullNameJewish = trans.details.fullNameJewish;
    this.amount = trans.details.amount;
    if (trans.details.status == "Success") {
      this.status_class = "paymnt_success";
    } else if (trans.details.status == "Declined") {
      this.status_class = "paymnt_declined";
    } else if (trans.details.status == "Error") {
      this.status_class = "paymnt_error";
    } else if (trans.details.status == "Voided") {
      this.status_class = "paymnt_voided";
    } else if (trans.details.status == "Refunded") {
      this.status_class = "paymnt_refunded";
    } else if (trans.details.status == "Processing") {
      this.status_class = "paymnt_processing";
    }
    if (trans.details.paymentType == "Cash") {
      this.paymenttype_icn = "cash_icon";
    } else if (trans.details.paymentType == "Check") {
      this.paymenttype_icn = "check_icon";
    } else if (trans.details.paymentType == "OJC") {
      this.paymenttype_icn = "ojc_icon";
    } else if (trans.details.paymentType == "Credit Card") {
      this.paymenttype_icn = "creditcard_icon";
    } else if (trans.details.paymentType == "Other") {
      this.paymenttype_icn = "other_icon";
    }

    this.status = trans.details.status;
    this.campaignName = trans.details.campaignName;
    this.locationName = trans.details.locationName;
    this.showPaymentBox = true;
    this.isSearchDisable = true;
    this.showBox = false;
    this.nonEditable = true;
    this.displaySearchIcon = false;
    this.displayTransactionButton = true;
  }

  @Input() set pledgeDetails(trans: any) {
    this.SelectedPaymentArray = [];
    this.SelectedPaymentArray.push(trans.details);
    this.recordTypeId = 2;
    this.transactionType = "Pledge";
    this.recordId = trans.details.pledgeId;
    this.paymentDate = trans.details.pledgeDate;
    this.paymentDateJewish = trans.details.pledgeJewishDate;
    this.fullName = trans.details.donor;
    this.fullNameJewish = trans.details.donorJewishName;
    this.donor =
      trans.details.donorJewishName != null
        ? trans.details.donorJewishName
        : trans.details.donor;
    this.selectedDonorId = trans.details.accountId;
    this.amount = trans.details.totalAmount;
    if (trans.details.status == "Paid") {
      this.status_class = "pledge_paid";
    } else if (trans.details.status == "Open") {
      this.status_class = "pledge_open";
    } else if (trans.details.status == "Partially Paid") {
      this.status_class = "pledge_partial";
    } else if (trans.details.status == "Voided") {
      this.status_class = "pledge_void";
    }
    this.status = trans.details.status;
    this.paymenttype_icn = "";
    this.campaignName = trans.details.campaign;
    this.locationName = trans.details.location;
    this.showPaymentBox = true;
    this.isSearchDisable = true;
    this.showBox = false;
    this.nonEditable = true;
    this.displaySearchIcon = false;
    this.displayTransactionButton = true;
  }

  @Input() set scheduleDetails(trans: any) {
    this.SelectedPaymentArray = [];
    this.SelectedPaymentArray.push(trans.details);
    this.recordTypeId = 3;
    this.transactionType = "Schedule";
    this.recordId = trans.details.scheduleId;
    this.paymentDate = trans.details.nextScheduleDt;
    this.paymentDateJewish = trans.details.nextScheduleDtJewish;
    this.fullName = trans.details.accountName;
    this.fullNameJewish = trans.details.accountNameJewish;
    this.amount = trans.details.openAmount;
    this.donor =
      trans.details.accountNameJewish != null
        ? trans.details.accountNameJewish
        : trans.details.accountName;
    this.selectedDonorId = trans.details.accountId;
    if (trans.details.scheduleStatus == "Cancelled") {
      this.status_class = "schdl_canceled";
    } else if (trans.details.scheduleStatus == "Completed") {
      this.status_class = "schdl_completed";
    } else if (trans.details.scheduleStatus == "Failed") {
      this.status_class = "schdl_failed";
    } else if (trans.details.scheduleStatus == "Pending") {
      this.status_class = "schdl_pending";
    } else if (trans.details.scheduleStatus == "Scheduled") {
      this.status_class = "schdl_scheduled";
    } else if (trans.details.scheduleStatus == "Paused") {
      this.status_class = "schdl_paused";
    }
    this.status = trans.details.scheduleStatus;
    this.paymenttype_icn = "";
    this.campaignName = trans.details.campaignName;
    this.locationName = trans.details.locationName;
    this.showPaymentBox = true;
    this.isSearchDisable = true;
    this.showBox = false;
    this.nonEditable = true;
    this.displaySearchIcon = false;
    this.displayTransactionButton = true;
  }
  @Input() set alertDetails(details: any) {
    if (details) {
      this.linkedToAlertID = details.alertId;
      this.accountID = details.accountID;
      this.recordId = details.recordID;
      this.recordType = details.recordType;
      this.isloading = true;
      this.commonMethodService.donorList =
        this.commonMethodService.localDonorList.map((item) => {
          return { ...item, id: item.accountId };
        });
      if (
        this.commonMethodService.donorList &&
        this.commonMethodService.donorList.length > 0
      ) {
        this.SelectDonor(this.accountID, false, null);
        if (this.recordType == "Schedule") {
          this.getScheduleCard(this.recordId);
        }
        this.isloading = false;
      }
    }
  }
  @Input() isMobileView: boolean = false;
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public notificationService: NotificationService,
    public cardService: CardService,
    public pledgeService: PledgeService,
    protected userService: UserService,
    //private fb: FormBuilder,
    private localstorageService: LocalstoragedataService,
    private commonAPIMethodService: CommonAPIMethodService,
    private render: Renderer2,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    //this.divOnFocus()
    this.getFeatureSettingValues();
    this.attachedToList.push({
      itemName: "Payment",
      id: 1,
    });

    this.dateOptionList.push(
      {
        itemName: "PM",
      },
      {
        itemName: "AM",
      }
    );

    //get type list
    this.notificationService.getNotificationType().subscribe(
      (res) => {
        res = res.filter((o) => o.type == "Reminder");
        this.typeId = res.map((s) => s.id).toString();

        for (var i = 0; i < res.length; i++) {
          this.notificationTypeList.push({
            itemName: res[i].type,
            id: res[i].id,
          });
        }
      },
      (err) => {
        console.log("getNotificationType error", err.error);
      }
    );

    this.notificationService.GetNotificationCategory().subscribe(
      (res) => {
        for (var i = 0; i < res.length; i++) {
          this.notificationCategoryList.push({
            itemName: res[i].type,
            id: res[i].id,
          });
        }
      },
      (err) => {}
    );

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
          this.isAssigneeloader = false;
        }
      },
      (err) => {}
    );

    this.notificationService.GetNotificationStatus().subscribe(
      (res) => {
        for (var i = 0; i < res.length; i++) {
          this.notificationStatusList.push({
            itemName: res[i].type,
            id: res[i].id,
          });
        }
      },
      (err) => {}
    );

    this.commonAPIMethodService.getScheduleRepeatTypes().subscribe(
      (res: any) => {
        for (var i = 0; i < res.length; i++) {
          this.RepeatList.push({
            itemName: res[i].field,
            id: res[i].valueID,
          });
        }
      },
      (err) => {}
    );
    // this.ReminderForm = this.fb.group({
    //   EventGuId: this.localstorageService.getLoginUserEventGuId()),
    //   NotificationId: 0
    //   TypeId: 0
    //   CategoryId: 0
    //   Title: ""
    //   DueDateTime: ""
    //   AssigneeId: 0
    //   Note: ""
    //   ReportTypeId: 0
    //   ReportId: 0
    //   StatusId: 0
    //   LoginUserId: 0
    //   NotifySMS: true, Validators.compose([Validators.required, Validators.email])),
    //   NotifyEmail: true
    //   RecurringModel: this.fb.array([]),
    // });
  }

  divOnFocus() {
    $(document).click(function () {
      if ($(".donor_infolist").length > 0) {
        $(".donor_infolist").hide();
      }
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  setNotifySMS(event) {
    if (event.target.checked) {
      this.notifySMS = true;
    } else {
      this.notifySMS = false;
    }
  }

  setNotifyEmail(event) {
    if (event.target.checked) {
      this.notifyEmail = true;
    } else {
      this.notifyEmail = false;
    }
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

  inputFocusOut(e) {
    this.render.removeClass(e.target, "selected");
  }

  SaveReminderInfo() {
    this.linkedDonorValidation();
    if (this.isLinkedDonor) {
      return false;
    }
    this.selectedDatesValidation();
    if (this.isDateSelected) {
      return false;
    }
    if (this.assigneeId && this.assigneeId.length > 0) {
      $("#div_assignee_dwn").removeClass("dropdown-border-red");
    } else {
      $("#div_assignee_dwn").addClass("dropdown-border-red");
      return false;
    }
    this.isloading = true;
    var assigneeId = this.assigneeId
      ? this.assigneeId.map((s) => s.id).toString()
      : 0;
    var RecurringTypeId = this.repeatId
      ? this.repeatId.map((s) => s.id).toString()
      : 0;
    var obj = {
      EventGuId: this.localstorageService.getLoginUserEventGuId(),
      NotificationId: 0,
      TypeId: this.typeId,
      CategoryId: 0,
      Title: this.title,
      DueDateTime:
        this.selectedDate != undefined
          ? this.selectedDate != null
            ? moment(this.selectedDate).format("YYYY-MM-DD h:mmA")
            : null
          : null,
      AssigneeId: assigneeId,
      Note: this.note,
      ReportTypeId: 0,
      ReportId: 0,
      StatusId: 0,
      LinkDonorId: this.selectedDonorId,
      RecordTypeId:
        !this.recordId && this.selectedDonorId ? 4 : this.recordTypeId,
      RecordId: this.recordId,
      LoginUserId: this.localstorageService.getLoginUserId(),
      Email: this.email,
      Phone: this.phone,
      NotifySMS: this.notifySMS,
      NotifyEmail: this.notifyEmail,
      RecurringModel: {
        RecurringCount: 0,
        RecurringType: RecurringTypeId,
        ScheduleDateTime: "2022-01-11T14:58:32.687Z",
      },
      LinkedToAlertID: this.linkedToAlertID,
    };
    this.notificationService.saveNotification(obj).subscribe(
      (res) => {
        if (res) {
          this.analytics.createdReminder();

          this.isloading = false;
          Swal.fire({
            title: "",
            text: "Reminder added successfully",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.emtOutputUpdateCard.emit(true);
            this.activeModal.dismiss();
          });

          this.emtOutputAdvancedFilterData.emit(obj);
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
          this.activeModal.dismiss();
        });
      }
    );
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

  search(keyword) {
    var record = this.commonMethodService.donorList;
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
                obj.emails.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
              (obj.additionalPhoneNumbers &&
                obj.additionalPhoneNumbers
                  .toString()
                  .toLowerCase()
                  .indexOf(searchValue) > -1))
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

  RemoveDonor() {
    this.nonEditable = false;
    this.donor = null;
    this.selectedDonorId = 0;
    this.displayTransactionButton = false;
    this.displaySearchIcon = true;
    this.isSearchDisable = false;
    this.RemoveAssignee();
  }
  onClickedOutside() {
    this.showBox = false;
  }

  RemoveAssignee() {
    this.showPaymentBox = false;
    this.transactionType = null;
  }

  SearchGlobalDonor() {
    var text = $("#donorrText")
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

  // OnGlobalCheckboxChange(event) {
  //   if (event.target.checked) {
  //     this.displaySearchIcon = true;
  //   } else {
  //     this.displaySearchIcon = false;
  //   }
  // }

  SelectDonor(accountId, isAddedFromCard, resValue = null) {
    this.isSearchDisable = true;
    this.showBox = false;
    this.nonEditable = true;
    this.displaySearchIcon = false;
    this.displayTransactionButton = true;
    this.selectedDonorId = accountId;
    if (isAddedFromCard) {
      this.commonMethodService.donorList = [resValue];
    } else {
      this.commonMethodService.donorList =
        this.commonMethodService.donorList.filter((s) => s.id == accountId);
    }
    this.donor = this.commonMethodService.donorList[0].fullNameJewish
      ? this.commonMethodService.donorList[0].fullNameJewish
      : this.commonMethodService.donorList[0].displayText;
    this.linkedDonorValidation();
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
      this.SelectedPaymentArray = [];
      this.SelectedPaymentArray.push(objResponse);
      if (
        objResponse.paymentId != objResponse.scheduleId &&
        objResponse.paymentId != objResponse.pledgeId
      ) {
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
            this.fullNameJewish =
              res.fullNameJewish === null || res.fullNameJewish === undefined
                ? res.fullName
                : res.fullNameJewish;
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
      } else if (objResponse.pledgeId != null) {
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
              this.fullName = res.donor;
              this.fullNameJewish = res.donorJewishName;
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
      } else if (objResponse.scheduleId != null) {
        this.recordTypeId = 3;
        this.recordId = objResponse.scheduleId;
        let objDonorCard = {
          eventGuId: this.localstorageService.getLoginUserEventGuId(),
          scheduleId: objResponse.scheduleId,
        };
        this.cardService.getScheduleCard(objDonorCard).subscribe((res: any) => {
          this.isloading = false;
          if (res) {
            this.paymentDate = res.nextScheduleDt;
            this.paymentDateJewish = res.nextScheduleDtJewish;
            this.fullName = res.accountName;
            this.fullNameJewish = res.accountNameJewish;
            this.amount = res.openAmount;
            if (res.scheduleStatus == "Cancelled") {
              this.status_class = "schdl_canceled";
            } else if (res.scheduleStatus == "Completed") {
              this.status_class = "schdl_completed";
            } else if (res.scheduleStatus == "Failed") {
              this.status_class = "schdl_failed";
            } else if (res.scheduleStatus == "Pending") {
              this.status_class = "schdl_pending";
            } else if (res.scheduleStatus == "Scheduled") {
              this.status_class = "schdl_scheduled";
            } else if (res.scheduleStatus == "Paused") {
              this.status_class = "schdl_paused";
            }
            this.status = res.scheduleStatus;
            this.campaignName = res.campaignName;
            this.locationName = res.locationName;
          }
        });
      }

      this.showPaymentBox = true;
      this.transactionType = objResponse.transactionType;
    });
  }
  onItemSelectAssignee(item: any) {
    this.isValidAssignee();
  }
  onDeSelectAllAssignee(items: any) {
    this.assigneeId = [];
    this.isValidAssignee();
  }
  isValidAssignee() {
    if (this.assigneeId && this.assigneeId.length > 0) {
      $("#div_assignee_dwn").removeClass("dropdown-border-red");
    } else {
      $("#div_assignee_dwn").addClass("dropdown-border-red");
    }
  }
  linkedDonorValidation() {
    if (this.selectedDonorId) {
      this.isLinkedDonor = false;
      return;
    }
    this.isLinkedDonor = true;
  }

  selectedDatesValidation() {
    if (this.selectedDate != null) {
      this.isDateSelected = false;
      return;
    }
    this.isDateSelected = true;
  }

  getScheduleCard(scheduleId) {
    this.recordTypeId = 3;
    this.recordId = scheduleId;
    let objDonorCard = {
      eventGuId: this.localstorageService.getLoginUserEventGuId(),
      scheduleId: scheduleId,
    };
    this.cardService.getScheduleCard(objDonorCard).subscribe((res: any) => {
      this.isloading = false;
      if (res) {
        this.SelectedPaymentArray = [];
        this.SelectedPaymentArray.push(res);
        this.paymentDate = res.nextScheduleDt;
        this.paymentDateJewish = res.nextScheduleDtJewish;
        this.fullName = res.accountName;
        this.fullNameJewish = res.accountNameJewish;
        this.amount = res.openAmount;
        this.status = res.scheduleStatus;
        this.campaignName = res.campaignName;
        this.locationName = res.locationName;
        this.showPaymentBox = true;
        this.transactionType = res.transactionType;
        const cls = "schdl";
        const scheduleStatus = res.scheduleStatus.toLowerCase();
        this.status_class = `${cls}_${scheduleStatus}`;
        this.transactionType = "Schedule";
      }
    });
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDate,
      true
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "ReminderPopupPage" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDate = items.obj.startDate;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
        }
      });
  }
  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_reminder";
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

  onDeSelectAll() {
    this.repeatId = null;
  }

  AddNewDonor() {
    this.commonMethodService.AddNewDonor().then((value) => {
      if (value) {
        this.SelectDonor(value.accountId, true, value);
      }
    });
  }
}
