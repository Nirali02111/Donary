import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { SkeletonLoaderModule } from "src/app/commons/modules/skeleton-loader/skeleton-loader.module";
import { SeatService } from "src/app/services/seat.service";
import Swal from "sweetalert2";
import { SaveCampaignPopupComponent } from "src/app/pages/campaign/save-campaign-popup/save-campaign-popup.component";
import { AnalyticsService } from "src/app/services/analytics.service";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: "app-create-season-popup",
  standalone: true,
  imports: [
    FormsModule,
    NgSelectModule,
    CommonModule,
    ReactiveFormsModule,
    SkeletonLoaderModule,
    TranslateModule,
  ],
  templateUrl: "./create-season-popup.component.html",
  styleUrl: "./create-season-popup.component.scss",
})
export class CreateSeasonPopupComponent {
  isAdminSeatCard: boolean = true;
  isAddadminSeatCard: boolean = false;
  isUpdateSeatCard: boolean = false;
  isGenerateSeatCard: boolean = false;
  seasonsList = [];
  locationList = [];
  selectedSeason: any = null;
  modalOptions: NgbModalOptions;
  selectedItem = null;
  isInvalid: boolean = false;
  datatype: any;
  isCopySeatData: boolean = false;
  showLocationMap: boolean = false;
  isCopyFromRequiredError: boolean = false;
  selectedSeasonName: any;
  previousSeason: any;
  isloading: boolean = true;
  copFromValue: any;
  locationmapres = [];
  items = [];
  selectedLocation;
  listData = [];
  sendPledgeBill: boolean = false;
  CopySeatValue: boolean = false;
  skeletonItems: any = [{}, {}, {}];
  totalSeatsCount: number = 0;
  form: FormGroup;
  data: any;
  radioOptions = [
    { id: 1, label: "Mark as Rented", value: "One Time Rental" },
    { id: 2, label: "Reserve", value: "Reserved" },
    { id: 3, label: "Don't Reserve", value: "" },
  ];
  selectedOption: string = "One Time Rental";
  typeName: any;
  hideSendPledgeButton: boolean = true;
  isEditSeatRateError: boolean = false;
  featureName: string = "Create_new_seats_season";
  get seasonName() {
    return this.form.get("seasonName");
  }

  get selectedMaps() {
    return this.form.get("selectedMaps");
  }
  get copyFrom() {
    return this.form.get("copyFrom");
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private seatService: SeatService
  ) {}

  ngOnInit() {
    this.commonMethodService.getFeatureSetting(this.featureName);
    this.form = new FormGroup({
      seasonName: new FormControl({ value: null, disabled: true }),
      copyFrom: new FormControl(null),
      selectedMaps: new FormControl(null, Validators.required),
    });
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
  }

  isCopySeat() {
    return this.typeName == "CopySeatData" ? true : false;
  }

