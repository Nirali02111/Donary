import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  inject,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { PledgeService } from "src/app/services/pledge.service";
import { CampaignService } from "src/app/services/campaign.service";

import { DaterangepickerDirective } from "ngx-daterangepicker-material";

import Swal from "sweetalert2";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-edit-pledge-popup",
  templateUrl: "./edit-pledge-popup.component.html",
  styleUrls: ["./edit-pledge-popup.component.scss"],
  standalone: false,
})
export class EditPledgePopupComponent implements OnInit {
  selectedDate: any;
  popTitle: any;
  isloading: boolean = true;
  amount: number;
  pledgeNum: number;
  pledgeId: number;
  donor: string;
  selectedDonorId: number;
  isGlobalList: boolean = true;
  displaySearchIcon = false;
  showBox: boolean = false;
  nonEditable: boolean = false;
  note: string;
  PageName: any = "EditPledgePopup";
  isOneDate: any = true;
  externalNote: string;
  divDisabled: boolean = false;
  modalOptions: NgbModalOptions;
  showDatepicker: boolean = false;
  campaignSetVal: string; //added new
  isPledgePayments: boolean = false;
  skeletonitems: any = [{}, {}];
  skeletonitems2: any = [{}, {}, {}, {}];
  isBlock: boolean = false;
  EngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  class_id: string;
  class_hid: string;

  @Output() emtEditPledge: EventEmitter<any> = new EventEmitter();
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild("donorInput") donorInput: ElementRef;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  private calendarSubscription: Subscription;
  @Input() set pledgePayments(item) {
    this.isPledgePayments = item;
  }
  @Input() set aliyaGroupId(item) {
    if (item) {
      this.isBlock = true;
    } else {
      this.isBlock = false;
    }
  }
  @Input() set EditPledgeData(PledgeCardValue: any) {
    this.isloading = true;
    this.clearSelection();
    if (PledgeCardValue) {
      this.setValue(PledgeCardValue);
    }
  }

  setValue(data) {
    this.nonEditable = true;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    if (data.accountId != null) {
      this.isloading = true;
      this.commonAPIMethodService
        .getDonors(eventGuId, "", data.accountId)
        .subscribe((res: Array<any>) => {
          this.isloading = false;
          if (res && res.length > 0) {
            this.donor = res[0].fullNameJewish
              ? res[0].fullNameJewish
              : res[0].fullName;
            this.selectedDonorId = res[0].accountId;
          } else {
            if (data.donorName || data.donorJewishName)
              this.donor = data.donorJewishName
                ? data.donorJewishName
                : data.donorName;
          }

          if (!this.donor) {
            this.nonEditable = false;
            this.donor = null;
          } else {
            this.nonEditable = true;
          }
        });
    }
    this.selectedDate = { startDate: moment(data.pledgeDate) };
    this.pledgeId = data.pledgeId;
    this.pledgeNum = data.pledgeNum;
    this.note = data.description;
    this.externalNote = data.externalNote;
    this.amount = data.amount;

    this.commonMethodService.selectedPaymentReasons =
      this.commonMethodService.localReasonList.filter(
        (s) => s.id == data.paymentReasonId
      );
    this.commonMethodService.selectedFromCampaignList =
      this.commonMethodService.localCampaignList.filter(
        (s) => s.id == data.campaignId
      );
    this.commonMethodService.selectedPaymentLocations =
      this.commonMethodService.localLocationList.filter(
        (s) => s.id == data.locationId
      );
    this.commonMethodService.selectedPaymentCollectors =
      this.commonMethodService.localCollectorList.filter(
        (s) => s.id == data.collectorId
      );
    this.isloading = false;
    this.campaignSetVal =
      this.commonMethodService.selectedFromCampaignList.length > 0
        ? this.commonMethodService.selectedFromCampaignList[0].itemName
        : "";
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private commonAPIMethodService: CommonAPIMethodService,
    private campaignService: CampaignService,
    private elementRef: ElementRef,
    private pledgeService: PledgeService,
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

  closePopup() {
    this.activeModal.dismiss();
  }

  clearSelection() {
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedPaymentCollectors = [];
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
    this.selectedDonorId = accountId;
    if (isAddedFromCard) {
      this.commonMethodService.donorList = [resValue];
      this.donor =
        this.commonMethodService.donorList[0].fullNameJewish != null
          ? this.commonMethodService.donorList[0].fullNameJewish
          : this.commonMethodService.donorList[0].fullName;
    } else {
      this.commonMethodService.donorList =
        this.commonMethodService.donorList.filter((s) => s.id == accountId);
      0;
      this.donor = this.commonMethodService.donorList[0].fullNameJewish
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0]?.displayText;
    }
    console.log("Donor", this.commonMethodService.donorList);
  }
  RemoveDonor() {
    this.nonEditable = false;
    this.donor = null;
    this.selectedDonorId = -1;
    this.donorInput.nativeElement.focus();
  }
  checkPledgePayments() {
    if (this.isPledgePayments) {
      Swal.fire({
        title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
        text: "Campaign & Reason info will be updated on payments applied",
        // icon: 'success',
        showCancelButton: true,
        confirmButtonText: "Save",
        cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
        confirmButtonColor: "#7b5bc4",
      }).then((result) => {
        if (result.value) {
          this.UpdatePledge();
        }
      });
    } else {
      this.UpdatePledge();
    }
  }

  UpdatePledge() {
    this.isloading = true;
    var objUpdatePledgeData: any = {};
    objUpdatePledgeData = {
      PledgeId: this.pledgeId,
      MacAddress: this.localstoragedataService.getLoginUserGuid(),
      Description: this.note,
      externalNote: this.externalNote,
      CollectorId:
        -this.commonMethodService.selectedPaymentCollectors.length != 0
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
          : 0,
      PledgeDate: moment(this.selectedDate.startDate).format("YYYY-MM-DD"),
      ReasonId:
        this.commonMethodService.selectedPaymentReasons.length != 0
          ? this.commonMethodService.selectedPaymentReasons.reduce((s) => s.id)
              .id
          : 0,
      AccountId: this.selectedDonorId,
      Amount: this.amount,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      //"StatusId": 0,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
    };
    this.pledgeService.updatePledge(objUpdatePledgeData).subscribe(
      (res: any) => {
        this.isloading = false;

        if (res) {
          this.analytics.editedPledge();
          Swal.fire({
            title: "",
            text: res,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.activeModal.dismiss();
          this.emtEditPledge.emit(res);
          this.commonMethodService.sendPledgeTrans(true);
        }
      },
      (error) => {
        Swal.fire({
          title: "",
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

  onVoidClick() {
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
        let objVoidPledge = {
          pledgeId: this.pledgeId,
          statusId: 3,
          accountId: this.selectedDonorId,
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        };
        this.pledgeService.updatePledge(objVoidPledge).subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              this.analytics.editedPledge();

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
                this.commonMethodService.sendPledgeTrans(true);
                this.emtEditPledge.emit(res);
              });
            } else {
              Swal.fire({
                title: "Try Again!",
                text: res,
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
      }
    });
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDate,
      true,
      "editPledgeDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "EditPledgePopup" &&
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
}
