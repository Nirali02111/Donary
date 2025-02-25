import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import {
  RateListObj,
  SeatMapLocationObj,
  SeatService,
  SectionObj,
} from "src/app/services/seat.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-add-seats-popup",
  templateUrl: "./add-seats-popup.component.html",
  standalone: false,
  styleUrls: ["./add-seats-popup.component.scss"],
})
export class AddSeatsPopupComponent implements OnInit {
  title = "Add seat rate";
  isLoading: boolean = false;

  locationDropdown: Array<SeatMapLocationObj> = [];
  sectionDropdown: Array<SectionObj> = [];

  formGroup!: UntypedFormGroup;

  @Input() seatRateData!: RateListObj;

  @Output() refresh = new EventEmitter();

  get MapLocationId() {
    return this.formGroup.get("mapLocationId");
  }

  get SectionId() {
    return this.formGroup.get("sectionId");
  }

  get SeatPrice() {
    return this.formGroup.get("seatPrice");
  }

  get AisleAdditionalFee() {
    return this.formGroup.get("aisleAdditionalFee");
  }

  constructor(
    public activeModal: NgbActiveModal,
    private fb: UntypedFormBuilder,
    private localStorageDataService: LocalstoragedataService,
    private seatAPIService: SeatService,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    this.getLocations();
    this.iniControl();

    const eventGuId = this.localStorageDataService.getLoginUserEventGuId();

    if (this.seatRateData) {
      this.formGroup.patchValue({
        rateID: this.seatRateData.rateId,
        mapLocationId: this.seatRateData.mapLocationId,
        sectionId: this.seatRateData.sectionId,
        seatPrice: this.seatRateData.seatPrice,
        aisleAdditionalFee: this.seatRateData.aisleAdditionalFee,
      });
    }

    this.formGroup.patchValue({
      eventGuId: eventGuId,
    });

    this.formGroup.updateValueAndValidity();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  private iniControl() {
    this.formGroup = this.fb.group({
      eventGuId: this.fb.control(null, Validators.compose([])),
      rateID: this.fb.control(null, Validators.compose([])),
      mapLocationId: this.fb.control(
        null,
        Validators.compose([Validators.required])
      ),
      sectionId: this.fb.control(
        null,
        Validators.compose([Validators.required])
      ),
      seatPrice: this.fb.control(
        null,
        Validators.compose([Validators.required])
      ),
      aisleAdditionalFee: this.fb.control(
        null,
        Validators.compose([Validators.required])
      ),
      isActive: this.fb.control(true, Validators.compose([])),
    });

    this.MapLocationId.valueChanges.subscribe((val) => {
      if (val) {
        this.SeatPrice.enable();
        this.AisleAdditionalFee.enable();
        this.SectionId.enable();
        this.getSection();
        return;
      }

      this.SeatPrice.disable();
      this.AisleAdditionalFee.disable();
      this.SectionId.disable();
    });

    this.SeatPrice.disable();
    this.AisleAdditionalFee.disable();
    this.SectionId.disable();
  }

  private getLocations() {
    const eventGuId = this.localStorageDataService.getLoginUserEventGuId();
    this.seatAPIService.getMapLocationsDropdown(eventGuId).subscribe((res) => {
      this.locationDropdown = res;
    });
  }

  private getSection() {
    const eventGuId = this.localStorageDataService.getLoginUserEventGuId();
    const apiPayload = {
      eventGuId,
      mapLocationID: Number(this.MapLocationId.value),
    };
    this.isLoading = true;
    this.seatAPIService.getSectionList(apiPayload).subscribe(
      (res) => {
        this.isLoading = false;
        this.sectionDropdown = res || [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  private getValues() {
    if (this.seatRateData) {
      return {
        ...this.formGroup.value,
      };
    }

    const { rateID, ...restValues } = this.formGroup.value;

    return {
      ...restValues,
    };
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      this.hasMissingFields();
      this.formGroup.markAllAsTouched();
      return;
    }

    this.doApiCall();
  }

  private doApiCall() {
    this.isLoading = true;

    const apiPayload = this.getValues();

    this.seatAPIService.saveRate(apiPayload).subscribe(
      (res) => {
        this.isLoading = false;
        this.closePopup();
        this.refresh.emit(true);
      },
      (err) => {
        this.isLoading = false;

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
        });
      }
    );
  }

  hasMissingFields(): boolean {
    const formControls = this.formGroup.controls;
    for (const controlName in formControls) {
      if (formControls.hasOwnProperty(controlName)) {
        const control = formControls[controlName];

        if (control.invalid && control.touched) {
          return true; // Return true if any missing field found
        }

        if (control.value == null || control.value == "") {
          return true; // Return true if any input is missing
        }
      }
    }
    return false; // Return false if no missing fields or inputs
  }
}
