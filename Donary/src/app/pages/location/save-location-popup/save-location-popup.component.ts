import {
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
import { AnalyticsService } from "src/app/services/analytics.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { LocationService } from "src/app/services/location.sevice";
import Swal from "sweetalert2";
declare var $: any;
@Component({
  selector: "app-save-location-popup",
  templateUrl: "./save-location-popup.component.html",
  styleUrls: ["./save-location-popup.component.scss"],
  standalone: false,
})
export class SaveLocationPopupComponent implements OnInit {
  title: string;
  isloading: boolean = true;
  selectedGlobalLocation: number;
  isEditMode = false;
  nonGlobalLocationEditable = false;
  globalLocation: string;
  showGlobalLocation: boolean = false;
  locationName: string = null;
  shortName: string = null;
  locationNameJewish: string = null;
  rabbi: string;
  phone: string;
  address: string;
  cityStateZip: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  locationId: number = null;
  locationTypeId: Array<any> = [];
  isSearchDisable: boolean = true;
  skeletonitems: any = [{}, {}, {}, {}, {}, {}, {}];
  disableTitle: string = "Need to be more then 3 characters";
  @Output() emtOutputEditLocation: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputDismissCard: EventEmitter<any> = new EventEmitter();
  countries: any;
  selectedCountry: any =
    this.commonMethodService.getDefaultSelectedCountryCode();
  dailingCode: any = this.commonMethodService.getDefaultDailingCode();
  selectedFlag: any = this.commonMethodService.getDefaultSelectedFlag();
  latitude: any = 0;
  longitude: any = 0;
  checkAddress: string = "";
  isNotValidAddress: boolean = false;
  checkCityStateZip: string = "";
  @Input() set Type(data: any) {
    if (data) {
      if (data == "add") {
        this.title = "Create Location";
        this.isloading = false;
        this.isEditMode = false;
        this.locationTypeId = this.commonMethodService.locationTypeList.filter(
          (s) => s.id == 1
        );
        this.isloading = false;
      } else {
        this.title = "Edit Location";
        this.isloading = false;
        this.isEditMode = true;
      }
    }
  }

  @Input() set EditLocationData(data: any) {
    if (data) {
      this.locationId = data.locationID;
      this.locationNameJewish = data.locationNameJewish;
      this.locationName = data.locationName;
      this.shortName = data.locationNameShort;
      this.address = data.address;
      this.cityStateZip =
        (data.city == null ? "" : data.city) +
        " " +
        (data.state == null ? "" : data.state) +
        " " +
        (data.country == null ? "" : data.country);
      this.rabbi = data.rabbi;
      this.phone = data.phone;
      this.locationTypeId = this.commonMethodService.locationTypeList.filter(
        (s) => s.id == data.locationTypeID
      );
    }
    this.latitude = data.lat == null ? -1 : data.lat;
    this.longitude = data.long == null ? -1 : data.long;
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public locationService: LocationService,
    private commonAPIMethodService: CommonAPIMethodService,
    private localstoragedataService: LocalstoragedataService
  ) {}

  ngOnInit() {
    if (this.commonMethodService.locationTypeList.length == 0) {
      this.commonMethodService.getLocationTypeList();
    }
    this.getFeatureSettingValues();
    this.getCountryCodes();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
  }
  getCountryCodes() {
    this.commonAPIMethodService
      .getCountryCodes(this.localstoragedataService.getLoginUserEventGuId())
      .subscribe((res) => {
        this.countries = res;
      });
  }
  flagClasses = {
    "1": "flag flag-usa",
    "2": "flag flag-canada",
    "3": "flag flag-bleguim",
    "4": "flag flag-uk",
    "5": "flag flag-israel",
  };

  getFlagClass(countryCode: string): string {
    return this.flagClasses[countryCode] || "";
  }
  onCountryChange(countryCodeID: any, dialingCode: any) {
    this.selectedCountry = countryCodeID;
    this.dailingCode = dialingCode;
    this.selectedFlag = this.getFlagClass(countryCodeID);
  }
  checkJewishLocation() {
    return !this.locationNameJewish && !this.locationName;
  }

  checkLocationName() {
    return !this.locationNameJewish && !this.locationName;
  }

  EnterLocation(value) {
    var loclength = value.length;
    if (loclength >= 3) {
      this.isSearchDisable = false;
      this.disableTitle = "";
    } else {
      this.isSearchDisable = true;
      this.disableTitle = "Need to be more then 3 characters";
    }
  }

  onClickedOutside() {
    this.showGlobalLocation = false;
  }

  SelectGlobalLocation(locationId) {
    this.isloading = true;

    //this.isloading=true;
    this.nonGlobalLocationEditable = true;
    this.showGlobalLocation = false;
    this.selectedGlobalLocation = locationId;
    this.commonMethodService.paymentLocationList =
      this.commonMethodService.paymentLocationList.filter(
        (s) => s.id == locationId
      );

    this.globalLocation = null;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var macAddress = this.localstoragedataService.getLoginUserGuid();
    this.locationService
      .getLocation(locationId, eventGuId, macAddress)
      .subscribe((res: any) => {
        this.isloading = false;
        this.isSearchDisable = true;
        this.EditLocationData = res;
      });
  }

  SplitAddress(cityStateZip) {
    var address = this.cityStateZip.split(" ");
    if (address.length >= 3) {
      this.city = address[0];
      this.state = address[1];
      this.country = address[2];
    }
    if (address.length > 3) {
      this.city = address[0];
      this.state = address[1];
      this.country = address[2];
      this.zip = address[3];
    }
  }

  SaveLocationInfo() {
    if (
      this.checkAddress != this.address &&
      this.checkCityStateZip != this.cityStateZip
    ) {
      this.isNotValidAddress = true;
      return;
    }
    this.isloading = true;
    this.SplitAddress(this.cityStateZip);

    var locationObj = {
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      createdBy: this.localstoragedataService.getLoginUserId(),
      locationId: this.locationId,
      locationName: this.locationName,
      locationNameJewish: this.locationNameJewish,
      locationNameShort: this.shortName,
      rabbi: this.rabbi,
      phone: this.phone,
      address: this.address,
      city: this.city,
      state: this.state,
      zip: this.zip,
      country: this.country,
      locationTypeId:
        this.locationTypeId != null
          ? this.locationTypeId.length > 0
            ? parseInt(this.locationTypeId.map((s) => s.id).toString())
            : null
          : null,
      countryCodeID: this.selectedCountry,
      latitude: this.latitude,
      longitude: this.longitude,
    };
    this.locationService.saveLocation(locationObj).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.activeModal.dismiss();
          if (this.isEditMode) {
            this.analytics.editedLocation();
            Swal.fire({
              title: "",
              text: "Location updated successfully",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then(() => {
              this.emtOutputEditLocation.emit(true);
            });
          } else {
            this.analytics.createdLocation();
            Swal.fire({
              title: "",
              text: "Location added successfully",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
          this.commonMethodService.sendLocationLst(true);
        } else {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.TRY_AGAIN"
            ),
            text: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SOMETHING_WENT_WRONG"
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
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  deleteLocation() {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this location!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
        var macAddress = this.localstoragedataService.getLoginUserGuid();
        var deletedBy = this.localstoragedataService.getLoginUserId();
        this.locationService
          .deleteLocation(this.locationId, eventGuid, macAddress, deletedBy)
          .subscribe(
            (res: any) => {
              this.isloading = false;
              if (res) {
                this.activeModal.dismiss();
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
                });
                this.emtOutputDismissCard.emit(true);
                this.commonMethodService.sendLocationLst(true);
              } else {
                Swal.fire({
                  title: "Try Again!",
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
          text: "Your location is safe :)",
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
  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_location";
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }

  onOrgAddressChange(data) {
    this.address = data.streetNumber
      ? `${data.streetNumber} ${data.streetName}`
      : data.streetName;
    this.checkAddress = this.address;
    this.cityStateZip = `${
      data.locality.long || data.locality.short || data.sublocality || ""
    } ${data.state.short || ""} ${data.postalCode || ""}`;
    this.checkCityStateZip = this.cityStateZip;
    (this.latitude = data.geoLocation.latitude),
      (this.longitude = data.geoLocation.longitude);
  }
}
