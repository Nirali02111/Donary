import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import Swal from "sweetalert2";
import { ImageCroppedEvent, ImageTransform } from "ngx-image-cropper";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { ColorWarningComponent } from "src/app/pages/cards/color-warning/color-warning.component";
declare let $: any;

interface GateWay {
  gatewayId: number;
  gatewayName: string;
}

interface stateObj {
  abbreviations: string;
  name: string;
}

interface alteredDocsObj {
  id: number;
  action: "add" | "delete" | "replace";
}

@Component({
  selector: "app-organization-details-form-group",
  templateUrl: "./organization-details-form-group.component.html",
  standalone: false,
  styleUrls: ["./organization-details-form-group.component.scss"],
})
export class OrganizationDetailsFormGroupComponent
  implements OnInit, AfterContentInit
{
  isBranding = true;
  isOrganzation = true;
  @Input() formGroup!: UntypedFormGroup;
  @Input() set isorganzation(res: boolean) {
    this.isOrganzation = res;
    this.isBranding = false;
  }
  @Input() set isregister(res: boolean) {
    this.isOrganzation = true;
    this.isBranding = true;
  }
  @Input() set isbranding(isBranding: boolean) {
    this.isBranding = isBranding;
    this.isOrganzation = false;
    setTimeout(() => {
      this.updateEventDoc();
    }, 1000);
  }
  @Input() isloading: boolean = false;

  @Output() submited = new EventEmitter();
  @Output() isBrandingEnable = new EventEmitter();
  @ViewChild("organizationLogo", { static: false })
  organizationLogo: ElementRef;
  isCardKnox = false;
  gateWayList: Array<GateWay> = [];
  stateList: Array<stateObj> = [];
  eventBrandingDocList: Array<any> = [];
  base64textString = [];
  fileTypeId: number;
  isFormSubmited: boolean = false;
  orgAddress: "";
  contactAddress: "";

  imageUrl;
  imageUrlName;
  imageUrl2;
  imageUrl2Name;
  imageUrl3;
  imageUrl3Name;
  imageUrl5;
  imageUrl5Name;
  setCls = "";
  setCls2 = "";
  audioUrl;
  isPlay = true;
  isAudioFileSelected = false;
  audioFileName;
  mp3_size = 0;
  isUSAEPAY = false;
  modalOptions = {
    centered: true,
    windowClass: "modal-warn",
  };

  alteredBrandingDocs: alteredDocsObj[] = [];

  public get organization(): AbstractControl {
    return this.formGroup.get("OrgName");
  }

  public get taxId(): AbstractControl {
    return this.formGroup.get("TaxId");
  }

  public get OrgHouseNum(): AbstractControl {
    return this.formGroup.get("OrgHouseNum");
  }

  public get OrgStreet(): AbstractControl {
    return this.formGroup.get("OrgStreet");
  }

  public get OrgApt(): AbstractControl {
    return this.formGroup.get("OrgApt");
  }

  public get OrgCity(): AbstractControl {
    return this.formGroup.get("OrgCity");
  }

  public get OrgState(): AbstractControl {
    return this.formGroup.get("OrgState");
  }

  public get OrgZip(): AbstractControl {
    return this.formGroup.get("OrgZip");
  }

  public get OrgPhone(): AbstractControl {
    return this.formGroup.get("OrgPhone");
  }

  public get OrgEmail(): AbstractControl {
    return this.formGroup.get("OrgEmail");
  }

  // Contact Section
  public get ContactName(): AbstractControl {
    return this.formGroup.get("ContactName");
  }

  public get ContactHouseNum(): AbstractControl {
    return this.formGroup.get("ContactHouseNum");
  }

  public get ContactStreet(): AbstractControl {
    return this.formGroup.get("ContactStreet");
  }

  public get ContactApt(): AbstractControl {
    return this.formGroup.get("ContactApt");
  }

  public get ContactCity(): AbstractControl {
    return this.formGroup.get("ContactCity");
  }

  public get ContactState(): AbstractControl {
    return this.formGroup.get("ContactState");
  }

  public get ContactZip(): AbstractControl {
    return this.formGroup.get("ContactZip");
  }

  public get ContactPhone(): UntypedFormArray {
    return this.formGroup.get("ContactPhone") as UntypedFormArray;
  }

  public get ContactEmail(): UntypedFormArray {
    return this.formGroup.get("ContactEmail") as UntypedFormArray;
  }

  // Biling
  public get CCMerchant(): AbstractControl {
    return this.formGroup.get("CCMerchant");
  }

  public get CCGateway(): AbstractControl {
    return this.formGroup.get("CCGateway");
  }

  public get APIKey(): AbstractControl {
    return this.formGroup.get("APIKey");
  }

  public get Pin(): AbstractControl {
    return this.formGroup.get("Pin");
  }

  public get OJCApiKey(): AbstractControl {
    return this.formGroup.get("OJCApiKey");
  }

  public get EventBrandingDocs(): UntypedFormArray {
    return this.formGroup.get("EventBrandingDocs") as UntypedFormArray;
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private fb: UntypedFormBuilder,
    private commonAPI: CommonAPIMethodService,
    private commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    this.commonAPI.getAPIGateways().subscribe(
      (res: Array<GateWay>) => {
        if (res) {
          this.gateWayList = res;
        }
      },
      (err) => {}
    );

    this.commonAPI.getStates().subscribe(
      (res: Array<stateObj>) => {
        this.isloading = false;
        if (res) {
          this.stateList = res;
        }
      },
      (err) => {
        this.isloading = false;
      }
    );
    this.CCGateway.valueChanges.subscribe((val) => {
      if (val == "2") {
        this.isCardKnox = true;
      } else {
        this.isCardKnox = false;
      }
    });
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  addContactPhone() {
    if (this.ContactEmail.length < 2) {
      this.ContactPhone.push(
        this.fb.control("", Validators.compose([Validators.required]))
      );
    }
  }

  addContactEmail() {
    if (this.ContactEmail.length < 2) {
      this.ContactEmail.push(
        this.fb.control(
          "",
          Validators.compose([Validators.required, Validators.email])
        )
      );
    }
  }

  addFile() {
    this.ContactEmail.push(
      this.fb.control(
        "",
        Validators.compose([Validators.required, Validators.email])
      )
    );
  }

  customSearchFn(term: string, item: { name: string; abbreviations: string }) {
    let terms = term.toLowerCase();
    return (
      item.name.toLowerCase().indexOf(terms) > -1 ||
      item.abbreviations.toLowerCase() === terms
    );
  }

  onChangeGateway(event) {
    if (event.target.value == "2") {
      this.isCardKnox = true;
    } else {
      this.isCardKnox = false;
    }
    if (event.target.value == "3") {
      this.isUSAEPAY = true;
    } else {
      this.isUSAEPAY = false;
    }
  }

  getBase64String(event, fileTypeId) {
    let selectedFile = event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    this.fileTypeId = fileTypeId;

    this.eventBrandingDocList = this.eventBrandingDocList.filter(
      (o) => o.FileTypeId !== fileTypeId
    );

    reader.onload = this.handleReaderLoaded.bind(this);
    if (fileTypeId == 1) {
      let file = event.target.files[0];
      this.imageUrlName = file.name;
      this.imageChangedEvent_1 = event;
      this.fromDbImg_1 = false;
    }
    if (fileTypeId == 2) {
      let file = event.target.files[0];
      this.imageUrl2Name = file.name;
      this.imageChangedEvent_2 = event;
      this.fromDbImg_2 = false;
    }

    if (fileTypeId == 4) {
      let file = event.target.files[0];
      this.imageUrl3Name = file.name;
      this.imageChangedEvent_4 = event;
      this.fromDbImg_4 = false;
    }
    if (fileTypeId == 5) {
      let file = event.target.files[0];
      this.imageUrl5Name = file.name;
      this.imageChangedEvent_5 = event;
      this.fromDbImg_5 = false;
    }
    if (fileTypeId == 3) {
      let file = event.target.files[0];
      this.mp3_size = file.size / 1024;
      document.querySelector("audio").src = "";
      if (this.mp3_size <= 3000) {
        let fileURL = URL.createObjectURL(event.target.files[0]);
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
    }

    if (event.target.files && event.target.files[0]) {
      let reader1 = new FileReader();
      reader1.onload = (event: any) => {
        if (fileTypeId == 1) {
          this.imageUrl = event.target.result;
          this.setCls = "reg-img-preview";
        }
        if (fileTypeId == 2) {
          this.imageUrl2 = event.target.result;
          this.setCls2 = "reg-img-preview";
        }

        if (fileTypeId == 4) {
          this.imageUrl3 = event.target.result;
          this.setCls2 = "reg-img-preview";
        }
        if (fileTypeId == 5) {
          this.imageUrl5 = event.target.result;
          this.setCls2 = "reg-img-preview";
        }
      };
      reader1.readAsDataURL(event.target.files[0]);
    }

    const deletedFileIndex = this.alteredBrandingDocs.findIndex(
      (doc) => doc.id == fileTypeId && doc.action == "delete"
    );
    if (deletedFileIndex != -1) {
      this.alteredBrandingDocs.splice(deletedFileIndex, 1);
      this.alteredBrandingDocs.push({ id: fileTypeId, action: "replace" });
    } else this.alteredBrandingDocs.push({ id: fileTypeId, action: "add" });
  }

  handleReaderLoaded(e) {
    let base64textString = (e.target.result || "base64,").split("base64,")[1];

    let filename = "";

    if (this.fileTypeId == 1) {
      filename = this.imageUrlName;
    }

    if (this.fileTypeId == 2) {
      filename = this.imageUrl2Name;
    }

    if (this.fileTypeId == 3) {
      filename = this.audioFileName;
    }

    if (this.fileTypeId == 4) {
      filename = this.imageUrl3Name;
    }
    if (this.fileTypeId == 5) {
      filename = this.imageUrl5Name;
    }
    let obj = {
      FileTypeId: this.fileTypeId,
      Base64String: base64textString,
      FilePath: "",
      Color: "",
      FileName: filename,
    };

    this.eventBrandingDocList.push(obj);

    if (this.fileTypeId == 3) {
      this.eventBrandingDocList =
        this.mp3_size <= 3000
          ? this.eventBrandingDocList
          : this.eventBrandingDocList.filter((x) => x.FileTypeId != 3);
    }
  }

  checkImageLightness(event, i) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        this.getImageLightness(reader.result).then((whiteness: number) => {
          if (whiteness < 50) {
            this.organizationLogo.nativeElement.value = "";
            const modalRef = this.commonMethodService.openPopup(
              ColorWarningComponent,
              this.modalOptions
            );
            modalRef.result
              .then((data) => {
                if (data["uploadNew"]) {
                  this.organizationLogo.nativeElement.click();
                }
              })
              .catch((err) => {});
          } else this.getBase64String(event, i);
        });
      });
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  // get the image. draw it on canvas. get pixels and their rgb values. check how many % of white pixels are there in color return percentage
  getImageLightness(imageSrc) {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.style.display = "none";
    document.body.appendChild(img);

    return new Promise((resolve, reject) => {
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let whiteCount = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          // Check if pixel is white (R, G, and B values are all above 252)
          if (pixels[i] >= 252 && pixels[i + 1] >= 252 && pixels[i + 2] >= 252)
            whiteCount++;
        }

        const whitePercentage = (whiteCount / (pixels.length / 4)) * 100;
        resolve(whitePercentage);
      };
    });
  }

  onOrgAddressChange(data: any) {
    this.formGroup.patchValue({
      OrgHouseNum: data.streetNumber,
      OrgStreet: `${data.streetNumber} ${data.streetName}`,
      OrgApt: data.locality.long,
      OrgCity: data.locality.long || data.locality.short || data.sublocality,
      OrgState: data.state.short,
      OrgZip: data.postalCode,
    });
  }

  onContactAddressChange(data: any) {
    this.formGroup.patchValue({
      ContactHouseNum: data.streetNumber,
      ContactStreet: `${data.streetNumber} ${data.streetName}`,
      ContactApt: data.locality.long,
      ContactCity:
        data.locality.long || data.locality.short || data.sublocality,
      ContactState: data.state.short,
      ContactZip: data.postalCode,
    });
  }

  /** set fileTypeIds of docs which will be added to the payload as eventBrandingDocs */
  updateAlteredBrandingDocs(fileTypeId) {
    const existingFile = this.alteredBrandingDocs.find(
      (doc) => doc.id == fileTypeId
    );

    let index = this.alteredBrandingDocs.findIndex(
      (doc) => doc.id == existingFile?.id
    );
    if (existingFile?.action == "add") this.alteredBrandingDocs.splice(index);
    else if (existingFile?.action == "replace")
      this.alteredBrandingDocs[index].action = "delete";
    else this.alteredBrandingDocs.push({ id: fileTypeId, action: "delete" });
  }

  deleteAudioFile(fileTypeId) {
    this.updateAlteredBrandingDocs(fileTypeId);
    for (let index = 0; index < this.eventBrandingDocList.length; index++) {
      const element = this.eventBrandingDocList[index];
      if (element.FileTypeId == fileTypeId) {
        this.eventBrandingDocList.splice(index, 1);
        document.querySelector("audio").src = "";
        $("#aud_file").val("");
        this.isAudioFileSelected = false;
        this.audioFileName = null;
        $(".controls-audio").hide();
      }
    }
  }

  addEventBrandingDocs() {
    this.EventBrandingDocs.clear();
    this.eventBrandingDocList.forEach((element) => {
      this.EventBrandingDocs.push(this.fb.control(element));
    });
  }

  onRegister() {
    if (this.isCardKnox) {
      this.formGroup.controls["Pin"].setErrors(null);
    }

    this.isFormSubmited = true;

    this.addEventBrandingDocs();
    if (!this.isBranding) {
      if (
        !this.organization.valid ||
        !this.taxId.valid ||
        !this.OrgStreet.valid ||
        !this.OrgApt.valid ||
        !this.OrgCity.valid ||
        !this.OrgState.valid ||
        !this.OrgZip.valid ||
        !this.OrgPhone.valid ||
        !this.OrgEmail.valid
      ) {
        setTimeout(() => {
          window.scrollTo(0, 100);
        }, 150);
        return;
      } else if (
        !this.ContactName.valid ||
        !this.ContactHouseNum.valid ||
        !this.ContactStreet.valid ||
        !this.ContactApt.valid ||
        !this.ContactCity.valid ||
        !this.ContactZip.valid ||
        !this.ContactState.valid ||
        !this.APIKey.valid
      ) {
        setTimeout(() => {
          window.scrollTo(0, 600);
        }, 150);
        return;
      } else if (this.isCardKnox) {
        if (!this.Pin.valid) {
          setTimeout(() => {
            window.scrollTo(0, 600);
          }, 150);
          return;
        }
      }
    }
    if (this.isBranding) {
      this.isBrandingEnable.emit(true);
    }
    this.updateContactSection();
    this.submited.emit({ alteredBrandingDocs: this.alteredBrandingDocs });
  }

  updateContactSection() {
    let OrgHouseNumVal = "";
    //let ContactHouseNumVal = "";
    let OrgStreetVal: "";
    //let ContactStreetVal: "";
    let OrgStreetStr = this.formGroup.value.OrgStreet;
    // let ContactStreetStr = this.formGroup.value.ContactStreet;
    if (OrgStreetStr) {
      let oss = OrgStreetStr.split(" ");
      OrgHouseNumVal = oss.length > 0 ? oss[0] : "";
      let mystring = OrgStreetStr;
      let newstr = mystring.replace(OrgHouseNumVal, "");
      OrgStreetVal = newstr.trim();
    }

    this.formGroup.patchValue({
      OrgHouseNum: OrgHouseNumVal,
      OrgStreet: OrgStreetVal,
    });

    this.formGroup.updateValueAndValidity();
  }
  fromDbImg_1 = false;
  fromDbImg_2 = false;
  fromDbImg_4 = false;
  fromDbImg_5 = false;
  updateEventDoc() {
    const docList = this.EventBrandingDocs.value;
    this.fromDbImg_1 = true;
    this.fromDbImg_2 = true;
    this.fromDbImg_4 = true;
    this.fromDbImg_5 = true;
    this.eventBrandingDocList = [];

    for (let index = 0; index < docList.length; index++) {
      const element = docList[index];

      this.eventBrandingDocList.push({
        ...element,
      });

      if (element.FileTypeId == 1) {
        this.imageUrl = element.FilePath;
        this.setCls = "reg-img-preview";
        this.fromDbImg_1 = true;
      }
      if (element.FileTypeId == 2) {
        this.imageUrl2 = element.FilePath;
        this.setCls2 = "reg-img-preview";
        this.fromDbImg_2 = true;
      }

      if (element.FileTypeId == 4) {
        this.imageUrl3 = element.FilePath;
        this.setCls2 = "reg-img-preview";
        this.fromDbImg_4 = true;
      }
      if (element.FileTypeId == 5) {
        this.imageUrl5 = element.FilePath;
        this.setCls2 = "reg-img-preview";
        this.fromDbImg_5 = true;
      }
      if (element.FileTypeId == 3 && element.FilePath) {
        let fileURL = element.FilePath;
        document.querySelector("audio").src = fileURL;
        this.isAudioFileSelected = true;
        this.audioFileName = element.FileName || "";
        $(".controls-audio").show();
      }
    }

    this.addEventBrandingDocs();
  }
  byDefaultCheckValueCCGateway() {
    if (this.CCGateway.value == "2") {
      this.isCardKnox = true;
    } else {
      this.isCardKnox = false;
    }
  }
  cropeImage() {
    let basic = $("#resizer-demo").croppie({
      viewport: {
        width: 200,
        height: 200,
      },
      boundary: { width: 250, height: 150 },
      showZoomer: false,
      enableResize: false,
      enableOrientation: true,
      mouseWheelZoom: "ctrl",
    });
  }

  imageChangedEvent_1: any = "";
  imageChangedEvent_2: any = "";
  imageChangedEvent_4: any = "";
  imageChangedEvent_5: any = "";
  croppedImage: any = "";
  scale_1 = 1;
  scale_2 = 1;
  scale_4 = 1;
  scale_5 = 1;
  transform_1: ImageTransform = {};
  transform_2: ImageTransform = {};
  transform_4: ImageTransform = {};
  transform_5: ImageTransform = {};
  zoomOut(event, fileTypeId) {
    if (fileTypeId == 1) {
      this.scale_1 -= 0.1;
      this.transform_1 = {
        ...this.transform_1,
        scale: this.scale_1,
      };
    }
    if (fileTypeId == 2) {
      this.scale_2 -= 0.1;
      this.transform_2 = {
        ...this.transform_2,
        scale: this.scale_2,
      };
    }
    if (fileTypeId == 4) {
      this.scale_4 -= 0.1;
      this.transform_4 = {
        ...this.transform_4,
        scale: this.scale_4,
      };
    }
    if (fileTypeId == 5) {
      this.scale_5 -= 0.1;
      this.transform_5 = {
        ...this.transform_5,
        scale: this.scale_5,
      };
    }
    event.preventDefault();
  }

  zoomIn(event, fileTypeId) {
    if (fileTypeId == 1) {
      this.scale_1 += 0.1;
      this.transform_1 = {
        ...this.transform_1,
        scale: this.scale_1,
      };
    }
    if (fileTypeId == 2) {
      this.scale_2 += 0.1;
      this.transform_2 = {
        ...this.transform_2,
        scale: this.scale_2,
      };
    }
    if (fileTypeId == 4) {
      this.scale_4 += 0.1;
      this.transform_4 = {
        ...this.transform_4,
        scale: this.scale_4,
      };
    }
    if (fileTypeId == 5) {
      this.scale_5 += 0.1;
      this.transform_5 = {
        ...this.transform_5,
        scale: this.scale_5,
      };
    }
    event.preventDefault();
  }

  imageCropped(event: ImageCroppedEvent) {
    let reader = new FileReader();
    reader.readAsDataURL(event.blob);
    reader.onloadend = () => {
      let base64data = reader.result;
      this.croppedImage = base64data;
      this.crooppedImageGetBase64String(base64data);
      $(".overlay").remove();
    };
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
  crooppedImageGetBase64String(e) {
    let base64textString = (e || "base64,").split("base64,")[1];
    let filename = "";
    if (this.fileTypeId == 1) {
      filename = this.imageUrlName;
    }

    if (this.fileTypeId == 2) {
      filename = this.imageUrl2Name;
    }

    if (this.fileTypeId == 3) {
      filename = this.audioFileName;
    }

    if (this.fileTypeId == 4) {
      filename = this.imageUrl3Name;
    }
    if (this.fileTypeId == 5) {
      filename = this.imageUrl5Name;
    }
    let obj = {
      FileTypeId: this.fileTypeId,
      Base64String: base64textString,
      FilePath: "",
      Color: "",
      FileName: filename,
    };
    this.eventBrandingDocList = this.eventBrandingDocList.filter(
      (x) => x.FileTypeId != this.fileTypeId
    );
    this.eventBrandingDocList.push(obj);
  }
  deleteUploadedImage(event, fileTypeId) {
    this.updateAlteredBrandingDocs(fileTypeId);

    if (fileTypeId == 1) {
      this.imageUrl = false;
      this.setCls = "";
      this.fromDbImg_1 = true;
      for (let index = 0; index < this.eventBrandingDocList.length; index++) {
        const element = this.eventBrandingDocList[index];
        if (fileTypeId == element.FileTypeId) {
          element.StatusID = -1;
          element.FilePath = "";
          element.Color = "";
          element.FileName = "";
        }
      }
    }
    if (fileTypeId == 2) {
      this.imageUrl2 = false;
      this.setCls2 = "";
      this.fromDbImg_2 = true;
      for (let index = 0; index < this.eventBrandingDocList.length; index++) {
        const element = this.eventBrandingDocList[index];
        if (fileTypeId == element.FileTypeId) {
          element.StatusID = -1;
          element.FilePath = "";
          element.Color = "";
          element.FileName = "";
        }
      }
    }
    if (fileTypeId == 4) {
      this.imageUrl3 = false;
      this.setCls2 = "";
      this.fromDbImg_4 = true;
      for (let index = 0; index < this.eventBrandingDocList.length; index++) {
        const element = this.eventBrandingDocList[index];
        if (fileTypeId == element.FileTypeId) {
          element.StatusID = -1;
          element.FilePath = "";
          element.Color = "";
          element.FileName = "";
        }
      }
    }
    if (fileTypeId == 5) {
      this.imageUrl5 = false;
      this.setCls2 = "";
      this.fromDbImg_5 = true;
      for (let index = 0; index < this.eventBrandingDocList.length; index++) {
        const element = this.eventBrandingDocList[index];
        if (fileTypeId == element.FileTypeId) {
          element.StatusID = -1;
          element.FilePath = "";
          element.Color = "";
          element.FileName = "";
        }
      }
    }
    event.preventDefault();
  }
}
