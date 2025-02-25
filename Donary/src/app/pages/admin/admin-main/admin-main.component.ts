import { Component, inject, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormArray,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { OrganizationDetailsFormGroupComponent } from "src/app/commons/modules/shared-form-group/organization-details-form-group/organization-details-form-group.component";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import { environment } from "./../../../../environments/environment";

import {
  GetOrganizationContactResponse,
  OrganizationService,
} from "src/app/services/organization.service";
import Swal from "sweetalert2";
import { AnalyticsService } from "src/app/services/analytics.service";
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
  selector: "app-admin-main",
  templateUrl: "./admin-main.component.html",
  styleUrls: ["./admin-main.component.scss"],
  standalone: false,
})
export class AdminMainComponent implements OnInit {
  registractionForm: UntypedFormGroup;
  isProdEnv: boolean;
  gateWayList: Array<GateWay> = [];
  isloading: boolean = false;
  stateList: Array<stateObj> = [];
  eventBrandingDocList: Array<any> = [];
  base64textString = [];
  fileTypeId: number;
  isFormubmited: boolean = false;
  orgAddress: "";
  contactAddress: "";
  userPermission: boolean = false;
  index = -1;
  @ViewChild(OrganizationDetailsFormGroupComponent, { static: false })
  orgDetailsFormGroup: OrganizationDetailsFormGroupComponent;
  adminPageUrl: string = "/" + PageRouteVariable.Admin_url;
  private analytics = inject(AnalyticsService);

