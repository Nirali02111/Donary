import { Component, inject, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { UserService } from "src/app/services/user.service";
import Swal from "sweetalert2";
import { Subject } from "rxjs";
import { EntityPermissionService } from "src/app/services/entitypermission.service";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-edit-user-popup",
  templateUrl: "./edit-user-popup.component.html",
  styleUrls: ["./edit-user-popup.component.scss"],
  standalone: false,
})
export class EditUserPopupComponent implements OnInit {
  firstName: string;
  lastName: string;
  userName: string;
  title: string;
  email: string;
  phone: string;
  plan: string;
  userId: number;
  password: string;
  planTypeId: Array<any> = [];
  isloading: boolean = true;
  lstUserPermission: Array<any> = [];
  skeletonitems: any = [{}, {}, {}, {}, {}, {}, {}, {}];
  lists = [
    "Donor List",
    "Campaign List",
    "Collector List",
    "Reason List",
    "Location List",
    "Source List",
    "Seats",
    "User List",
  ];
  addNew = [
    "New Transaction",
    "New Campaign",
    "New Collector",
    "New Reason",
    "New Location",
    "New Donor",
    "New Aliyes",
  ];
  other = [
    "Admin",
    "Query Reports",
    "Custom Reports",
    "Notifications",
    "Dashboard",
    "Show Total Panel Donors",
    "Show Total Panel Reasons",
    "Show Total Panel Campaigns",
    "Show Total Panel Collectors",
    "Show Total Panel Locations",
    "Show Total Panel Sources",
  ];
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  activeTab: string = "userinfo"; // Default active tab
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private entityPermissionService: EntityPermissionService,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService
  ) {}

  @Input() set EditUser(data) {
    if (data) {
      this.firstName = data.firstname;
      this.lastName = data.lastname;
      this.userName = data.username;
      this.title = data.title;
      this.email = data.email;
      this.phone = data.phone;
      this.plan = data.plan;
      this.userId = data.userId;
      this.password = data.password;
      this.lstUserPermission = data.lstUserPermissionModel;
      this.planTypeId = this.commonMethodService.planTypeList.filter(
        (s) => s.id == data.planTypeId
      );
      this.entityPermissionService
        .getEntityPermission(this.userId)
        .subscribe((res: any) => {
          if (res) {
            res.forEach((element) => {
              if (element.type == "Campaign") {
                var selectedCampaign =
                  this.commonMethodService.localCampaignList.filter(
                    (s) => s.id == element.recordId
                  );
                this.commonMethodService.selectedFromCampaignList.push({
                  id: selectedCampaign[0].id,
                  itemName: selectedCampaign[0].itemName,
                  num: selectedCampaign[0].num,
                });
              }
              if (element.type == "Collector") {
                var selectedCollector =
                  this.commonMethodService.localCollectorList.filter(
                    (s) => s.id == element.recordId
                  );
                this.commonMethodService.selectedPaymentCollectors.push({
                  id: selectedCollector[0].id,
                  itemName: selectedCollector[0].itemName,
                });
              }
              if (element.type == "Location") {
                var selectedLocation =
                  this.commonMethodService.localLocationList.filter(
                    (s) => s.id == element.recordId
                  );
                this.commonMethodService.selectedPaymentLocations.push({
                  id: selectedLocation[0].id,
                  itemName: selectedLocation[0].itemName,
                });
              }
              if (element.type == "Reason") {
                var selectedReason =
                  this.commonMethodService.localReasonList.filter(
                    (s) => s.id == element.recordId
                  );
                this.commonMethodService.selectedPaymentReasons.push({
                  id: selectedReason[0].id,
                  itemName: selectedReason[0].itemName,
                });
              }
              if (element.type == "Source") {
                var selectedDevice =
                  this.commonMethodService.localDeviceTypeList.filter(
                    (s) => s.id == element.recordId
                  );
                this.commonMethodService.selectedPaymentDeviceTypes.push({
                  id: selectedDevice[0].id,
                  itemName: selectedDevice[0].itemName,
                });
              }
            });
          }
        });
    }
    this.isloading = false;
  }
  ngOnInit() {
    this.getFeatureSettingValues();
    this.commonMethodService.getPlanTypeList();
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedPaymentCollectors = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedPaymentDeviceTypes = [];
    this.bindData();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  SaveUser() {
    this.isloading = true;
    var userLoginId = this.localstoragedataService.getLoginUserId();
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    var updatedPermission = this.lstUserPermission.map((element) => {
      return {
        PermissionId: element.permissionId,
        IsActive: element.isActive,
      };
    });
    var saveUserObj = {
      UserId: this.userId,
      LoginUserId: userLoginId,
      Username: this.userName,
      Password: this.password,
      Email: this.email,
      Firstname: this.firstName,
      Lastname: this.lastName,
      Title: this.title,
      Phone: this.phone,
      PlanTypeId:
        this.planTypeId.length > 0
          ? Number(this.planTypeId.map((s) => s.id))
          : null,
      EventGuid: eventGuid,
      lstPermissionModel: updatedPermission,
    };

    this.userService.saveUser(saveUserObj).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.analytics.editedUser();

          var saveEntityPermission = {
            campaignIds:
              this.commonMethodService.selectedFromCampaignList.length > 0
                ? this.commonMethodService.selectedFromCampaignList.map(
                    (s) => s.id
                  )
                : [],
            reasonIds:
              this.commonMethodService.selectedPaymentReasons.length > 0
                ? this.commonMethodService.selectedPaymentReasons.map(
                    (s) => s.id
                  )
                : [],
            collectorIds:
              this.commonMethodService.selectedPaymentCollectors.length > 0
                ? this.commonMethodService.selectedPaymentCollectors.map(
                    (s) => s.id
                  )
                : [],
            locationIds:
              this.commonMethodService.selectedPaymentLocations.length > 0
                ? this.commonMethodService.selectedPaymentLocations.map(
                    (s) => s.id
                  )
                : [],
            sourceIds:
              this.commonMethodService.selectedPaymentDeviceTypes.length > 0
                ? this.commonMethodService.selectedPaymentDeviceTypes.map(
                    (s) => s.id
                  )
                : [],
            userId: this.userId,
            createdBy: this.localstoragedataService.getLoginUserId(),
          };
          this.entityPermissionService
            .saveEntityPermission(saveEntityPermission)
            .subscribe((res: any) => {
              if (res) {
                this.activeModal.dismiss();
                Swal.fire({
                  title: "",
                  text: "User updated successfully",
                  icon: "success",
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

        this.userService
          .getUser(
            this.localstoragedataService.getLoginUserId(),
            this.localstoragedataService.getLoginUserEventGuId()
          )
          .subscribe((res: any) => {
            if (res) {
              this.commonMethodService.sendUserLst(res);
            }
          });
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
  listsRemoveDiv = "";
  isTabContaint(permissionName, TabName) {
    if (TabName == "lists") {
      return this.lists.includes(permissionName);
    }
    if (TabName == "addnew") {
      return this.addNew.includes(permissionName);
    }
    if (TabName == "other") {
      return this.other.includes(permissionName);
    }
    return false;
  }
  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true
    );
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  deleteDiv() {
    $(".remove-div").remove();
  }
  onDeleteUser() {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this User!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CONFIRM.Yes_DELETE_IT"
      ),
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        this.userService.DeleteUser(this.userId).subscribe(
          (res: any) => {
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
              this.commonMethodService.sendUserLst(res);
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
    });
  }
  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_user";
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
