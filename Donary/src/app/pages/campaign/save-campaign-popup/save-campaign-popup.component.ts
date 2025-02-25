import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CampaignService } from "src/app/services/campaign.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import Swal from "sweetalert2";
import { ImageCroppedEvent, ImageTransform } from "ngx-image-cropper";
import { Subject, Subscription } from "rxjs";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
interface presetAmount {
  amountID: number;
  amount: string;
  text: string;
  sort: number;
}
interface presetAmtObj {
  value: string;
  index: number;
}
@Component({
  selector: "app-save-campaign-popup",
  templateUrl: "./save-campaign-popup.component.html",
  styleUrls: ["./save-campaign-popup.component.scss"],
  standalone: false,
})
export class SaveCampaignPopupComponent implements OnInit {
  @Output() emtOutputEditCampaign: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputDismissCard: EventEmitter<any> = new EventEmitter();
  public teamFormatAmt$ = new Subject<presetAmtObj>();
  title: string;
  isloading: boolean = true;
  isEditMode: boolean = false;
  campaignName: string;
  campaignNumber: number;
  tempCampaignNumber: number;
  friendlyName: string;
  modalOptions: NgbModalOptions;
  parentCampaignId: Array<any>;
  campaignId: number;
  DonateImageBase64: string = null;
  DonateDescription: string;
  Goal: number;
  BonusGoal: number;
  imageUrl2;
  setCls2;
  imageUrl2Name;
  startingAtSelectedDate: any;
  endingAtSelectedDate: any;
  startingAtSelectedDateTemp: any;
  endingAtSelectedDateTemp: any;
  selectedDate: any;
  StartDateTime: any;
  isinitialize: number = 0;
  EndDateTime: any;
  isinitializeEn: number = 0;
  permissionType = 1;
  backToAllTeams = false;
  expandTeamToShowDonors = false;
  showTotalsPanel = false;
  showGroupPanel = false;
  showDonorPanel = false;
  showTeamPanel = false;
  hideTeamDetails = false;
  donateDisplayName: string;
  noteTitle: string = "";
  requireDonorsInfoAbove: number;
  isAudioFileSelected = false;
  eventBrandingDocList: Array<any> = [];
  mp3_size = 0;
  audioFileName: string;
  audioBase64: string;
  displayInShulKiosk = false;
  isDisplayImage = false;
  displayImageList: Array<any> = [];
  displayImageId: Array<any> = [];
  campaignMastersList = [];
  isDuplicateCampNumber = false;
  isSetBorderCls = "";
  presetAmounts: Array<presetAmount> = [];
  skeletonitems: any = [{}, {}, {}, {}];
  PageName: any = "SaveCampaignPopup";
  isOneDate: any = true;
  popTitle: any;
  private calendarSubscription: Subscription;
  startdate: string;
  endDate: string;
  startselectedDate: any;
  endselectedDate: any;
  private analytics = inject(AnalyticsService);

  @Input() set Type(data: any) {
    if (data) {
      if (data == "add") {
        this.title = "Create Campaign";
        this.isloading = false;
        this.isEditMode = false;
      } else {
        this.title = "EDITCAMPAIGN";
        this.isloading = false;
        this.isEditMode = true;
      }
    }
  }

