import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { DeviceService } from "src/app/services/device.service";
import { ScheduleService } from "src/app/services/schedule.service";
import { PaymentlistCardPopupComponent } from "../paymentlist-card-popup/paymentlist-card-popup.component";
import { PledgelistCardPopupComponent } from "../pledgelist-card-popup/pledgelist-card-popup.component";
import { SchedulelistCardPopupComponent } from "../schedulelist-card-popup/schedulelist-card-popup.component";
import { environment } from "./../../../../environments/environment";
import { SourceFilterComponent } from "../../source/source-filter/source-filter.component";
import { LocationService } from "src/app/services/location.sevice";
import { LocationCardPopupComponent } from "../../cards/location-card-popup/location-card-popup.component";
import { ReasonService } from "src/app/services/reason.service";
import { ReasonCardPopupComponent } from "../reason-card-popup/reason-card-popup.component";
import { CollectorCardPopupComponent } from "../collector-card-popup/collector-card-popup.component";
import { CollectorService } from "./../../../services/collector.service";
import { CampaignCardPopupComponent } from "../campaign-card-popup/campaign-card-popup.component";
import { CampaignService } from "src/app/services/campaign.service";
import { EditSourceCardPopupComponent } from "src/app/pages/cards/edit-source-card-popup/edit-source-card-popup.component";
import { MapViewCardPopupComponent } from "../map-view-card-popup/map-view-card-popup.component";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { ImageCroppedEvent } from "ngx-image-cropper";
import Swal from "sweetalert2";
import { AuthService } from "src/app/services/auth.service";
import { Subscription } from "rxjs";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";

