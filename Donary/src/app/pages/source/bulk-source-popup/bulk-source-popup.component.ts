import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { OrderdeviceService } from "src/app/services/orderdevice.service";
import Swal from "sweetalert2";
declare var $: any;
@Component({
  selector: "app-bulk-source-popup",
  templateUrl: "./bulk-source-popup.component.html",
  styleUrls: ["./bulk-source-popup.component.scss"],
  standalone: false,
})
export class BulkSourcePopupComponent implements OnInit {
  selectedCampaignList = [];
  selectedPaymentLocations = [];
  selectedPaymentReasons = [];
  selectedPaymentCollectors = [];
  isloading: boolean = false;
  gridFilterData = [];
  resctictEditOnDevices: string[] = ["Donary pay", "Shul kiosk", "Scheduler"];
  disableFields: boolean = false;
  restrictedDevicesTooltip = `You have selected one of the following devices: 1. Donary pay, 
  2. Shul kiosk, 3. Scheduler. Please deselect it to bulk edit the devices.`;
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public orderdeviceService: OrderdeviceService,
    public localstoragedataService: LocalstoragedataService
  ) {}
  @Input() set SourceData(data: any) {
    if (data) {
      this.gridFilterData = data;
    }
  }
  recallSourceList: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit() {
    // find data that contains any of these device 'Donary pay','Shul kiosk','Scheduler.
    let sourceData = this.gridFilterData.find((data) => {
      let deviceExist = this.resctictEditOnDevices?.find(
        (device) => device?.toLowerCase() == data.deviceName?.toLowerCase()
      );
      if (deviceExist) return true;
    });
    if (sourceData) this.disableFields = true; // disable editing if found any.
  }
  closePopup() {
    this.activeModal.dismiss();
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  saveData() {
    Swal.fire({
      icon: "warning",
      input: "number",
      showClass: {
        popup: `
              swal2-modal-primary
            `,
      },
      html: `<div>
                 <h2>Edit ${this.gridFilterData.length} sources?</h2>
                 <p>You're editing multiple sources.</p>
                 <span>To continue, type the amount of sources you selected. </span>
             </div>`,
      showCloseButton: true,
      confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
      confirmButtonColor: "#7b5bc4",
      customClass: { confirmButton: "modal-are-you-sure" },
      didOpen: () => {
        $(".swal2-actions").on("click", () =>
          $("#swal2-content + .swal2-input").focus()
        );
      },
      inputValidator: (value: any) => {
        if (value != this.gridFilterData.length) {
          return 'Count entered does not match selected count"!';
        }
      },
    }).then((result) => {
      if (result.value) {
        this.isloading = true;
        let bulkUpdateDeviceInputParam = [];
        const resultData = this.gridFilterData.map((x, i) => {
          bulkUpdateDeviceInputParam.push({
            OptionId: x.optionId,
            DeviceId: x.deviceId,
            DeviceName: x.deviceName,
            CampaignId:
              this.selectedCampaignList && this.selectedCampaignList.length > 0
                ? this.selectedCampaignList[0].id
                : 0,
            ReasonId:
              this.selectedPaymentReasons &&
              this.selectedPaymentReasons.length > 0
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
            UpdatedBy: this.localstoragedataService.getLoginUserId(),
          });
        });
        const obj = {
          bulkUpdateDeviceInputParam: bulkUpdateDeviceInputParam,
        };
        this.orderdeviceService.bulkUpdateDeviceOptions(obj).subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
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
                this.activeModal.dismiss({ success: true });
                this.recallSourceList.emit(true);
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
    });
  }

  onDeSelectAll(key) {
    switch (key) {
      case "selectedCampaignList":
        this.selectedCampaignList = [];
        break;
      case "selectedPaymentLocations":
        this.selectedPaymentLocations = [];
        break;
      case "selectedPaymentReasons":
        this.selectedPaymentReasons = [];
        break;
      case "selectedPaymentCollectors":
        this.selectedPaymentCollectors = [];
        break;
    }
  }
}
