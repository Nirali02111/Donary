import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Input,
} from "@angular/core";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "./../../../../commons/common-methods.service";
import * as moment from "moment";

@Component({
  selector: "app-next-schedule-date-popup",
  templateUrl: "./next-schedule-date-popup.component.html",
  styleUrls: ["./next-schedule-date-popup.component.scss"],
  standalone: false,
})
export class NextScheduleDatePopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  modalOptions: NgbModalOptions;
  isloading: boolean;

  status: string = "";
  @Input("scheduleObj") scheduleObj: any = {};

  @Output() emtOutputDate: EventEmitter<any> = new EventEmitter();
  @Output() leavePastDate: EventEmitter<any> = new EventEmitter();

  @Output() OnSimpleResume: EventEmitter<any> = new EventEmitter();
  @Output() OnLeaveAsIt: EventEmitter<any> = new EventEmitter();
  @Output() OnDateSelected: EventEmitter<any> = new EventEmitter();

  selectedDate: any = {
    startDate: moment(new Date()),
    endDate: moment(new Date()),
  };
  minDate: any = moment(new Date());

  isSubmenuOpen: boolean = false;
  nextDateEnable: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {}

  canPauseIndividual(): Boolean {
    return this.status === "Scheduled";
  }

  canResumeIndividual(): Boolean {
    return this.status === "Paused";
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  checkForSubmenu() {
    let nextDt = moment(this.scheduleObj.scheduleDate);
    let today = moment(new Date());
    if (nextDt.diff(today, "days") < 0) {
      return true;
    } else {
      return false;
    }
  }

  isDisable() {
    if (this.selectedDate.startDate === null) {
      return true;
    }
    return false;
  }

  openSubmenu(event) {
    this.isSubmenuOpen = true;
  }

  onResumeClickNew() {
    this.nextDateEnable = true;
  }

  onSimpleResume() {
    const emtData = {
      scheduleId: this.scheduleObj.scheduleId
        ? this.scheduleObj.scheduleId
        : this.scheduleObj.pledgeId,
      scheduleDate: this.scheduleObj.scheduleDate
        ? this.scheduleObj.scheduleDate
        : this.scheduleObj.pledgeDate,
      newScheduleDate: this.scheduleObj.scheduleDate
        ? this.scheduleObj.scheduleDate
        : this.scheduleObj.pledgeDate,
    };

    this.OnSimpleResume.emit(emtData);
  }

  onLeaveClick() {
    const emtData = {
      scheduleId: this.scheduleObj.scheduleId,
      scheduleDate: this.scheduleObj.scheduleDate,
      newScheduleDate: this.scheduleObj.scheduleDate,
    };

    this.OnSimpleResume.emit(emtData);
  }

  resumeSaved() {
    const emtData = {
      scheduleId: this.scheduleObj.scheduleId,
      scheduleDate: this.scheduleObj.scheduleDate,
      newScheduleDate: this.selectedDate.startDate.format("YYYY-MM-DD"),
    };
    this.OnSimpleResume.emit(emtData);
  }
}