  getSeasonList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.isloading = true;
    this.seatService.getSeasonsDropdown(eventGuId).subscribe((res) => {
      if (res) {
        this.isloading = false;
        this.seasonsList = res.map((s) => {
          return {
            id: s.seasonId,
            itemName: s.seasonName,
          };
        });
      } else {
        this.isloading = false;
      }
    });
  }

  onSeasonChange(event: any) {
    this.isInvalid = false;
    this.copFromValue = event;
    if (event) {
      this.isCopyFromRequiredError = false;
      this.showLocationMap = true;
      this.getMapLocationsList();
    } else {
      this.showLocationMap = false;
    }
  }

  getMapLocationsList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.isloading = true;
    this.seatService
      .getMapLocationsDropdown(eventGuId, this.selectedSeason.id)
      .subscribe((res) => {
        if (res) {
          this.locationmapres = res;
          this.locationList = res.map((s) => {
            let obj = {
              id: s.mapLocationId,
              itemName: s.mapName,
            };
            return obj;
          });

          // Automatically select all locations
          const selectedLocationIds = this.locationList.map((item) => item.id);
          this.form.patchValue({
            selectedMaps: selectedLocationIds,
          });
          this.isloading = false;
        } else {
          this.isloading = false;
        }
      });
  }

  onSubmit() {
    this.isInvalid = false;
    // this.activeModal.close(this.form.value);
    this.isCopyFromRequiredError = false;
    // Logic to handle the form submission
    if (this.form.invalid) {
      this.isInvalid = true;
      if (this.copyFrom.invalid) {
        this.isCopyFromRequiredError = true;
      }
      return;
    }

    if (!this.isCopySeatData) {
      var data1 = {
        selectedseason: this.seasonName.value,
        selectedMaps: this.selectedMaps.value,
        locationList: this.locationList,
        selectedSeasonName: this.selectedSeasonName,
        isCopySeat: false,
      };
      this.data = data1;
      this.GetRateList();
    } else {
      var data2 = {
        selectedseason: this.seasonName.value,
        selectedMaps: this.selectedMaps.value,
        locationList: this.locationList,
        selectedSeasonName: this.selectedSeasonName,
        previousSeason: this.previousSeason,
        copyFromValue: this.copFromValue,
        isCopySeat: true,
      };
      this.data = data2;
      this.isAddadminSeatCard = false;
      this.isUpdateSeatCard = true;
    }
  }
  onItemSelect(event: any) {
    this.selectedSeason = event;
  }

  close() {
    this.activeModal.close();
  }

  openAddSeatDataPopup(type: string) {
    this.typeName = type;
    this.isAdminSeatCard = false;
    this.isAddadminSeatCard = true;
    this.getMapLocationsList();
    this.getSeasonList();

    if (this.isCopySeat()) {
      this.copyFrom.setValidators(Validators.required);
      this.isCopySeatData = true;
    } else {
      this.isCopySeatData = false;
      this.showLocationMap = true;
    }
    if (this.selectedSeason) {
      this.items = [this.selectedSeason];
      this.previousSeason = this.selectedSeason;
      const seasonId = this.selectedSeason.id;
      this.selectedSeasonName = this.selectedSeason.itemName;
      this.seasonName?.setValue(seasonId);
    }
  }

  Confirm() {
    this.GetRateList();
    if (this.data) {
      this.isCopySeat = this.data.isCopySeat;
      if (this.data.copyFromValue) {
        this.CopySeatValue = this.data.copyFromValue.itemName;
      }
    }
    if (this.selectedOption != "One Time Rental") {
      this.hideSendPledgeButton = true;
    } else {
      this.hideSendPledgeButton = false;
    }
    this.isUpdateSeatCard = false;
  }

  DisplayData(locationList, selectedMaps, dataArray = [], getSections = null) {
    let isValid = true;

    // Helper function to get location details
    const getLocationDetails = (locationId) => {
      const matchingLocation = locationList.find(
        (location) => location.id === locationId
      );
      const count =
        this.locationmapres.find((res) => res.mapLocationId === locationId)
          ?.count || 0;
      const title = matchingLocation ? matchingLocation.itemName : "";
      return { title, count };
    };

    // Helper function to get rates based on section and dataArray
    const getRates = (mapLocationId, sections, data = []) => {
      if (Array.isArray(sections)) {
        return sections.reduce((rate, section) => {
          if (mapLocationId === section.mapLocationID) {
            const matchingData = (data || []).find(
              (item) =>
                item.mapLocationId === mapLocationId &&
                item.sectionName === section.sectionName
            );
            rate.push({
              aisleAdditionalFee: matchingData?.aisleAdditionalFee || 0,
              sectionName: section.sectionName,
              seatPrice: matchingData?.seatPrice || 0,
            });
          }
          return rate;
        }, []);
      }
    };

    // Helper function to check if dataArray and getSections match
    const checkDataArrayMatch = (locationId) => {
      if (!dataArray) {
        return false;
      }
      // Get sections related to the locationId from getSections
      const sectionsFromGetSections = Array.isArray(getSections)
        ? getSections.filter((section) => section.mapLocationID === locationId)
        : [];

      // Get matching entries from dataArray for the same mapLocationId

      const dataFromArray = Array.isArray(dataArray)
        ? dataArray.filter((item) => item.mapLocationId === locationId)
        : [];

      // Check if both arrays (sectionsFromGetSections and dataFromArray) match in length
      if (sectionsFromGetSections.length !== dataFromArray.length) {
        return false;
      }

      // Check if section names and mapLocationId match between dataArray and getSections
      for (let section of sectionsFromGetSections) {
        const correspondingData = dataFromArray.find(
          (item) => item.sectionName === section.sectionName
        );

        if (!correspondingData) {
          return false;
        }
      }
      return true;
    };

    // Mapping through selectedMaps and constructing data array
    const data = selectedMaps.map((locationId) => {
      const { title, count } = getLocationDetails(locationId);
      const rate = getRates(locationId, getSections, dataArray);

      // Check if the dataArray matches the getSections for the current locationId
      if (!checkDataArrayMatch(locationId)) {
        isValid = false; // Set isValid to false if there's any mismatch
      }

      return { seatsCount: count, title, rate };
    });

    this.totalSeatsCount = data.reduce(
      (total, item) => total + item.seatsCount,
      0
    );

    // Log the result of the validation
    if (isValid) {
      this.isEditSeatRateError = false;
    } else {
      this.isEditSeatRateError = true;
    }

    return data;
  }

  CopyData(title: string, seatCount) {
    const textToCopy = `${title} (${seatCount})`;
    navigator.clipboard.writeText(textToCopy);
  }

  GetRateList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.isloading = true;
    this.seatService.getRateList(eventGuId).subscribe(
      (res) => {
        this.isAddadminSeatCard = false;
        if (res) {
          this.isGenerateSeatCard = true;
          this.getSection(res);
          this.isEditSeatRateError = false;
        } else {
          this.getSection(null);
          this.isGenerateSeatCard = true;
          this.isEditSeatRateError = true;
          return;
        }
      },
      () => {
        this.isloading = false;
      }
    );
  }

  getSection(isGetRateListRes) {
    // this.isloading = true;
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    const apiPayload = {
      eventGuId,
      //  mapLocationID: this.data.selectedMaps.join(','),
    };
    this.seatService.getSectionList(apiPayload).subscribe(
      (res) => {
        if (isGetRateListRes) {
          this.listData = this.DisplayData(
            this.data.locationList,
            this.data.selectedMaps,
            isGetRateListRes,
            res
          );
        } else {
          this.listData = this.DisplayData(
            this.data.locationList,
            this.data.selectedMaps,
            null,
            res
          );
        }
        this.isloading = false;
      },
      () => {}
    );
  }

  ChangePledgeBill() {
    this.sendPledgeBill = !this.sendPledgeBill;
  }

  generateSeason() {
    this.activeModal.close();
    this.commonMethodService.closeAllPopups();
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    let obj: any = {
      eventGuId: eventGuId,
      campaignId: this.data.selectedseason,
      mapLocationIds:
        this.data.selectedMaps && this.data.selectedMaps.length > 0
          ? this.data.selectedMaps
          : null,
      oneTimeRentalStatus: this.selectedOption,
    };
    if (this.data && this.data.oneTimeRentalStatus !== undefined) {
      obj.oneTimeRentalStatus = this.data.oneTimeRentalStatus;
    }
    if (this.data && this.data.copyFromValue) {
      obj.previousSeasonId = this.data.copyFromValue.id;
    }
    if (!this.hideSendPledgeButton) {
      obj.sendPledgeBill = this.sendPledgeBill;
    }
    this.seatService.createSeason(obj).subscribe(
      (res: any) => {
        if (res) {
          this.isCopySeat()
            ? this.analytics.createdSeatMapCopy()
            : this.analytics.createdSeatMapNew();

          Swal.fire({
            title: "Success",
            text: res,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then((result) => {
            if (result) {
            }
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
  }
  AddNewCampaign() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savecampaign_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveCampaignPopupComponent,
      this.modalOptions
    );
    modalRef.result.then((result) => {
      var obj = {
        id: result.campaignId,
        itemName: result.campaignName,
      };
      this.selectedSeason = obj;
      this.selectedItem = result.campaignId;
    });
    modalRef.componentInstance.Type = "add";
  }
}
