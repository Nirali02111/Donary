import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { PaymentApiGatewayService } from "src/app/services/payment-api-gateway.service";
import Swal from "sweetalert2";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { AnalyticsService } from "src/app/services/analytics.service";
declare let $: any;
interface GateWay {
  gatewayId: number;
  gatewayName: string;
}
@Component({
  selector: "app-add-apikey-popup",
  templateUrl: "./add-apikey-popup.component.html",
  styleUrls: ["./add-apikey-popup.component.scss"],
  standalone: false,
})
export class AddApikeyPopupComponent implements OnInit {
  @Output() emtOutputEditApiKeys: EventEmitter<any> = new EventEmitter();
  gateWayList: Array<GateWay> = [];
  gateWayTypesList: Array<any> = [];
  currenciesList: Array<any> = [];
  selectedReasons = [];
  selectedCampaigns = [];
  isAdvancedKeys = false;
  title: string;
  gatewayAPIId: string;
  gatewayTypeId = [];
  gatewayProviderId: number;
  currencyId: number;
  integrationKey: string;
  pin: number;
  nickName: string;
  campaignId: number;
  reasonId: number;
  isDisableDwn: string;
  disableReasonCls: string;
  disableCampiangCls: string = "disable-dwn";
  isReasonDwnChecked: boolean = true;
  isCampiangDwnChecked: boolean = false;
  isloading: boolean = false;
  isAddNewApiKey: boolean = false;
  gridFilterData = [];
  defaultKeysApiType = [];
  gatewayTypeIdNumber: number;
  disableMsg: string =
    "This API type can't be added as it's missing in the default section";
  apiPinHideShow: boolean = false;
  isApiPinRequired: boolean = false;
  processingIntegrationKeysArray = [];
  isDublicateIntegrationKey: boolean = false;
  reasonArray = [];
  isDublicateReason: boolean = false;
  isDublicateCampaign: boolean = false;
  setToolTip: string = "";
  gateway: string = "";
  countries: any;
  isDevEnv: boolean;
  selectedCountry: any =
    "Phone_" + this.commonMethodService.getDefaultSelectedCountryCode();
  selectedFlag: string = this.commonMethodService.getDefaultSelectedFlag();
  selectedCountryCode: any =
    this.localstoragedataService.getUserEventCurrency();
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  Country: any = this.commonMethodService.getDefaultSelectedCountryCode();
  @Input() set keys(key) {
    if (key) {
      this.isAdvancedKeys = key.isAdvancedKeys;
      this.title = key.isAddNewApiKey ? "Create API Key" : "Edit API Key";
      this.isAddNewApiKey = key.isAddNewApiKey;
      this.gridFilterData = key.gridFilterData;
      this.defaultKeysApiType = this.onDefaultKeysApiType();
      this.processingIntegrationKeysArray = this.processingIntegrationKeys();
      this.reasonArray = this.reasons();
      this.bindData();
    }
  }
  @Input() set data(item) {
    if (item) {
      this.gatewayAPIId = item.gatewayAPIId;
      this.gatewayTypeIdNumber = item.gatewayTypeId;
      this.gatewayTypeId = item.gatewayTypeId;
      this.gatewayProviderId = item.gatewayProviderId;
      this.currencyId = item.currencyId;
      this.selectedCountry =
        "Phone_" + (item.countryCodeId ? item.countryCodeId : 1);
      this.Country = item.countryCodeId ? item.countryCodeId : 1;
      this.selectedCountryCode = this.selectedCountryName(item.countryCodeId);
      this.selectedFlag = this.getFlagClass(item.countryCodeId);
      this.integrationKey = item.integrationKey;
      this.pin = item.pin;
      this.nickName = item.nickName;
      this.selectedCampaigns = item.campaignId
        ? [{ id: item.campaignId, itemName: item.campaignName }]
        : null;
      this.selectedReasons = item.reasonId
        ? [{ id: item.reasonId, itemName: item.reasonName }]
        : null;
      this.isRadioButtonChecked(item.reasonId, item.campaignId);
      if (item.countryCodeId == null) {
        this.selectedCountryCode = null;
        this.selectedFlag = "";
        this.selectedCountry = null;
        this.Country = null;
      }
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    private commonAPI: CommonAPIMethodService,
    public commonMethodService: CommonMethodService,
    public paymentApiGatewayService: PaymentApiGatewayService,
    private localstoragedataService: LocalstoragedataService,
    private commonAPIMethodService: CommonAPIMethodService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isDevEnv =
      environment.releaseFeature.isSelectCountryInAddAPIKeyRelease;

    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__heading",
        cursor: " grab",
      });
    });
    this.getCountryCodes();
    this.getAPIGateways();
    this.getGatewayApiTypes();
    this.getCurrencies();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  flagClasses = {
    "1": "flag flag-usa",
    "2": "flag flag-canada",
    "3": "flag flag-bleguim",
    "4": "flag flag-uk",
    "5": "flag flag-israel",
  };

  //Get Flag based on country Id
  getFlagClass(countryCode: string): string {
    return this.flagClasses[countryCode] || "flag flag-usa";
  }

  CountryNameClasses = {
    "1": "USA",
    "2": "CA",
    "3": "BE",
    "4": "UK",
    "5": "IL",
  };

  //GetCountryName when edit
  selectedCountryName(countryCode: string) {
    return this.CountryNameClasses[countryCode] || "USA";
  }
  onCountryChange(countryCodeID: any, countryCode: any) {
    this.Country = countryCodeID;
    this.selectedCountryCode = countryCode;
    this.selectedFlag = this.getFlagClass(countryCodeID);
    this.cdr.detectChanges();
  }
  getCountryCodes() {
    this.isloading = true;
    this.commonAPIMethodService
      .getCountryCodes(this.localstoragedataService.getLoginUserEventGuId())
      .subscribe((res) => {
        this.countries = res;
        this.isloading = false;
      });
  }
  getAPIGateways() {
    this.isloading = true;
    this.commonAPI.getAPIGateways().subscribe(
      (res: Array<GateWay>) => {
        if (res) {
          this.gateWayList = res;
          this.isloading = false;
          this.isAPIKeyPin();
        }
      },
      (err) => {}
    );
  }
  getGatewayApiTypes() {
    this.isloading = true;
    this.commonAPI.getGatewayApiTypes().subscribe(
      (res: Array<any>) => {
        if (res) {
          const result = res.map((x) => {
            this.gateWayTypesList.push({
              id: x.apiTypeId,
              itemName: x.apiTypeName,
            });
          });
          this.isloading = false;
        }
      },
      (err) => {}
    );
  }
  getCurrencies() {
    this.isloading = true;
    this.commonAPI.getCurrencies().subscribe(
      (res: Array<any>) => {
        if (res) {
          this.currenciesList = res;
          this.isloading = false;
        }
      },
      (err) => {}
    );
  }
  onDeSelectAll(filterName: any) {
    switch (filterName) {
      case "reasonList":
        this.selectedReasons = [];
        break;
      case "campaignList":
        this.selectedCampaigns = [];
        break;
    }
  }
  isNickNameRequired = false;
  isGatewayProviderIdRequired = false;
  isGatewayTypeIdRequired = false;
  isIntegrationKeyRequired = false;
  isCurrencyIdRequired = false;

  onSaveChanges() {
    if (!this.nickName) {
      this.isNickNameRequired = true;
      return false;
    }
    if (!this.gatewayProviderId) {
      this.isGatewayProviderIdRequired = true;
      return false;
    }
    if (this.gatewayTypeId.length == 0) {
      this.isGatewayTypeIdRequired = true;
      return false;
    }
    if (!this.integrationKey) {
      this.isIntegrationKeyRequired = true;
      return false;
    }
    if (!this.currencyId) {
      this.isCurrencyIdRequired = true;
      return false;
    }
    if (this.apiPinHideShow && !this.pin && this.gatewayProviderId != 10) {
      this.isApiPinRequired = true;
      return false;
    }
    this.isloading = true;
    let obj = {
      gatewayAPIId: this.gatewayAPIId,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      gatewayTypeId: this.gatewayTypeId,
      gatewayProviderId: this.gatewayProviderId,
      currencyId: this.currencyId,
      integrationKey: this.integrationKey,
      pin: this.pin,
      createdBy: this.localstoragedataService.getLoginUserId(),
      nickName: this.nickName,
      campaignId:
        this.isAdvancedKeys &&
        this.selectedCampaigns &&
        this.selectedCampaigns.length > 0
          ? this.selectedCampaigns[0].id
          : null,
      reasonId:
        this.isAdvancedKeys &&
        this.selectedReasons &&
        this.selectedReasons.length > 0
          ? this.selectedReasons[0].id
          : null,
      countryCodeId: this.Country,
    };
    this.paymentApiGatewayService.save(obj).subscribe(
      (res: any) => {
        this.closePopup();
        this.isloading = false;
        if (this.isAddNewApiKey) {
          this.isAdvancedKeys
            ? this.analytics.createdAdvancedKey()
            : this.analytics.createdDefaultKey();
        } else {
          this.isAdvancedKeys
            ? this.analytics.editedAdvancedKey()
            : this.analytics.editedDefaultKey();
        }
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
        }).then(() => {
          this.emtOutputEditApiKeys.emit(true);
        });
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
  }
  disableDrpChange(event) {
    if (event.currentTarget.id == "reason") {
      this.disableReasonCls = "";
      this.disableCampiangCls = "disable-dwn";
      this.selectedCampaigns = [];
    }
    if (event.currentTarget.id == "campaign") {
      this.disableReasonCls = "disable-dwn";
      this.disableCampiangCls = "";
      this.selectedReasons = [];
    }
  }
  isRadioButtonChecked(reason, campaign) {
    if (reason) {
      this.disableReasonCls = "";
      this.disableCampiangCls = "disable-dwn";
      this.isReasonDwnChecked = true;
      this.isCampiangDwnChecked = false;
    }
    if (campaign) {
      this.disableReasonCls = "disable-dwn";
      this.disableCampiangCls = "";
      this.isReasonDwnChecked = false;
      this.isCampiangDwnChecked = true;
    }
  }

  delete(gatewayAPIId) {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    let deletedBy = this.localstoragedataService.getLoginUserId();
    let obj = {
      eventGuId: eventGuId,
      gatewayAPIId: gatewayAPIId,
      deletedBy: deletedBy,
    };

    this.paymentApiGatewayService.delete(obj).subscribe((res: any) => {
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
        this.closePopup();
        this.emtOutputEditApiKeys.emit(true);
      });
    });
  }
  onDefaultKeysApiType() {
    let valArray = [];
    const result = this.gridFilterData.map((item) => {
      if (!item.campaignName && !item.reasonName) {
        valArray.push(item.gatewayTypeId);
      }
    });
    return valArray;
  }
  isDisableApiType(gatewayTypeId) {
    if (this.defaultKeysApiType.indexOf(gatewayTypeId) > -1) {
      return false;
    }
    return true;
  }
  isAPIKeyPin() {
    if (this.gatewayProviderId == 13) {
      this.currencyId = 1;
    }
    this.isGatewayProviderIdRequired = false;
    if (
      this.gatewayProviderId == 3 ||
      this.gatewayProviderId == 6 ||
      this.gatewayProviderId == 7 ||
      this.gatewayProviderId == 10 ||
      this.gatewayProviderId == 11 ||
      this.gatewayProviderId == 12 ||
      this.gatewayProviderId == 13 ||
      this.gatewayProviderId == 14 ||
      this.gatewayProviderId == 15 ||
      this.gatewayProviderId == 16
    ) {
      this.apiPinHideShow = true;
      let gatewayResult = this.gateWayList.filter(
        (x) => x.gatewayId == this.gatewayProviderId
      );
      this.gateway = gatewayResult[0].gatewayName;
      this.setToolTip = `${this.gateway} When creating an API key on ${this.gateway}, you are not required to set up a PIN. However, for security reasons, we strongly recommend that you set up a PIN for your API key. To do this, please sign in to your merchant account, create a PIN for the API key, and then add it here. If you experience any issues with the PIN, please contact the owner of your merchant account. Thank you for using ${this.gateway}!`;
      return;
    }
    this.apiPinHideShow = false;
  }
  removePinRequired() {
    this.isApiPinRequired = false;
  }
  processingIntegrationKeys() {
    let integrationKeys = [];
    const result = this.gridFilterData.map((item) => {
      if (item.integrationKey) {
        integrationKeys.push({
          integrationKey: item.integrationKey,
          gatewayAPIId: item.gatewayAPIId,
        });
      }
    });
    return integrationKeys;
  }
  isDuplicateIntegrationKey() {
    let keyExist = this.processingIntegrationKeysArray.some(
      (x) =>
        x.integrationKey == this.integrationKey &&
        x.gatewayAPIId != this.gatewayAPIId
    );
    if (keyExist) {
      this.isDublicateIntegrationKey = true;
      return true;
    }
    this.isDublicateIntegrationKey = false;
    return false;
  }
  reasons() {
    let reasons = [];
    const result = this.gridFilterData.map((item) => {
      if (item.reasonId) {
        reasons.push(item.reasonId);
      }
    });
    return reasons;
  }
  onReasonSelect(event: any) {
    this.isDublicateReason = false;
    const result = this.gridFilterData.map((item) => {
      if (
        item.reasonId == event.id &&
        item.gatewayAPIId != this.gatewayAPIId &&
        item.gatewayProviderId == this.gatewayProviderId
      ) {
        this.isDublicateReason = true;
        return;
      }
    });
  }
  onCampaignSelect(event: any) {
    this.isDublicateCampaign = false;
    const result = this.gridFilterData.map((item) => {
      if (
        item.campaignId == event.id &&
        item.gatewayAPIId != this.gatewayAPIId &&
        item.gatewayProviderId == this.gatewayProviderId
      ) {
        this.isDublicateCampaign = true;
        return;
      }
    });
  }

  isDisableSaveChangesBtn() {
    return (
      this.isApiPinRequired ||
      this.isDublicateIntegrationKey ||
      this.isDublicateReason ||
      this.isDublicateCampaign ||
      this.isNickNameRequired ||
      this.isGatewayProviderIdRequired ||
      this.isGatewayTypeIdRequired ||
      this.isIntegrationKeyRequired ||
      this.isCurrencyIdRequired
    );
  }

  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      false,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    );
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_advanced_keys";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