  @Input() set EditCampaignData(data: any) {
    if (data) {
      this.campaignId = data.campaignId;
      this.campaignName = data.campaignName;
      this.campaignNumber = data.campaignNumber;
      this.tempCampaignNumber = data.campaignNumber;
      this.friendlyName = data.friendlyName;
      this.DonateDescription = data.donateDescription;
      this.Goal = data.goal;
      this.BonusGoal = data.bonusGoal;
      this.noteTitle = data.noteTitle;
      this.startingAtSelectedDateTemp = data.startDateTime;
      this.endingAtSelectedDateTemp = data.endDateTime;
      const startingAtSelectedDate = moment(this.startingAtSelectedDateTemp);
      const endingAtSelectedDate = moment(this.endingAtSelectedDateTemp);
      if (data.startDateTime) {
        this.startselectedDate = {
          startDate: moment(data.startDateTime),
          endDate: moment(data.startDateTime),
        };
      }
      if (data.endDateTime) {
        this.endselectedDate = {
          startDate: moment(data.endDateTime),
          endDate: moment(data.endDateTime),
        };
      }

      // // Convert to Hebrew calendar format
      this.startdate = startingAtSelectedDate.format("MM-DD-YYYY");
      this.endDate = endingAtSelectedDate.format("MM-DD-YYYY"); // or desired format
      if (this.startdate == "Invalid date") {
        this.startdate = null;
      }
      if (this.endDate == "Invalid date") {
        this.endDate = null;
      }
      this.backToAllTeams = data.backToAllTeams;
      this.expandTeamToShowDonors = data.expandTeamToShowDonors;
      this.showTotalsPanel = data.showTotalsPanel;
      this.showGroupPanel = data.showGroupPanel;
      this.showDonorPanel = data.showDonorPanel;
      this.showTeamPanel = data.showTeamPanel;
      this.hideTeamDetails = !data.hideTeamDetails;
      this.donateDisplayName = data.donateDisplayName;
      this.imageUrl2 = data.donateImageUrl;
      this.requireDonorsInfoAbove = data.requireDonorsInfoAbove;
      this.audioFileName = data.audioFileUrl;
      this.displayInShulKiosk =
        data.shulKioskTypeName && data.shulKioskTypeId ? true : false;
      this.isDisplayImage = this.displayInShulKiosk;
      this.presetAmounts = data.presetAmounts;

      if (this.presetAmounts.length == 0) {
        for (let index = 0; index < 6; index++) {
          let sort = index + 1;
          this.presetAmounts.push({
            amountID: 0,
            amount: null,
            text: null,
            sort: sort,
          });
        }
      } else {
        this.presetAmounts = this.presetAmounts.map((element) => {
          if (element.amount == "0") {
            element.amount = null;
          } else {
            element.amount = Number(element.amount).toFixed(2);
          }
          return element;
        });
        if (this.presetAmounts.length <= 6) {
          for (let index = this.presetAmounts.length; index < 6; index++) {
            let sort = index + 1;
            this.presetAmounts.push({
              amountID: 0,
              amount: null,
              text: null,
              sort: sort,
            });
          }
        }
      }
      if (this.displayInShulKiosk) {
        this.commonAPIMethodService
          .getShulKioskTypes()
          .subscribe((res: any) => {
            this.displayImageList = [];
            for (let index = 0; index < res.length; index++) {
              const element = res[index];
              this.displayImageList.push({
                id: element.shulKioskTypeId,
                itemName: element.shulKioskTypeName,
              });
            }
            this.displayImageId =
              this.displayInShulKiosk && this.displayImageList
                ? this.displayImageList.filter(
                    (x) => x.id == data.shulKioskTypeId
                  )
                : null;
          });
      }
      if (this.audioFileName != null) {
        var objaudio = {
          color: "",
          eventBrandingDocumentId: 130,
          eventId: 136,
          filePath: this.audioFileName,
        };
        this.eventBrandingDocList.push(objaudio);
        var fileURL = this.audioFileName;
        document.querySelector("audio").src = fileURL;
        this.isAudioFileSelected = true;
        $(".controls-audio").show();
      }
      $("#id_StartingAt").val(
        data.startDateTime ? moment(data.startDateTime).format("LL") : ""
      );
      var sdt = moment(data.startDateTime).format("hh:mm a");
      if (sdt != "Invalid date") {
        this.StartDateTime = data.startDateTime
          ? moment(data.startDateTime).format("hh:mm A")
          : "";
      }
      $("#id_EndingAt").val(
        data.endDateTime ? moment(data.endDateTime).format("LL") : ""
      );
      var edt = moment(data.endDateTime).format("hh:mm a");
      if (edt != "Invalid date") {
        this.EndDateTime = data.endDateTime
          ? moment(data.endDateTime).format("hh:mm A")
          : "";
      }
      this.parentCampaignId = this.commonMethodService.localCampaignList.filter(
        (s) => s.id == data.parentId
      );
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private campaignService: CampaignService,
    private localstoragedataService: LocalstoragedataService,
    private commonAPIMethodService: CommonAPIMethodService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
        cursor: " grab",
      });
    });
    this.campaignMastersList = this.commonMethodService.campaignMastersList;
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
  }

  SaveCampaignInfo() {
    var sdate;
    var edate;

    if (this.startdate) {
      sdate = this.startdate;
      if (this.StartDateTime) {
        sdate += " " + this.StartDateTime;
        this.startingAtSelectedDateTemp = null;
      }
    } else if (this.startingAtSelectedDateTemp) {
      sdate = moment(this.startingAtSelectedDateTemp).format("MM-DD-YYYY");
      if (this.StartDateTime) {
        sdate += " " + this.StartDateTime;
      }
    } else {
      sdate = null;
    }
    if (this.endDate) {
      edate = this.endDate;

      if (this.EndDateTime) {
        edate += " " + this.EndDateTime;
        this.endingAtSelectedDateTemp = null;
      }
    } else if (this.endingAtSelectedDateTemp) {
      edate = moment(this.endingAtSelectedDateTemp).format("MM-DD-YYYY");
      if (this.EndDateTime) {
        edate += " " + this.EndDateTime;
      }
    } else {
      edate = null;
    }
    if (this.presetAmounts.length >= 0) {
      this.presetAmounts = this.presetAmounts.map((element) => {
        if (element.amount == null || element.amount == "0.00") {
          element.amount = "-1";
        }
        return element;
      });
    }
    this.isloading = true;
    var campaignObj = {
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      createdBy: this.localstoragedataService.getLoginUserId(),
      campaignId: this.campaignId,
      parentCampaignId:
        this.parentCampaignId != null
          ? this.parentCampaignId.length > 0
            ? parseInt(this.parentCampaignId.map((s) => s.id).toString())
            : null
          : null,
      campaignName: this.campaignName,
      campaignNumber: this.campaignNumber,
      friendlyName: this.friendlyName,
      permissionType: null,
      DonateImageBase64: this.DonateImageBase64,
      DonateDisplayName: this.donateDisplayName,
      DonateDescription: this.DonateDescription,
      Goal: this.Goal == null || this.Goal.toString() == "" ? 0 : this.Goal,
      BonusGoal:
        this.BonusGoal == null || this.BonusGoal.toString() == ""
          ? 0
          : this.BonusGoal,
      StartDateTime: sdate,
      EndDateTime: edate,
      PermissionType: 1,
      audioFileName: this.audioFileName,
      audioBase64: this.audioBase64,
      BackToAllTeams: this.backToAllTeams,
      ExpandTeamToShowDonors: this.expandTeamToShowDonors,
      ShowTotalsPanel: this.showTotalsPanel,
      ShowGroupPanel: this.showGroupPanel,
      ShowDonorPanel: this.showDonorPanel,
      ShowTeamPanel: this.showTeamPanel,
      HideTeamDetails: !this.hideTeamDetails,
      requireDonorsInfoAbove: this.requireDonorsInfoAbove,
      shulKioskType:
        this.displayImageId != null
          ? this.displayImageId.length > 0
            ? parseInt(this.displayImageId.map((s) => s.id).toString())
            : 0
          : 0,
      presetAmounts: this.presetAmounts,
      noteTitle: this.noteTitle,
    };
    this.campaignService.saveCampaign(campaignObj).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          if (this.isEditMode) {
            this.analytics.editedCampaign();
            Swal.fire({
              title: "",
              text: "Campaign updated successfully",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then(() => {
              this.activeModal.dismiss();
              this.emtOutputEditCampaign.emit(res);
            });
          } else {
            this.analytics.createdCampaign();
            Swal.fire({
              title: "",
              text: "Campaign added successfully",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then(() => {
              this.activeModal.close(res);
            });
          }
          this.commonMethodService.sendCampaignLst(true);
          this.commonMethodService.getCampaignList();
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

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  getBase64AudioString(event) {
    let reader = new FileReader();

    reader.onload = this.handleReaderLoaded.bind(this);

    var file = event.target.files[0];
    this.mp3_size = file.size / 1024;
    document.querySelector("audio").src = "";
    if (this.mp3_size <= 3000) {
      var fileURL = URL.createObjectURL(event.target.files[0]);
      document.querySelector("audio").src = fileURL;
      this.isAudioFileSelected = true;
      this.audioFileName = event.target.files[0].name;
      $(".controls-audio").show();
    } else {
      Swal.fire({
        title: "File exceeds size limit",
        icon: "error",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
    }

    if (event.target.files && event.target.files[0]) {
      var reader1 = new FileReader();
      reader1.readAsDataURL(event.target.files[0]);
    }
  }

  deleteAudioFile() {
    for (let index = 0; index < this.eventBrandingDocList.length; index++) {
      this.eventBrandingDocList.splice(index, 1);
      document.querySelector("audio").src = "";
      $("#aud_file").val("");
      this.isAudioFileSelected = false;
      this.audioFileName = null;
      $(".controls-audio").hide();
    }
    this.audioBase64 = "-1";
  }

  duplicateCampNumber(event: any) {
    let val = event.target.value;
    if (this.tempCampaignNumber == val) {
      return;
    }
    const isElementPresent = this.campaignMastersList.filter(
      (o) => o.campaignNumber == val
    );
    if (isElementPresent.length > 0) {
      this.isDuplicateCampNumber = true;
      this.isSetBorderCls = "dublicate-acc-no";
    } else {
      this.isDuplicateCampNumber = false;
      this.isSetBorderCls = "";
    }
  }

  convertDecimal(j: number) {
    this.presetAmounts = this.presetAmounts.map((element, index) => {
      if (j == index) {
        element.amount = Number(element.amount).toFixed(2);
      }
      return element;
    });
  }

  handleReaderLoaded(e) {
    let base64textString = (e.target.result || "base64,").split("base64,")[1];
    this.audioBase64 = base64textString;

    let filename = "";
    filename = this.audioFileName;

    let obj = {
      Base64String: base64textString,
      FilePath: "",
      Color: "",
      FileName: filename,
    };

    this.eventBrandingDocList.push(obj);
    this.eventBrandingDocList =
      this.mp3_size <= 3000
        ? this.eventBrandingDocList
        : this.eventBrandingDocList.filter((x) => x.FileTypeId != 3);
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  deleteCampaign() {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this campaign!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        var objDonor = {
          eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          campaignId: this.campaignId,
          deletedBy: this.localstoragedataService.getLoginUserId(),
        };
        this.campaignService.deleteCampaign(objDonor).subscribe(
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
              this.commonMethodService.sendCampaignLst(true);
            } else {
              Swal.fire({
                title: "Try Again!",
                text: res.errorResponse,
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
          text: "Your campaign is safe :)",
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

  deleteUploadedImage() {
    this.imageUrl2 = null;
    this.DonateImageBase64 = "-1";
  }

  OnCampaignDeSelect() {
    this.parentCampaignId = null;
  }

  datesUpdated(event: any) {
    if (this.isinitialize == 1) {
    } else {
      this.isinitialize = 1;
    }
  }

  datesUpdatedEndigAt() {
    if (this.isinitializeEn == 1) {
    } else {
      this.isinitializeEn = 1;
    }
  }
  selectpkr() {
    $("#txtStartDateTime").click();
  }
  selectpkr1() {
    $("#txtEndDateTime").click();
  }
  backToAllTeamsCheck(event) {
    this.backToAllTeams = event.target.checked;
  }
  expandTeamToShowDonorsCheck(event) {
    this.expandTeamToShowDonors = event.target.checked;
  }
  showTotalsPanelCheck(event) {
    this.showTotalsPanel = event.target.checked;
  }
  showGroupPanelCheck(event) {
    this.showGroupPanel = event.target.checked;
  }
  showDonorPanelCheck(event) {
    this.showDonorPanel = event.target.checked;
  }
  showTeamPanelCheck(event) {
    this.showTeamPanel = event.target.checked;
  }
  hideTeamDetailsCheck(event) {
    this.hideTeamDetails = event.target.checked;
  }
  displayInShulKioskCheck(event) {
    this.displayInShulKiosk = event.target.checked;
    this.isDisplayInShulKioskChecked();
  }
  isDisplayInShulKioskChecked() {
    if (this.displayInShulKiosk) {
      this.isDisplayImage = true;
      this.commonAPIMethodService.getShulKioskTypes().subscribe((res: any) => {
        this.displayImageList = [];
        for (let index = 0; index < res.length; index++) {
          const element = res[index];
          this.displayImageList.push({
            id: element.shulKioskTypeId,
            itemName: element.shulKioskTypeName,
          });
        }
      });
    } else {
      this.isDisplayImage = false;
      this.displayImageId = [];
    }
  }
  //
  // crope image
  croppedImage: any = "";
  fromDbImg_2 = true;
  imageChangedEvent_2: any = "";
  scale_2 = 1;
  transform_2: ImageTransform = {};
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
    fetch(this.croppedImage)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64Val = base64data.replace(/^data:image\/\w+;base64,/, "");
          this.DonateImageBase64 = base64Val;
        };
      })
      .catch((error) => {
        console.error("Error converting objectUrl to base64:", error);
      });
    // $('.overlay').removeClass('overlay');
    $(".overlay").remove();
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  zoomOut(event, fileTypeId) {
    if (fileTypeId == 2) {
      this.scale_2 -= 0.1;
      this.transform_2 = {
        ...this.transform_2,
        scale: this.scale_2,
      };
    }
    event.preventDefault();
  }

  zoomIn(event, fileTypeId) {
    if (fileTypeId == 2) {
      this.scale_2 += 0.1;
      this.transform_2 = {
        ...this.transform_2,
        scale: this.scale_2,
      };
    }
    event.preventDefault();
  }
  getBase64StringNew(event) {
    this.imageChangedEvent_2 = event;
    this.fromDbImg_2 = false;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl2 = reader.result;
      this.setCls2 = "reg-img-preview";
      this.imageUrl2Name = file.name;
    };
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_campaign";
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }

  onClickedOutsidePopover(p: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p.close();
    } else {
    }
  }

  openHebrewCalendarPopup(value: string, p) {
    this.commonMethodService.featureName = null;
    //this.commonMethodService.openCalendarPopup(this.class_id, this.class_hid, this.selectedDateRange,true,"editPaymentDynamicsCalender");
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "SaveCampaignPopup" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          p.close();
          if (value == "start") {
            this.startselectedDate = items.obj;
            this.startdate = moment(
              this.hebrewEngishCalendarService.EngHebCalPlaceholder
            ).format("MM-DD-YYYY");
          } else {
            this.endselectedDate = items.obj;
            this.endDate = moment(
              this.hebrewEngishCalendarService.EngHebCalPlaceholder
            ).format("MM-DD-YYYY");
          }
        }
      });
  }
}