declare var $: any;
@Component({
  selector: "app-device-card-popup",
  templateUrl: "./device-card-popup.component.html",
  styleUrls: ["./device-card-popup.component.scss"],
  standalone: false,
})
export class DeviceCardPopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  // selectedDateRange: any = { startDate: null, endDate: null };
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @Output() emtDeviceCardData: EventEmitter<any> = new EventEmitter();
  @Input() sourceobj: any;
  @Input("selectedDateRange") selectedDateRange?: any;
  modalOptions: NgbModalOptions;
  isloading: boolean = true;
  startDate: any = null;
  endDate: any = null;
  address: null;
  battery: string;
  campaignName: string;
  disableDoubleClickEvent: boolean = false;
  PageName: any = "DeviceCard";
  isOneDate: any = false;
  city: string;
  country: string;
  deviceId: number;
  deviceNum: number;
  deviceName: string;
  lastSync: string;

  macAddress: string;
  pin: string;
  plan: string;
  price: number;
  reasonName: string;
  signal: string;
  simNum: string;
  simPhoneNum: string;
  state: string;
  status: string;
  payments: number;
  openPledges: number;
  scheduled: number;
  raised: number;
  version: number;
  zip: number;
  collectorName: string;
  transDate: string;
  cityStateZip: string;
  isSave: boolean = false;
  popTitle: any;
  activatedOn: any;
  deActivatedOn: any;

  iFrameUrl: any;
  isMapShow: Boolean = false;
  skeletonitems: any = [{}, {}, {}];
  skeletonitems2: any = [{}, {}];
  isinitialize: number = 0;
  objAdvancedSearch: any;
  filtercount = 0;

  locationId: number;
  locationName: string;
  reasonId: number;
  collectorId: number;
  campaignId: number;
  accountId: number;
  deviceOptionPIN: string;
  optionID: number;
  latitude: string;
  longitude: string;
  isBulletInImageUploaded: boolean = false;

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;
  selectedImage: any;
  ImageSelected: boolean = false;
  fileTypeId: any;
  eventBrandingDocList: Array<any> = [];
  imageUrlName: any;
  imageChangedEvent_1: any;
  fromDbImg_1: boolean;
  imageUrl;
  setCls = "";
  croppedImage: string;
  settingId: number;
  replace: boolean = false;
  settingValue: any;
  imageLink: any;
  base64String: any;
  isImageSaved: boolean;
  deviceOptionName: any;
  allowPaymentListCard: boolean = true;
  allowPledgeListCard: boolean = true;
  allowScheduleListCard: boolean = true;
  private calendarSubscription: Subscription;

  recallSourceListValues: EventEmitter<any> = new EventEmitter<any>();

  @Input() set DeviceCardData(DeviceCardValue: any) {
    if (DeviceCardValue) {
      this.setValue(DeviceCardValue);
    }
  }

  @Input() set objAdvanceSearch(advanceSearch: any) {
    if (advanceSearch) {
      this.objAdvancedSearch = advanceSearch;
      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true ||
          filtervalue == false
        ) {
        } else {
          this.filtercount += 1;
        }
      }
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private cardService: CardService,
    private deviceService: DeviceService,
    private authService: AuthService,
    private scheduleService: ScheduleService,
    private localstoragedataService: LocalstoragedataService,
    public sanitizer: DomSanitizer,
    private datePipe: DonaryDateFormatPipe,
    private locationService: LocationService,
    private reasonService: ReasonService,
    private collectorService: CollectorService,
    public commonService: CommonMethodService,
    private campaignService: CampaignService,
    public ngbModal: NgbModal,

    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    this.ngbModal.activeInstances.subscribe((i) => {
      if (i.length !== 0) {
        const havePaymentCard = i.filter((o) => {
          return o.componentInstance instanceof PaymentlistCardPopupComponent;
        });
        const havePledgeCard = i.filter((o) => {
          return o.componentInstance instanceof PledgelistCardPopupComponent;
        });
        const haveScheduleCard = i.filter((o) => {
          return o.componentInstance instanceof SchedulelistCardPopupComponent;
        });

        if (havePaymentCard.length !== 0) {
          this.allowPaymentListCard = false;
        } else {
          this.allowPaymentListCard = true;
        }
        if (havePledgeCard.length !== 0) {
          this.allowPledgeListCard = false;
        } else {
          this.allowPledgeListCard = true;
        }
        if (haveScheduleCard.length !== 0) {
          this.allowScheduleListCard = false;
        } else {
          this.allowScheduleListCard = true;
        }
      }
    });
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".cards_secton,.modal__custom_header,.donor_information",
        cursor: "grab",
        cancel: ".donor_name,.sort_num",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  transformDate(date) {
    return this.datePipe.transform(date, "long");
  }

  getLastSyncPayload(): string {
    return this.lastSync
      ? `${this.datePipe.transform(this.lastSync, "describe")}`
      : "";
  }

  getBase64String(event) {
    this.isSave = true;
    let reader = new FileReader();

    reader.onload = this.handleReaderLoaded.bind(this);
    let file = event.target.files[0];
    this.imageUrlName = file.name;
    this.imageChangedEvent_1 = event;
    this.fromDbImg_1 = false;

    if (event.target.files && event.target.files[0]) {
      let reader1 = new FileReader();
      // this.imageUrl = file.name;
      //     this.setCls = "reg-img-preview";
      reader1.onload = (event: any) => {
        this.imageUrl = event.target.result;
        this.setCls = "reg-img-preview";
        this.isBulletInImageUploaded = true;
      };
      reader1.readAsDataURL(event.target.files[0]);
    }
  }

  handleReaderLoaded(e) {
    let base64textString = (e.target.result || "base64,").split("base64,")[1];
    let filename = "";
    filename = this.imageUrlName;

    let obj = {
      Base64String: base64textString,
      FilePath: "",
      Color: "",
      FileName: filename,
    };
    this.base64String = base64textString;
    this.eventBrandingDocList.push(obj);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.crooppedImageGetBase64String(event.base64);
    $(".overlay").remove();
  }

  saveImage() {
    this.isImageSaved = true;
    this.disableDoubleClickEvent = true;
    var objPayload = {
      base64string: this.base64String,
      fileName: this.imageUrlName,
    };
    this.authService.uploadImageToBlob(objPayload).subscribe((res: any) => {
      if (res) {
        this.imageLink = res;
      }
      var objSaveImage = {
        deviceID: this.deviceId,
        settingId: this.commonMethodService.BulletinImageSettingId,
        settingValue: this.imageLink,
      };
      this.deviceService.saveDeviceSetting(objSaveImage).subscribe(
        (res: any) => {
          if (res) {
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SUCCESS_TITLE"
              ),
              text: null,
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
            this.getImageSetting();
          }
        },
        (error) => {
          Swal.fire({
            title: "Error while fetching data !!",
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
    });
  }

  Remove() {
    Swal.fire({
      title: "Are you sure you want to delete ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.isBulletInImageUploaded = false;
        this.isSave = true;
        var objSaveImage = {
          deviceID: this.deviceId,
          settingId: this.commonMethodService.BulletinImageSettingId,
          settingValue: null,
        };
        this.deviceService.saveDeviceSetting(objSaveImage).subscribe(
          (res: any) => {
            if (res) {
              Swal.fire({
                title: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.SUCCESS_TITLE"
                ),
                text: null,
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
              this.getImageSetting();
            }
          },
          (error) => {
            Swal.fire({
              title: "Error while fetching data !!",
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
      } else {
      }
    });
  }

  getImageSetting() {
    if (this.isImageSaved) {
      this.isSave = false;
    }
    this.disableDoubleClickEvent = false;
    this.deviceService
      .getDeviceSettingById(this.deviceId)
      .subscribe((res: any) => {
        if (res) {
          (this.settingId = res[0].settingID),
            (this.settingValue = res[0].deviceSettingValue);
          if (res[0].deviceSettingValue != null) {
            this.isBulletInImageUploaded = true;
          }
          this.imageUrl = res[0].deviceSettingValue;
          this.base64String = res[0].deviceSettingValue;
          this.fromDbImg_1 = true;
        }
      });
  }
  crooppedImageGetBase64String(e) {
    let base64textString = (e || "base64,").split("base64,")[1];
    let filename = "";
    filename = this.imageUrlName;

    let obj = {
      Base64String: base64textString,
      FilePath: "",
      Color: "",
      FileName: filename,
    };
    this.base64String = base64textString;
    this.eventBrandingDocList.push(obj);
  }

  CopyLastSync(event) {
    event.preventDefault();
    let payload = this.getLastSyncPayload();
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", payload);
      e.preventDefault();
    };

    document.addEventListener("copy", listener, false);
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
  }

  // copy campaign and collector name
  CopyCommonText(event, text) {
    event.preventDefault();
    let payload = text ? `${text.toString()}` : "";
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", payload);
      e.preventDefault();
    };

    document.addEventListener("copy", listener, false);
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
  }

  setValue(data) {
    this.iFrameUrl = `https://www.google.com/maps/embed/v1/place?key=${environment.GOOGLE_MAP_API_KEY}&q=`;
    this.address = data.address;
    this.battery = data.battery == null ? "" : data.battery + "%";
    this.campaignName = data.campaignName;
    this.city = data.city;
    this.country = data.country;
    this.deviceId = data.deviceId;
    this.deviceNum = data.deviceNum;
    this.deviceName = data.deviceName;
    this.deviceOptionName = data.deviceOptionName;
    this.lastSync = data.lastSync;
    this.macAddress = data.macAddress;
    this.pin = data.pin ? data.pin : data.deviceOptionPIN;
    this.plan = data.plan;
    this.price = data.price;
    this.reasonName = data.reasonName;
    this.signal = data.signal;
    this.simNum = data.simNum;
    this.simPhoneNum = data.simPhoneNum;
    this.state = data.state;
    this.status = data.status;
    this.payments = data.totalPanel.payments;
    this.openPledges = data.totalPanel.openPledges;
    this.raised = data.totalPanel.raised;
    this.scheduled = data.totalPanel.scheduled;
    this.version = data.version;
    this.zip = data.zip;
    this.cityStateZip =
      (data.city == null ? "" : data.city + " ") +
      (data.state == null ? "" : data.state + " ") +
      (data.zip == null ? "" : data.zip + " ,") +
      (data.country == null ? "" : data.country);

    if (!!this.address && !!this.cityStateZip) {
      this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.iFrameUrl}${this.address} ${this.cityStateZip}`
      );
      this.isMapShow = true;
    }

    this.collectorName = data.collectorName;
    this.transDate = data.transDate;

    this.activatedOn = data.activatedOn;
    this.deActivatedOn = data.deActivatedOn;

    this.locationId = data.locationId;
    this.locationName = data.locationName;
    this.reasonId = data.reasonId;
    this.campaignId = data.campaignId;
    this.collectorId = data.collectorId;
    this.accountId = data.accountId;
    this.deviceOptionPIN = data.deviceOptionPIN
      ? data.deviceOptionPIN
      : data.pin;
    this.optionID = data.optionID;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.getImageSetting();
    this.isloading = false;
  }

  openPaymentListCardPopup(deviceId) {
    if (!this.allowPaymentListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup payment_list device_payment reason_payment  reasonpayment  modal-position",
      container: "#card-payment",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentlistCardPopupComponent,
      this.modalOptions
    );
    var objPaymentListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      deviceIds: [deviceId],
      DateFrom:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      DateTo:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
    };

    this.cardService
      .getPaymentCardList(objPaymentListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.PaymentCardListData = res;
        modalRef.componentInstance.DeviceId = deviceId;
      });
    modalRef.componentInstance.emtOutputPaymentCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.modal__custom_header,.donor_information",
          cursor: "grab",
        });
      }
    });

    modalRef.result
      .then(() => {
        this.allowPaymentListCard = true;
      })
      .catch(() => {
        this.allowPaymentListCard = true;
      });
  }

  openPledgeListCardPopup(deviceId) {
    if (!this.allowPledgeListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup pledge_list device_pledge reason_pledge reasonon_pledge modal-position",
      container: "#card-pledge",
    };
    const modalRef = this.commonMethodService.openPopup(
      PledgelistCardPopupComponent,
      this.modalOptions
    );
    var objPledgeListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      deviceIds: [deviceId],
      fromDate:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
    };

    this.cardService
      .getPledgeCardList(objPledgeListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.PledgeCardListData = res;
        modalRef.componentInstance.DeviceId = deviceId;
      });
    modalRef.componentInstance.emtOutputPledgeCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.modal__custom_header,.donor_information",
          cursor: "grab",
        });
      }
    });
    modalRef.result
      .then(() => {
        this.allowPledgeListCard = true;
      })
      .catch(() => {
        this.allowPledgeListCard = true;
      });
  }

  openScheduleListCardPopup(deviceId) {
    if (!this.allowScheduleListCard) return;
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup schedule_list device_schedule reason_schedule modal-position",
      container: "#card-shedule",
    };
    const modalRef = this.commonMethodService.openPopup(
      SchedulelistCardPopupComponent,
      this.modalOptions
    );
    var objScheduleListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      deviceIds: [deviceId],
      dateFrom:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      dateTo:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
    };
    this.scheduleService
      .getSchedulePaymentPledgeList(objScheduleListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedPaymentDateRange =
            this.selectedDateRange;
          modalRef.componentInstance.selectedPledgeDateRange =
            this.selectedDateRange;
        }

        modalRef.componentInstance.ScheduleCardListData = res;
        modalRef.componentInstance.DeviceId = deviceId;
      });
    modalRef.componentInstance.emtOutputScheduleCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.modal__custom_header,.donor_information",
          cursor: "grab",
        });
      }
    });
    modalRef.result
      .then(() => {
        this.allowScheduleListCard = true;
      })
      .catch(() => {
        this.allowScheduleListCard = true;
      });
  }

  searchDeviceCardData() {
    this.isloading = true;
    if (this.objAdvancedSearch) {
      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true ||
          filtervalue == false
        ) {
        } else {
          this.filtercount += 1;
        }
      }
    }
    var objDeviceCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      deviceId: this.deviceId,
      fromDate:
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      listFilters: {
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
            : null,
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId
            : null,
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
            : null,
      },
    };
    this.deviceService.getDeviceCard(objDeviceCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      if (res) {
        this.setValue(res);
      }
    });
  }

  openSearchFilterPopup() {
    this.isloading = false;

    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "device_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      SourceFilterComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = true;
    modalRef.componentInstance.emtOutputSourceFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.searchDeviceCardData();
      }
    );
  }

  openLocationCardPopup(locationId) {
    if (locationId != null && locationId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup location_card source_location",
      };
      const modalRef = this.commonMethodService.openPopup(
        LocationCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.LocationId = locationId;
      var objCollectorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        locationId: locationId,
      };
      this.locationService
        .getLocationCard(objCollectorCard)
        .subscribe((res: any) => {
          this.isloading = false;
          if (res) {
            modalRef.componentInstance.LocationCardData = res;
          }
        });
    }
  }

  openCollectorCardPopup(collectorId) {
    if (!collectorId) {
      return;
    }

    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup collector_card source_collector",
    };
    const modalRef = this.commonMethodService.openPopup(
      CollectorCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CollectorId = collectorId;
    var objCollectorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      collectorId: collectorId,

      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
    };
    this.collectorService
      .getCollectorCard(objCollectorCard)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          if (
            this.selectedDateRange != undefined &&
            this.selectedDateRange.startDate != null
          ) {
            modalRef.componentInstance.selectedDateRange =
              this.selectedDateRange;
          }

          modalRef.componentInstance.CollectorCardData = res;
        }
      });
  }

  openReasonCardPopup(reasonId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reason_card  source_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReasonCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.ReasonId = reasonId;
    const obj = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      reasonId: reasonId,
    };
    this.reasonService.getReasonCard(obj).subscribe(
      (res: any) => {
        this.isloading = false;
        modalRef.componentInstance.ReasonCardData = res;
      },
      () => {
        this.isloading = false;
      }
    );
  }

  openCampaignCardPopup(campaignId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup collector_card source_campaign",
    };
    const modalRef = this.commonMethodService.openPopup(
      CampaignCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CampaignID = campaignId;
    const obj = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      CampaignId: campaignId,
    };
    this.campaignService.getCampaignCard(obj).subscribe(
      (res: any) => {
        this.isloading = false;
        modalRef.componentInstance.CampaignCardData = res;
        modalRef.componentInstance.CampaignId = campaignId;
      },
      () => {
        this.isloading = false;
      }
    );
  }

  editSourceCard() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup collector_card source_campaign edit-source-card-pin",
    };
    const modalRef = this.commonMethodService.openPopup(
      EditSourceCardPopupComponent,
      this.modalOptions
    );
    let obj = {
      deviceOptionPIN: this.deviceOptionPIN,
      optionID: this.optionID,
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      campaignId: this.campaignId,
      campaignName: this.campaignName,
      reasonId: this.reasonId,
      reasonName: this.reasonName,
      locationId: this.locationId,
      locationName: this.locationName,
      collectorId: this.collectorId,
      collectorName: this.collectorName,
      transDate: this.transDate,
      pin: this.pin,
    };
    var Sourceobj = obj;
    modalRef.componentInstance.SourceCardData = Sourceobj;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.isloading = true;
        setTimeout(() => {
          this.setValue(objResponse), 20;
        });
        this.emtDeviceCardData.emit(objResponse);
      }
    );
    modalRef.componentInstance.recallSourceList.subscribe((val) => {
      if (val) this.recallSourceListValues.emit(true);
    });
  }
  openMapCardPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reason_card payment_card_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      MapViewCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.MapViewCardData = {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "DeviceCard" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.searchDeviceCardData();
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
