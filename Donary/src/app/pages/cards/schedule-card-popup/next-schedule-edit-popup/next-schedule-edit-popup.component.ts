import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import Swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-next-schedule-edit-popup",
  templateUrl: "./next-schedule-edit-popup.component.html",
  standalone: false,
  styleUrls: ["./next-schedule-edit-popup.component.scss"],
})
export class NextScheduleEditPopupComponent implements OnInit {
  @Output() emtOutputDate: EventEmitter<any> = new EventEmitter();

  frequencyId: number;
  frequency: string;
  donationAmount: string;
  count: string;
  selectedStartDate: any = {
    startDate: moment(new Date()),
    endDate: moment(new Date()),
  };
  minDate: any = moment(new Date());
  amtPerPayment: string;

  countMaxLength: number = 1;

  isCountError: boolean = false;
  isAmtPerPaymentError: boolean = false;

  @Input() set ScheduleCardData(obj: any) {
    if (obj) {
      this.count = obj.repeatTimes;
      this.donationAmount = obj.totalAmount;
      this.countMaxLength = Number(this.donationAmount).toString().length;
      this.frequency = obj.frequency;
      this.amtPerPayment = (
        Number(this.donationAmount) / Number(this.count)
      ).toFixed(2);

      this.frequencyId = obj.frequencyId;
      this.bindData();
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".popup_header",
      });
    });
  }

  bindData() {
    if (!this.frequencyId || this.frequencyId == 0) {
      this.commonMethodService.selectedScheduleRepeatTypes = [
        { id: 4, itemName: "Monthly" },
      ];
    } else {
      this.commonMethodService.selectedScheduleRepeatTypes = [
        { id: this.frequencyId, itemName: this.frequency },
      ];
    }
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  getNgClass() {
    return {
      "btn-primary": this.selectedStartDate.startDate !== null,
      "popup-send-nxt-btn-disable": this.selectedStartDate.startDate === null,
    };
  }

  getMaxCountLength() {
    return this.donationAmount.length;
  }

  getSetting() {
    return {
      ...this.commonMethodService.setDropDownSettings("", 2, false, true),
      //disabled: true
    };
  }

  onSaveChanges() {
    if (this.selectedStartDate.startDate !== null) {
      this.emtOutputDate.emit(
        this.selectedStartDate.startDate.format("YYYY-MM-DD")
      );

      setTimeout(() => {
        this.activeModal.dismiss();
      }, 250);
    }
  }

  ChangeCount(event) {
    if (event.target.value == "") {
      this.amtPerPayment = "";
      this.isCountError = true;
    } else {
      this.isCountError = false;
      if (Number(this.donationAmount) != 0) {
        this.count = event.target.value;
        this.calculateAmtPerPayment();
      }
    }
  }

  calculateAmtPerPayment() {
    this.amtPerPayment = (
      Number(this.donationAmount) / Number(this.count)
    ).toFixed(2);
  }

  FormatAmt() {
    this.donationAmount = Number(this.donationAmount).toFixed(2);
  }

  ChangeAmtPerPayment(event) {
    if (event.target.value != "") {
      if (this.count != "") {
        this.amtPerPayment = event.target.value;
        this.count = (
          Number(this.donationAmount) / Number(this.amtPerPayment)
        ).toFixed(2);

        let chek = Math.floor(Number(this.count));

        if (chek.toString().length > this.countMaxLength) {
          this.isCountError = true;
        } else {
          this.isCountError = false;
        }
      }
    } else {
      this.isAmtPerPaymentError = true;
    }
  }

  deleteSchedule() {
    Swal.fire({
      title: "Are you sure you want to delete this schedule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel payments!",
      cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
    }).then((result) => {
      if (result.value) {
      } else {
      }
    });
  }
}
