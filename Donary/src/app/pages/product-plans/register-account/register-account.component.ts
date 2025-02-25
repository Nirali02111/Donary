import { AfterViewInit, Component, OnInit } from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { OrganizationService } from "src/app/services/organization.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { CommonMethodService } from "src/app/commons/common-methods.service";

declare var $: any;

interface GateWay {
  gatewayId: number;
  gatewayName: string;
}

interface stateObj {
  abbreviations: string;
  name: string;
}

@Component({
  selector: "app-register-account",
  templateUrl: "./register-account.component.html",
  standalone: false,
  styleUrls: ["./register-account.component.scss"],
})
export class RegisterAccountComponent implements OnInit, AfterViewInit {
  registractionForm: UntypedFormGroup;

  gateWayList: Array<GateWay> = [];
  isloading: boolean = false;
  stateList: Array<stateObj> = [];
  eventBrandingDocList: Array<any> = [];
  base64textString = [];
  fileTypeId: number;
  isFormubmited: boolean = false;
  orgAddress: "";
  contactAddress: "";

  constructor(
    private fb: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private localstorageService: LocalstoragedataService,
    private router: Router,
    private localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    this.initForm();
    this.getOrganization();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 150);
  }

  public get ContactPhone(): UntypedFormArray {
    return this.registractionForm.get("ContactPhone") as UntypedFormArray;
  }

  public get ContactEmail(): UntypedFormArray {
    return this.registractionForm.get("ContactEmail") as UntypedFormArray;
  }

  public get EventBrandingDocs(): UntypedFormArray {
    return this.registractionForm.get("EventBrandingDocs") as UntypedFormArray;
  }

  initForm() {
    this.registractionForm = this.fb.group({
      OrgId: this.fb.control(""),
      OrgName: this.fb.control("", Validators.compose([Validators.required])),
      TaxId: this.fb.control("", Validators.compose([Validators.required])),
      OrgHouseNum: this.fb.control(""),
      OrgStreet: this.fb.control("", Validators.compose([Validators.required])),
      OrgApt: this.fb.control(""), //("", Validators.compose([Validators.required])),
      OrgCity: this.fb.control("", Validators.compose([Validators.required])),
      OrgState: this.fb.control("", Validators.compose([Validators.required])),
      OrgZip: this.fb.control("", Validators.compose([Validators.required])),
      OrgPhone: this.fb.control("", Validators.compose([Validators.required])),
      OrgEmail: this.fb.control(
        "",
        Validators.compose([Validators.required, Validators.email])
      ),

      // Contact
      ContactName: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      ContactHouseNum: this.fb.control(""),
      ContactStreet: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      ContactApt: this.fb.control(""), //("", Validators.compose([Validators.required])),
      ContactCity: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      ContactState: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      ContactZip: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      OrgJewishName: this.fb.control(""),

      ContactPhone: this.fb.array([]),
      ContactEmail: this.fb.array([]),
      // bil
      CCMerchant: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      CCGateway: this.fb.control(0, Validators.compose([Validators.required])),
      APIKey: this.fb.control("", Validators.compose([Validators.required])),
      Pin: this.fb.control("", Validators.compose([Validators.required])),
      EventBrandingDocs: this.fb.array([]),
      UserId: this.fb.control(null),
      OJCApiKey: this.fb.control(""),
    });

    this.addContactPhone();
    this.addContactEmail();
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

  addEventBrandingDocs() {
    this.EventBrandingDocs.clear();
    this.eventBrandingDocList.forEach((element) => {
      console.log(element);
      this.EventBrandingDocs.push(this.fb.control(element));
    });
  }

  onRegister(event: any) {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.organizationService
      .AddOrganization({
        ...this.registractionForm.value,
        EventGuid: eventGuId,
      })
      .subscribe(
        (res) => {
          this.isloading = false;
          if (res) {
            this.router.navigate(["/"]);
          } else {
            console.log("onRegister res error");
          }
        },
        (err) => {
          this.isloading = false;
          console.log(err);
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
          }).then(() => {
            setTimeout(() => {
              window.scrollTo(0, 0);
            }, 150);
          });
        }
      );
  }

  customSearchFn(term: string, item: { name: string; abbreviations: string }) {
    let terms = term.toLowerCase();
    return (
      item.name.toLowerCase().indexOf(terms) > -1 ||
      item.abbreviations.toLowerCase() === terms
    );
  }
  imageUrl;
  imageUrlName;
  imageUrl2;
  imageUrl2Name;
  setCls = "";
  setCls2 = "";
  audioUrl;
  isPlay = true;
  isAudioFileSelected = false;
  audioFileName;
  getBase64String(event, fileTypeId) {
    let selectedFile = event.target.files[0];
    let reader = new FileReader();
    var path = reader.readAsDataURL(selectedFile);
    this.fileTypeId = fileTypeId;
    this.eventBrandingDocList = this.eventBrandingDocList.filter(
      (o) => o.FileTypeId !== fileTypeId
    );

    reader.onload = this.handleReaderLoaded.bind(this);

    console.log("reader base64textString", this.base64textString);
    console.log("reader eventBrandingDocList", this.eventBrandingDocList);
    // preview code
    if (fileTypeId == 1) {
      var file = event.target.files[0];
      this.imageUrlName = file.name;
    }
    if (fileTypeId == 2) {
      var file = event.target.files[0];
      this.imageUrl2Name = file.name;
    }
    if (fileTypeId == 3) {
      document.querySelector("audio").src = "";
      var fileURL = URL.createObjectURL(event.target.files[0]);
      document.querySelector("audio").src = fileURL;
      this.isAudioFileSelected = true;
      this.audioFileName = event.target.files[0].name;
      $(".controls-audio").show();
    }
    if (event.target.files && event.target.files[0]) {
      var reader1 = new FileReader();
      reader1.onload = (event: any) => {
        if (fileTypeId == 1) {
          this.imageUrl = event.target.result;
          this.setCls = "reg-img-preview";
        }
        if (fileTypeId == 2) {
          this.imageUrl2 = event.target.result;
          this.setCls2 = "reg-img-preview";
        }
      };
      reader1.readAsDataURL(event.target.files[0]);
    }
  }

  handleReaderLoaded(e) {
    //'data:image/png;base64,' +
    var base64textString = btoa(e.target.result);
    let obj = {
      FileTypeId: this.fileTypeId,
      Base64String: base64textString,
      FilePath: "",
      Color: "",
    };

    this.eventBrandingDocList.push(obj);
    console.log("base64textString", base64textString);
  }

  onOrgAddressBlur() {
    if (!this.orgAddress) {
      this.registractionForm.patchValue({
        OrgHouseNum: "",
        OrgStreet: "",
        OrgApt: "",
        OrgCity: "",
        OrgState: "",
        OrgZip: "",
      });
    }
  }

  onContactAddressBlur() {
    if (!this.contactAddress) {
      this.registractionForm.patchValue({
        ContactHouseNum: "",
        ContactStreet: "",
        ContactApt: "",
        ContactCity: "",
        ContactState: "",
        ContactZip: "",
      });
    }
  }

  onOrgAddressChange(data: any) {
    this.registractionForm.patchValue({
      OrgHouseNum: data.streetNumber,
      OrgStreet: data.streetName,
      OrgApt: data.locality.long,
      OrgCity: data.locality.long || data.locality.short || data.sublocality,
      OrgState: data.state.short,
      OrgZip: data.postalCode,
    });
  }

  onContactAddressChange(data: any) {
    this.registractionForm.patchValue({
      ContactHouseNum: data.streetNumber,
      ContactStreet: data.streetName,
      ContactApt: data.locality.long,
      ContactCity:
        data.locality.long || data.locality.short || data.sublocality,
      ContactState: data.state.short,
      ContactZip: data.postalCode,
    });
  }

  deleteAudioFile(fileTypeId) {
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
  isCardKnox = false;
  onChangeGateway(event) {
    if (event.target.value == "2") {
      this.isCardKnox = true;
    } else {
      this.isCardKnox = false;
    }
  }

  getOrganization() {
    var OrganizationId = this.localstorageService.getOrganizationId();
    if (OrganizationId) {
      this.organizationService
        .getOrganization(OrganizationId)
        .subscribe((res: any) => {
          console.log(res);
          if (res) {
            var hno = res.organizationContactModel[0].houseNum
              ? res.organizationContactModel[0].houseNum + " "
              : "";
            this.registractionForm.patchValue({
              OrgId: res.organizationID,
              OrgName: res.organizationName,
              ContactName: res.contactName,
              OrgEmail: res.organizationContactModel[0].contactEmail,
              OrgStreet: hno + res.organizationContactModel[0].streetName,
              OrgApt: res.apartment, //organizationContactModel[0].unit,
              OrgCity: res.organizationContactModel[0].city,
              OrgState: res.organizationContactModel[0].state,
              OrgZip: res.organizationContactModel[0].zip,
            });
          }
        });
    }
  }
  getOrganizationContact() {
    var OrganizationId = this.localstorageService.getOrganizationId();
    if (OrganizationId) {
      this.organizationService
        .getOrganizationContact(OrganizationId)
        .subscribe((res: any) => {
          console.log(res);

          this.registractionForm.patchValue({
            ContactName: res.contactName,
            OrgEmail: res.contactEmail,
          });
        });
    }
  }
  //
  updateContactSection() {
    var OrgHouseNumVal = "";
    var ContactHouseNumVal = "";
    var OrgStreetVal: "";
    var ContactStreetVal: "";
    var OrgStreetStr = this.registractionForm.value.OrgStreet;
    var ContactStreetStr = this.registractionForm.value.ContactStreet;
    if (OrgStreetStr) {
      var oss = OrgStreetStr.split(" ");
      OrgHouseNumVal = oss.length > 0 ? oss[0] : "";
      var mystring = OrgStreetStr;
      var newstr = mystring.replace(OrgHouseNumVal, "");
      OrgStreetVal = newstr.trim();
    }
    if (ContactStreetStr) {
      var css = ContactStreetStr.split(" ");
      ContactHouseNumVal = css.length > 0 ? css[0] : "";
      var mystring = ContactStreetStr;
      var newstr = mystring.replace(ContactHouseNumVal, "");
      ContactStreetVal = newstr.trim();
    }
    this.registractionForm.patchValue({
      OrgHouseNum: OrgHouseNumVal,
      ContactHouseNum: ContactHouseNumVal,
      OrgStreet: OrgStreetVal,
      ContactStreet: ContactStreetVal,
    });
  }
  //
}
