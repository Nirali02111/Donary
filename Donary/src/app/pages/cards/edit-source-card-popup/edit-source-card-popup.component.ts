import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  inject,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { OrderdeviceService } from "src/app/services/orderdevice.service";
import Swal from "sweetalert2";
import { DeviceService } from "src/app/services/device.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import * as moment from "moment";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-edit-source-card-popup",
  templateUrl: "./edit-source-card-popup.component.html",
  styleUrls: ["./edit-source-card-popup.component.scss"],
  standalone: false,
})
export class EditSourceCardPopupComponent implements OnInit {
  pin: string = "";
  optionID: number;
  isloading: boolean = false;
  deviceId: number;
  modalOptions: NgbModalOptions;
  selectedDateRange: any;
  objAdvancedSearch: any = {
    orderDevicesStatusID: [],
  };
  selectedDate: any;
  device: string;
  selectedFromCampaignList;
  selectedPaymentReasons;
  selectedPaymentLocations;
  isShulKiosk: boolean;
  isPocket: boolean;
  selectedPaymentCollectors;
  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();
  recallSourceList: EventEmitter<any> = new EventEmitter<any>();
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    private deviceService: DeviceService,
    private localStorageDataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    public orderdeviceService: OrderdeviceService
  ) {}
  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".cards_secton,.top_row,.modal__custom_header,.tab_draggable",
        cursor: "grab",
        cancel: ".name_colm,.sub_tab_wrap",
      });
    });
    this.isShulKiosk = this.device.includes("DSH");
    this.isPocket = this.device.includes("DP");
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

  @Input() set SourceCardData(data: any) {
    if (data) {
      this.pin = data.deviceOptionPIN ? data.deviceOptionPIN : data.pin;
      this.optionID = data.optionID;
      this.deviceId = data.deviceId;
      // added new
      this.device = data.deviceName;
      this.selectedFromCampaignList = data.campaignId
        ? [{ id: data.campaignId, itemName: data.campaignName }]
        : null;
      this.selectedPaymentReasons = data.reasonId
        ? [{ id: data.reasonId, itemName: data.reasonName }]
        : null;
      this.selectedPaymentCollectors = data.collectorId
        ? [{ id: data.collectorId, itemName: data.collectorName }]
        : null;
      this.selectedDate = data.transDate
        ? { startDate: moment(data.transDate) }
        : "";
      var loc = this.commonMethodService.localLocationList;
      var result = loc.find((x) => x.id == data.locationId);
      if (result) {
        this.selectedPaymentLocations = [
          { id: result.id, itemName: result.itemName },
        ];
      }
      //
    }
  }

  closePopup() {
    this.activeModal.dismiss({ success: true });
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  saveData() {
    var obj = {
      OptionId: this.optionID,
      DeviceId: this.deviceId,
      DeviceName: this.device,
      CampaignId:
        this.selectedFromCampaignList &&
        this.selectedFromCampaignList.length > 0
          ? this.selectedFromCampaignList[0].id
          : 0,
      ReasonId:
        this.selectedPaymentReasons && this.selectedPaymentReasons.length > 0
          ? this.selectedPaymentReasons[0].id
          : 0,
      CollectorId:
        this.selectedPaymentCollectors &&
        this.selectedPaymentCollectors.length > 0
          ? this.selectedPaymentCollectors[0].id
          : 0,
      LocationId:
        this.selectedPaymentLocations &&
        this.selectedPaymentLocations.length > 0
          ? this.selectedPaymentLocations[0].id
          : 0,
      TranDate: this.selectedDate.startDate
        ? moment(this.selectedDate.startDate).format("YYYY-MM-DD")
        : null,
      UpdatedBy: 11,
      PIN: this.pin ? this.pin : "-1",
    };
    // this.orderdeviceService.UpdateDeviceOptions(this.pin,11,this.optionID).subscribe(
    this.orderdeviceService.UpdateDeviceOptions(obj).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.analytics.editedSources();

          Swal.fire({
            title: "success",
            text: "",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.recallSourceList.emit(true);

            var objDeviceCard = {
              eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
              deviceId: this.deviceId,
              fromDate:
                this.selectedDateRange != undefined
                  ? this.selectedDateRange.startDate != null
                    ? moment(this.selectedDateRange.startDate).format(
                        "YYYY-MM-DD"
                      )
                    : null
                  : null,
              toDate:
                this.selectedDateRange != undefined
                  ? this.selectedDateRange.endDate != null
                    ? moment(this.selectedDateRange.endDate).format(
                        "YYYY-MM-DD"
                      )
                    : null
                  : null,
              listFilters: {
                donors:
                  this.objAdvancedSearch && this.objAdvancedSearch.donorId
                    ? this.objAdvancedSearch.donorId.map((x) => x.id)
                    : null,
                campaigns:
                  this.objAdvancedSearch && this.objAdvancedSearch.campaignId
                    ? this.objAdvancedSearch.campaignId.map((s) => s.id)
                    : null,
                locations:
                  this.objAdvancedSearch && this.objAdvancedSearch.locationId
                    ? this.objAdvancedSearch.locationId.map((s) => s.id)
                    : null,
                collectors:
                  this.objAdvancedSearch && this.objAdvancedSearch.collectorId
                    ? this.objAdvancedSearch.collectorId.map((s) => s.id)
                    : null,
                reasons:
                  this.objAdvancedSearch && this.objAdvancedSearch.reasonId
                    ? this.objAdvancedSearch.reasonId.map((s) => s.id)
                    : null,
              },
            };
            this.deviceService
              .getDeviceCard(objDeviceCard)
              .subscribe((res: any) => {
                this.isloading = false;
                if (res) {
                  this.emtOutputAdvancedFilterData.emit(res);
                }
              });

            this.activeModal.dismiss({ success: true });
          });
        } else {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SOMETHING_WENT_WRONG"
            ),
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
      (err) => {
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

  OnDivClick() {}
}
