import { Component, Input, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { ImageTransform } from "ngx-image-cropper";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import Swal from "sweetalert2";
declare let $: any;

@Component({
  selector: "app-branding",
  templateUrl: "./branding.component.html",
  standalone: false,
  styleUrls: ["./branding.component.scss"],
})
export class BrandingComponent implements OnInit {
  @Input() formGroup!: UntypedFormGroup;
  base64textString = [];
  fileTypeId: number;
  imageChangedEvent_1: any = "";
  imageChangedEvent_2: any = "";
  imageChangedEvent_4: any = "";
  imageChangedEvent_5: any = "";
  croppedImage: any = "";
  imageUrl;
  imageUrlName;
  imageUrl2;
  imageUrl2Name;
  imageUrl3;
  imageUrl3Name;
  imageUrl5;
  imageUrl5Name;
  audioFileName;
  setCls = "";
  setCls2 = "";
  mp3_size = 0;
  fromDbImg_1 = false;
  fromDbImg_2 = false;
  fromDbImg_4 = false;
  fromDbImg_5 = false;
  isAudioFileSelected = false;

  scale_1 = 1;
  scale_2 = 1;
  scale_4 = 1;
  scale_5 = 1;
  transform_1: ImageTransform = {};
  transform_2: ImageTransform = {};
  transform_4: ImageTransform = {};
  transform_5: ImageTransform = {};

  eventBrandingDocList: Array<any> = [];

  constructor(
    private fb: UntypedFormBuilder,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {}

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

  getBase64String(event, fileTypeId) {
    let reader = new FileReader();
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
  }

  handleReaderLoaded(e) {
    let base64textString = (e.target.result || "base64,").split("base64,")[1];
    let filename = "";

    switch (+this.fileTypeId) {
      case 1:
        filename = this.imageUrlName;
        break;
      case 2:
        filename = this.imageUrl2Name;
        break;
      case 3:
        filename = this.audioFileName;
        break;
      case 4:
        filename = this.imageUrl3Name;
        break;
      case 5:
        filename = this.imageUrl5Name;
        break;
      default:
        break;
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

  deleteUploadedImage(event, fileTypeId) {
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