  constructor(
    private fb: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private localstorageService: LocalstoragedataService,
    private commonMethodService: CommonMethodService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.analytics.visitedProfile();
    this.isProdEnv = environment.baseUrl.includes("https://webapi.donary.com/");
    $("body").removeClass("sticky_table_list");
    this.initForm();
    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localstorageService.setPermissionLst(res.lstUserPermissionModel);
        this.userPermission = this.localstorageService
          .getPermissionLst()
          .filter((x) => x.permissionName == "User List")
          .map((x) => x.isActive)[0];
        if (!this.userPermission) {
          $("#custom-tabs-users-tab").removeClass("active");
          $("#custom-tabs-users").removeClass("show active");
          $("#custom-tabs-profile-tab").addClass("active");
          $("#custom-tabs-profile").addClass("show active");
        }
      }
    });
    this.userPermission = this.localstorageService
      .getPermissionLst()
      .filter((x) => x.permissionName == "User List")
      .map((x) => x.isActive)[0];
    this.getOrganizationData();
    this.commonMethodService.formatAmount(0);
  }

  private getCityStateZip(cityStateZip: string = "") {
    if (cityStateZip) {
      const data = cityStateZip.split(",");
      if (cityStateZip && data.length !== 0) {
        if (data.length <= 1) {
          return {
            city: data[0].trim(),
            state: "",
            zip: "",
          };
        }

        if (data.length <= 2) {
          return {
            city: data[0].trim(),
            state: data[1].trim(),
            zip: "",
          };
        }

        if (data.length <= 3) {
          return {
            city: data[0].trim(),
            state: data[1].trim(),
            zip: data[2].trim(),
          };
        }

        const [first, second, ...restValues] = data;

        return {
          city: first,
          state: second,
          zip: restValues.join(" "),
        };
      }

      return {
        city: "",
        state: "",
        zip: "",
      };
    }
    return {
      city: "",
      state: "",
      zip: "",
    };
  }

  getOrganizationData() {
    var OrganizationId = this.localstorageService.getLoginUserOrganisationId();
    var eventGuid = this.localstorageService.getLoginUserEventGuId();
    if (OrganizationId) {
      this.organizationService
        .getOrganizationAdmin(OrganizationId, eventGuid)
        .subscribe((res: any) => {
          // console.log(res);
          let contactModel!: GetOrganizationContactResponse;
          if (
            res.organizationContactModel &&
            res.organizationContactModel.length !== 0
          ) {
            contactModel = res.organizationContactModel[0];
          }

          if (
            res.eventBrandingDocumentModel &&
            res.eventBrandingDocumentModel.length !== 0
          ) {
            this.EventBrandingDocs.clear();
            let fileTypeIds = [];

            for (
              let index = 0;
              index < res.eventBrandingDocumentModel.length;
              index++
            ) {
              const element = res.eventBrandingDocumentModel[index];
              if (!fileTypeIds.includes(element.fileTypeId))
                fileTypeIds.push(element.fileTypeId);
              else if (
                fileTypeIds.includes(element.fileTypeId) &&
                !element.filePath
              )
                return;
              if (element.color == "Original" || element.color == "") {
                let obj = {
                  FileTypeId: element.fileTypeId,
                  EventBrandingDocumentId: element.eventBrandingDocumentId,
                  Base64String: "",
                  FilePath: element.filePath,
                  Color: element.color,
                };
                this.EventBrandingDocs.push(this.fb.control(obj));
              }
            }
          }

          const addrObj = this.getCityStateZip(res.cityStateZip);
          this.registractionForm.patchValue({
            OrgId: res.organizationID,
            OrgName: res.organizationName,
            TaxId: res.taxID,
            OrgHouseNum: "",
            OrgStreet: res.addressInfo,
            OrgApt: res.apartment,
            OrgCity: addrObj.city,
            OrgState: addrObj.state,
            OrgZip: addrObj.zip,
            OrgPhone: res.phone,
            OrgEmail: res.contactEmail,

            // Contact
            ContactName: res.contactName,
            ContactHouseNum: (contactModel && contactModel.houseNum) || "",
            ContactStreet: (contactModel && contactModel.streetName) || "",
            ContactApt: (contactModel && contactModel.unit) || "",
            ContactCity: (contactModel && contactModel.city) || "",
            ContactState: (contactModel && contactModel.state) || "",
            ContactZip: (contactModel && contactModel.zip) || "",

            ContactPhone: [
              contactModel &&
                this.getContactPhoneModel(contactModel.contactPhone),
            ],
            ContactEmail: [contactModel && contactModel.contactEmail],

            OrgJewishName: res.organizationNameJewish,

            // bill
            CCMerchant: res.ccMerchant,
            CCGateway: 0,
            APIKey: null,
            Pin: res.pin,
            OJCApiKey: res.ojcapIkey,
          });

          this.registractionForm.updateValueAndValidity();
          this.orgDetailsFormGroup.updateEventDoc();
        });
    }
  }

  ngAfterViewInit() {}

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
      ContactName: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      ContactHouseNum: this.fb.control(""),
      ContactStreet: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      ContactApt: this.fb.control(""),
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
      CCGateway: this.fb.control(0),
      APIKey: this.fb.control(""),
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

  onRegister(event: any, isBranding = false) {
    const alteredDocs: any[] = event.alteredBrandingDocs;
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
      cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
      confirmButtonColor: "#7b5bc4",
    }).then((result) => {
      if (result.value) {
        this.isloading = true;
        var eventGuId = this.localstorageService.getLoginUserEventGuId();
        const eventBrandingDocs = this.setEventBrandingDocs(alteredDocs);

        this.organizationService
          .AddOrganization({
            ...this.registractionForm.value,
            EventBrandingDocs: eventBrandingDocs,
            EventGuid: eventGuId,
          })
          .subscribe(
            (res) => {
              if (res) {
                if (isBranding) this.analytics.editedBranding();
                else this.analytics.editedProfile();

                this.getCnfmPopup(res); //added new
                this.getOrganizationData();
                if (this.isBrandTrue) {
                  this.refeshPage();
                }
                this.isloading = false;
              }
            },
            (err) => {
              this.isloading = false;
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
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
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

  setEventBrandingDocs(alteredDocs) {
    let alteredDocsIds = alteredDocs.map((doc: any) => doc.id);
    let indexesToRemove: number[] = [];
    let eventBrandingDocs: any[] =
      this.registractionForm.value.EventBrandingDocs;

    eventBrandingDocs.forEach((doc: any, i) => {
      if (!alteredDocsIds.includes(doc.FileTypeId)) {
        indexesToRemove.push(i);
      }
    });

    return eventBrandingDocs.filter(
      (_, index) => !indexesToRemove.includes(index)
    );
  }
  isBrandTrue: boolean = false;
  isBrandingFn(event) {
    this.isBrandTrue = true;
  }

  refeshPage() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["./"], { relativeTo: this.route });
    setTimeout(() => {
      $("#custom-tabs-profile-tab").removeClass("active");
      $("#custom-tabs-profile").removeClass("show active");
      $("#custom-tabs-branding-tab").addClass("active");
      $("#custom-tabs-branding").addClass("show active");
    }, 200);
  }

  getCnfmPopup(res) {
    Swal.fire({
      title: this.commonMethodService.getTranslate(
        "WARNING_SWAL.SUCCESS_TITLE"
      ),
      //text: res,
      icon: "success",
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

  userList() {
    $("#userListScroll tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        var idx = $("#userListScroll tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("userListScroll").scrollTop = 0;
        }
        $("#userListScroll tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        var idx = $("#userListScroll tr:focus").attr("tabindex");
        idx++;
        $("#userListScroll tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("userListScroll").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("userListScroll").scrollLeft += 30;
      }
    };
  }

  registerEvent() {
    this.analytics.visitedBranding();
  }

  ngOnDestroy() {
    document.onkeydown = () => {};
  }

  getContactPhoneModel(numbers) {
    if (numbers && numbers.includes(",")) {
      const result = numbers.split(",");
      return result[0];
    }
    return numbers;
  }
}
