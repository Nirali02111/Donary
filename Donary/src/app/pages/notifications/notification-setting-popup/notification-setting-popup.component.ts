import { CurrencyPipe } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal, NgbDropdown } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AnalyticsService } from "src/app/services/analytics.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import {
  NotificationService,
  alertRuleResponseObj,
  editAlertRuleResponseObj,
} from "src/app/services/notification.service";
import { UserService } from "src/app/services/user.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-notification-setting-popup",
  templateUrl: "./notification-setting-popup.component.html",
  styleUrls: ["./notification-setting-popup.component.scss"],
  providers: [CurrencyPipe],
  standalone: false,
})
export class NotificationSettingPopupComponent implements OnInit {
  dropdownList = [];
  dropdownSettings = {};
  dropdownList1 = [];
  dropdownSettings1 = {};
  selectedItems: any;
  selectedItems1: any;
  @Input() isEdit: boolean = false;
  @Input() itemFromParent: alertRuleResponseObj;
  @Input() item: editAlertRuleResponseObj;
  @ViewChild(NgbDropdown) dropdown: NgbDropdown;

  eventGuid: string = this.localstoragedataService.getLoginUserEventGuId();
  assignee: string = "";
  selectedCountry: any = 1;
  dailingCode: any = "+1";
  selectedFlag: any = "flag flag-usa";
  formGroup!: FormGroup;
  errorMsg: string =
    "One of the following needs to have a value: Assignee, Email, Phone number";

