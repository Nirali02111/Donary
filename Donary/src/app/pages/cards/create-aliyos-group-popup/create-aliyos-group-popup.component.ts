import { Component, Input, OnInit, ViewChild } from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { HebrewCalendar, HDate } from "@hebcal/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import * as moment from "moment";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { CreateAliyosComponent } from "../create-aliyos/create-aliyos.component";
import { Subscription } from "rxjs";
@Component({
  selector: "app-create-aliyos-group-popup",
  templateUrl: "./create-aliyos-group-popup.component.html",
  styleUrls: ["./create-aliyos-group-popup.component.scss"],
  standalone: false,
})
export class CreateAliyosGroupPopupComponent implements OnInit {
  isDropDown: boolean = false;
  modalOptions: NgbModalOptions;

  latestEvents = [];
  options: any;
  isFormSubmitted: boolean = false;
  createAliosActionForm: UntypedFormGroup;

  EngHebCalPlaceholder: string = moment(new Date()).format("YYYY-MM-DD");
  class_id: string;
  class_hid: string;

  selectedDate: any = { startDate: moment(new Date()) };

  private calendarSubscription: Subscription;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  PageName: any = "EditAliyosCard";
  popTitle: any;
  isOneDate: any = true;

  get GroupTitleControl() {
    return this.createAliosActionForm.get("groupTitle");
  }

  get CampaignIdControl() {
    return this.createAliosActionForm.get("campaignId");
  }

  get AliyosDateControl() {
    return this.createAliosActionForm.get("aliyosDate");
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private fb: UntypedFormBuilder,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    this.commonMethodService.isAliyosSaved.next(false);
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    this.getHebrewDates();
    let events = HebrewCalendar.calendar(this.options);
    let latest4Events = [];
    for (let ev of events) {
      const hd = ev.getDate();
      const date = hd.greg();
      let checkEvent = ev.render("he-x-NoNikud");
      let checkErev = checkEvent.includes("ערב");
      let checkChanuka = checkEvent.includes("חנוכה");
      let checkKatan = checkEvent.includes("קטן");
      let checkBanos = checkEvent.includes("בנות");
      let checkShushan = checkEvent.includes("שושן");
      let checkTu = checkEvent.includes("טו");
      let checkSelichos = checkEvent.includes("סליחות");
      let checkShaini = checkEvent.includes("שני");
      let checkBehaima = checkEvent.includes("בהמה");
      let checklag = checkEvent.includes("בעומר");
      let checkTisha = checkEvent.includes("באב");
      if (
        !checkErev &&
        !checkKatan &&
        !checkChanuka &&
        !checkBanos &&
        !checkShushan &&
        !checkTu &&
        !checkSelichos &&
        !checkShaini &&
        !checkBehaima &&
        !checklag &&
        !checkTisha
      ) {
        this.latestEvents.push({
          englishDate: moment(date).format("YYYY-MM-DD").toString(),
          hebrewDate: ev.render("he-x-NoNikud"),
        });
      }
    }
    if (this.latestEvents.length > 4) {
      for (let index = 0; index < 4; index++) {
        let removed = this.latestEvents.pop();
        latest4Events.push(removed);
      }
      this.latestEvents = latest4Events;
    }
    this.initForm();
    this.commonMethodService.isAliyosSaved.subscribe((val) => {
      if (val) {
        this.activeModal.dismiss();
      }
    });

    if (this.latestEvents[0] != null) {
      this.onRadioChange(this.latestEvents[0]);
    }
  }

  initForm() {
    this.createAliosActionForm = this.fb.group({
      groupTitle: this.fb.control("", Validators.required),
      campaignId: this.fb.control("", Validators.required),
      aliyosDate: this.fb.control("", Validators.required),
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  openAliyesWindow() {
    this.isFormSubmitted = true;
    if (this.createAliosActionForm.invalid) {
      return false;
    }
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup aliyasPledge_modal aliyasPledge_modal_group_new modal-popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      CreateAliyosComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AliyosData = this.createAliosActionForm.value;
    modalRef.componentInstance.emtOutputAliyos.subscribe((res: any) => {
      if (res) {
        this.activeModal.dismiss();
      }
    });
  }

  OnCampaignDeSelect() {
    this.CampaignIdControl.patchValue = undefined;
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  onRadioChange(selectedItem: any) {
    this.EngHebCalPlaceholder = selectedItem.englishDate;
    this.AliyosDateControl.setValue(selectedItem);
    selectedItem.englishDate = moment(selectedItem.englishDate)
      .format("MM/DD/yyyy")
      .toString();
    let dateValue = `${selectedItem.englishDate} - ${selectedItem.hebrewDate}`;
    this.GroupTitleControl.setValue(dateValue);
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDate,
      true,
      "aliyosDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "EditAliyosCard" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDate = items.obj;
          let engDate = moment(this.selectedDate.startDate)
            .format("YYYY-MM-DD")
            .toString();
          let date = { englishDate: engDate, hebrewDate: null };
          this.AliyosDateControl.setValue(date);
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.setGroupTitleDate(this.EngHebCalPlaceholder, date);
        }
      });
  }

  setGroupTitleDate(dateString: string, date: any) {
    // Regular expression for Hebrew characters
    const hebrewRegex = /[\u0590-\u05FF]/;
    if (hebrewRegex.test(dateString)) {
      this.GroupTitleControl.setValue(dateString);
    } else {
      this.GroupTitleControl.setValue(date.englishDate);
    }
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  getHebrewDates() {
    // Get today's Hebrew date
    const today = new Date();
    const hebToday = new HDate(new Date());
    let dateHeb1 = hebToday;

    const fourWeeksBefore = new HDate(
      new Date(today.getTime() - 5 * 7 * 24 * 60 * 60 * 1000)
    );
    let dateHeb2 = fourWeeksBefore;

    this.options = {
      start: dateHeb2,
      end: dateHeb1,
      sedrot: true,
      noModern: true,
      noSpecialShabbat: true,
      noMinorFast: true,
      noRoshChodesh: true,
    };
  }
}