  countries: any = [];
  isCampaign: boolean = false;
  isReason: boolean = false;
  isCollector: boolean = false;
  isSource: boolean = false;
  isLocation: boolean = false;
  isAmountRange: boolean = false;
  flagDisplay: string = "flag flag-usa";
  dialingCodeDisplay: string = "+1";
  enableSaveRule: boolean = true;
  showValidationMsgError: boolean = false;
  allEmailAndPhone = [];
  specificControlsEmpty: boolean = true;
  recipientsString: string = "";
  isInputFocused: boolean = true;
  isMinAmount: boolean = false;
  showError: boolean = true;
  private analytics = inject(AnalyticsService);
  featureName: string = "Creating_new_alerts";

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private localstoragedataService: LocalstoragedataService,
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private commonAPIMethodService: CommonAPIMethodService,
    private currencyPipe: CurrencyPipe
  ) {}
  get Title() {
    return this.formGroup.get("title");
  }
  get Note() {
    return this.formGroup.get("note");
  }

  get Trigger() {
    return this.formGroup.get("trigger");
  }

  get AssigneeId() {
    return this.formGroup.get("assigneeId");
  }

  get SelectCondition() {
    return this.formGroup.get("selectCondition");
  }

  get CampaignId() {
    return this.formGroup.get("campaignId");
  }

  get campaignIdValue(): boolean {
    return this.formGroup.get("campaignId")?.value;
  }

  get ReasonId() {
    return this.formGroup.get("reasonId");
  }

  get ReasonIdValue() {
    return this.formGroup.get("reasonId")?.value;
  }

  get CollectorId() {
    return this.formGroup.get("collectorId");
  }

  get CollectorIdValue() {
    return this.formGroup.get("collectorId")?.value;
  }

  get SourceId() {
    return this.formGroup.get("sourceId");
  }

  get SourceIdValue() {
    return this.formGroup.get("sourceId")?.value;
  }

  get LocationId() {
    return this.formGroup.get("locationId");
  }

  get LocationIdValue() {
    return this.formGroup.get("locationId")?.value;
  }

  get MinAmount() {
    return this.formGroup.get("minAmount");
  }
  get MaxAmount() {
    return this.formGroup.get("maxAmount");
  }
  get SelectedCountry() {
    return this.formGroup.get("selectedCountry");
  }
  get Email() {
    return this.formGroup.get("email");
  }
  get PhoneNumber() {
    return this.formGroup.get("phoneNumber");
  }
  @Output() saveAlertValues: EventEmitter<boolean> = new EventEmitter();
  @Output() deleteEvent = new EventEmitter<alertRuleResponseObj>();

  originalMinimumValue: any;
  originalMaximumValue: any;

  ngOnInit() {
    this.commonMethodService.getFeatureSetting(this.featureName);
    this.initFormGroup();
    this.getCountryCodes();

    this.dropdownList = [
      { id: 2, itemName: "Schedule completed" },
      { id: 1, itemName: "Payment received" },
    ];
    this.dropdownSettings = {
      singleSelection: true,
      text: "Payment recieved",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
    };

    this.dropdownList1 = [
      { id: 1, itemName: "Campaign" },
      { id: 2, itemName: "Reason" },
      { id: 3, itemName: "Collector" },
      { id: 4, itemName: "Source" },
      { id: 5, itemName: "Location" },
      { id: 6, itemName: "Amount Range" },
    ];
    this.dropdownSettings1 = {
      singleSelection: true,
      text: "Search campaign",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
    };
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
    if (this.commonMethodService.localDeviceTypeList.length == 0) {
      this.commonMethodService.getSourceList();
    }
  }
  closePopup() {
    this.activeModal.dismiss();
  }

  initFormGroup() {
    this.formGroup = this.fb.group({
      title: this.fb.control(
        this.isEdit ? this.item?.title : null,
        Validators.compose([Validators.required])
      ),

      note: this.fb.control(this.isEdit ? this.item?.note : null),

      email: this.fb.control(null, Validators.compose([Validators.email])),
      phoneNumber: this.fb.control(null),
      trigger: this.fb.control(
        this.isEdit ? this.item?.trigger : null,
        Validators.compose([Validators.required])
      ),
      assigneeId: this.fb.control(this.isEdit ? this.item?.assigneeID : null),
      selectCondition: this.fb.control(null),
      campaignId: this.fb.control(
        this.isEdit ? this.item?.conditions[0]?.campaignId : null
      ),
      reasonId: this.fb.control(
        this.isEdit ? this.item?.conditions[0]?.reasonId : null
      ),
      collectorId: this.fb.control(
        this.isEdit ? this.item?.conditions[0]?.collectorId : null
      ),
      sourceId: this.fb.control(
        this.isEdit ? this.item?.conditions[0]?.sourceId : null
      ),
      locationId: this.fb.control(
        this.isEdit ? this.item?.conditions[0]?.locationId : null
      ),
      selectedCountry: this.fb.control(null),

      minAmount: this.fb.control(
        this.isEdit
          ? this.currencyPipe.transform(
              this.item?.conditions[0]?.minAmount,
              "USD",
              "symbol",
              "1.2-2"
            )
          : null
      ),
      maxAmount: this.fb.control(
        this.isEdit
          ? this.currencyPipe.transform(
              this.item?.conditions[0]?.maxAmount,
              "USD",
              "symbol",
              "1.2-2"
            )
          : null
      ),
    });
    if (this.isEdit) {
      this.assignee = this.item.assigneeName;
      if (this.item?.conditions[0]?.campaignId) this.isCampaign = true;
      if (this.item?.conditions[0]?.reasonId) this.isReason = true;
      if (this.item?.conditions[0]?.collectorId) this.isCollector = true;
      if (this.item?.conditions[0]?.sourceId) this.isSource = true;
      if (this.item?.conditions[0]?.locationId) this.isLocation = true;
      if (
        this.item?.conditions[0]?.minAmount ||
        this.item?.conditions[0].maxAmount
      )
        this.isAmountRange = true;
      if (this.item?.receipents !== "" && this.item?.receipents !== null) {
        this.recipientsString = this.item?.receipents;
        this.allEmailAndPhone = this.item?.receipents?.split(",");
      }
      this.checkEmailAndPhoneValues();
    }

    this.formGroup.valueChanges.subscribe(() => {
      this.checkEmailAndPhoneValues();
    });
  }

  checkEmailAndPhoneValues() {
    this.specificControlsEmpty =
      this.allEmailAndPhone?.length === 0 ? true : false;
  }

  formatCurrencyMinimum(event: any, formGroup) {
    const value = event.target.value;
    this.originalMinimumValue = event.target.value;
    // Remove dollar sign and decimals

    const strippedValue = this.originalMinimumValue.replace(/[\$,]/g, "");

    this.formGroup.patchValue({
      minAmount: strippedValue,
    });
    // If the value is empty, set it directly without formatting
    if (!strippedValue || isNaN(strippedValue)) {
      event.target.value = "";
      return;
    }

    const numericValue = parseFloat(strippedValue);

    // Format the value using the CurrencyPipe without decimals
    const formattedValue = this.currencyPipe.transform(
      numericValue,
      "USD",
      "symbol",
      "1.2-2"
    );
    const valWithoutFormat = formattedValue?.replace(/[\$,]/g, "");
    this.formGroup.patchValue({
      minAmount: valWithoutFormat,
    });
    // Set the input value to the formatted value
    event.target.value = formattedValue || "";
  }
  formatCurrencyMaximum(event: any) {
    const value = event.target.value;
    this.originalMaximumValue = event.target.value;
    // Remove dollar sign and decimals

    const strippedValue = this.originalMaximumValue.replace(/[\$,]/g, "");

    this.formGroup.patchValue({
      maxAmount: strippedValue,
    });
    // If the value is empty, set it directly without formatting
    if (!strippedValue || isNaN(strippedValue)) {
      event.target.value = "";
      return;
    }

    const numericValue = parseFloat(strippedValue);

    // Format the value using the CurrencyPipe without decimals
    const formattedValue = this.currencyPipe.transform(
      numericValue,
      "USD",
      "symbol",
      "1.2-2"
    );
    const valWithoutFormat = formattedValue.replace(/[\$,]/g, "");
    this.formGroup.patchValue({
      maxAmount: valWithoutFormat,
    });
    // Set the input value to the formatted value
    event.target.value = formattedValue || "";
  }
  onInputChangeMinimum(event: any) {
    this.isInputFocused = false;

    // Update the raw input value when the input changes
    this.originalMinimumValue = event.target.value;
  }
  onInputChangeMaximum(event: any) {
    // Update the raw input value when the input changes
    this.originalMaximumValue = event.target.value;
  }

  saveAlert() {
    if (this.MinAmount.value == "$0.00" && this.MaxAmount.value == "$0.00") {
      this.clearMaxAmount();
    }

    this.showValidationMsgError = true;
    this.enableSaveRule = false;

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.specificControlsEmpty) return;

    this.notificationService
      .saveAlertRule({
        ...this.formGroup.value,
        eventGuid: this.eventGuid,
        ruleId: this.itemFromParent?.ruleId,
        conditions: [
          {
            campaignId: this.CampaignId.value,
            reasonId: this.ReasonId.value,
            collectorId: this.CollectorId.value,
            sourceId: this.SourceId.value,
            locationId: this.LocationId.value,
            minAmount: this.MinAmount.value?.replace(/[\$,]/g, ""),
            maxAmount: this.MaxAmount.value?.replace(/[\$,]/g, ""),
          },
        ],
        receipents: this.recipientsString,
        assigneeId: this.AssigneeId.value,
      })
      .subscribe(
        (res) => {
          if (res) {
            this.analytics.createdAlertRule();
            Swal.fire({
              title: "Success!...",
              text: res,
              confirmButtonColor: "#00b300",
              customClass: {
                confirmButton: "btn-success",
              },
            });
            this.enableSaveRule = true;
            this.closePopup();
          }

          this.saveAlertValues.emit(true);
        },
        (err) => {
          console.log(err, "error");
        }
      );
  }
  deleteRule() {
    this.deleteEvent.emit(this.itemFromParent);
    this.closePopup();
  }

  getAssigneeValue(item) {
    this.formGroup.patchValue({
      assigneeId: item.id,
    });
    this.saveRecipients(item.email);
    this.assignee = item.itemName;
    this.dropdown.close();
  }

  clearAssignee() {
    this.formGroup.patchValue({
      assigneeId: null,
    });
    this.assignee = "";
  }
  onCountryChange(country: any) {
    this.formGroup.patchValue({
      selectedCountry: country.countryCodeID,
    });
    this.flagDisplay = country.flagClass;
    this.dialingCodeDisplay = country.dialingCode;
  }

  getCountryCodes() {
    this.commonAPIMethodService
      .getCountryCodes(this.localstoragedataService.getLoginUserEventGuId())
      .subscribe((res) => {
        this.countries = res;
        for (let index = 0; index < this.countries.length; index++) {
          if (this.countries[index].countryCodeID === 1) {
            this.countries[index]["flagClass"] = "flag flag-usa";
          }
          if (this.countries[index].countryCodeID === 2) {
            this.countries[index]["flagClass"] = "flag flag-canada";
          }
          if (this.countries[index].countryCodeID === 3) {
            this.countries[index]["flagClass"] = "flag flag-bleguim";
          }
          if (this.countries[index].countryCodeID === 4) {
            this.countries[index]["flagClass"] = "flag flag-uk";
          }
          if (this.countries[index].countryCodeID === 5) {
            this.countries[index]["flagClass"] = "flag flag-israel";
          }
        }
      });
  }
  selectOptionFromCondition() {
    switch (this.SelectCondition.value) {
      case 1:
        this.isCampaign = true;
        break;

      case 2:
        this.isReason = true;
        break;
      case 3:
        this.isCollector = true;
        break;
      case 4:
        this.isSource = true;
        break;
      case 5:
        this.isLocation = true;
        break;
      case 6:
        this.isAmountRange = true;
        break;

      default:
        break;
    }
  }
  get minAmount() {
    return this.formGroup.get("minAmount");
  }
  clearMaxAmount() {
    this.formGroup.patchValue({
      maxAmount: null,
      minAmount: null,
    });
  }
  saveRecipients(val) {
    if (val) this.allEmailAndPhone.push(val);
    this.formGroup.patchValue({
      email: null,
      phoneNumber: null,
    });
    this.recipientsString = this.allEmailAndPhone?.join(", ");
  }
  clearEmailOrPhone(item) {
    if (this.allEmailAndPhone.length !== 0) {
      this.allEmailAndPhone = this.allEmailAndPhone?.filter((el) => {
        return el !== item;
      });

      this.recipientsString = this.allEmailAndPhone?.join(", ");
    }
    this.checkEmailAndPhoneValues();
  }

  MinAmountInput() {
    this.isMinAmount = true;
  }

  clearTrigger() {
    if (this.Trigger.value === "" || this.Trigger.value === null) {
      this.showError = true;
      return;
    }

    this.showError = false;
  }
}
