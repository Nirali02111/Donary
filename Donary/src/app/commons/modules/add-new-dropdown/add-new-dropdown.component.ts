import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import {
  ShortcutInput,
  ShortcutEventOutput,
  KeyboardShortcutsComponent,
} from "ng-keyboard-shortcuts";
import { Subscription } from "rxjs";
import { AliyasPledgeComponent } from "src/app/pages/aliyas-pledge/aliyas-pledge.component";
import { SaveCampaignPopupComponent } from "src/app/pages/campaign/save-campaign-popup/save-campaign-popup.component";
import { SaveCollectorPopupComponent } from "src/app/pages/collector/save-collector-popup/save-collector-popup.component";
import { DonorSaveComponent } from "src/app/pages/donor/donor-save/donor-save.component";
import { SaveLocationPopupComponent } from "src/app/pages/location/save-location-popup/save-location-popup.component";
import { AddTransactionPopupComponent } from "src/app/pages/make-transaction/add-transaction-popup/add-transaction-popup.component";
import { SaveReasonPopupComponent } from "src/app/pages/reason/save-reason-popup/save-reason-popup.component";
import { UserService } from "src/app/services/user.service";
import { CommonMethodService } from "../../common-methods.service";
import { LocalstoragedataService } from "../../local-storage-data.service";
import { environment } from "src/environments/environment";
import { CreateAliyosGroupPopupComponent } from "src/app/pages/cards/create-aliyos-group-popup/create-aliyos-group-popup.component";
import { SelectTransactionPopupComponent } from "src/app/pages/make-transaction/select-transaction-popup/select-transaction-popup.component";

@Component({
  selector: "app-add-new-dropdown",
  standalone: false,
  templateUrl: "./add-new-dropdown.component.html",
  styleUrls: ["./add-new-dropdown.component.scss"],
  host: {
    "(window:click)": "onClick()",
  },
})
export class AddNewDropdownComponent implements OnInit, AfterViewInit {
  isCloseDrop = true;
  isDpClicked = true;
  modalOptions: NgbModalOptions;
  isAliyasPledge: boolean;
  makeTransactionPermission: boolean = false;
  newCampaignPermission: boolean = false;
  newCollectorPermission: boolean = false;
  newLocationPermission: boolean = false;
  newReasonPermission: boolean = false;
  newTransactionPopup: boolean = false;
  newDonorPermission: boolean = false;
  newAliyesPermission: boolean = false;
  allButtonPermission: boolean = false;
  isNewAliyaPopupRelease: boolean;
  isNewTransactionPopupsRelease = false;
  private subscription: Subscription;
  isDropDown: boolean = false;
  isClose: boolean = false;

  constructor(
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isNewAliyaPopupRelease =
      environment.releaseFeature.isNewAliyaPopupRelease;

    this.isNewTransactionPopupsRelease =
      environment.releaseFeature.isNewTransactionPopupsRelease;

    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localstoragedataService.setPermissionLst(
          res.lstUserPermissionModel
        );
        this.makeTransactionPermission = this.localstoragedataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "New Transaction")
          .map((x) => x.isActive)[0];
        this.newReasonPermission = this.localstoragedataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "New Reason")
          .map((x) => x.isActive)[0];
        this.newLocationPermission = this.localstoragedataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "New Location")
          .map((x) => x.isActive)[0];
        this.newCampaignPermission = this.localstoragedataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "New Campaign")
          .map((x) => x.isActive)[0];
        this.newCollectorPermission = this.localstoragedataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "New Collector")
          .map((x) => x.isActive)[0];
        this.newDonorPermission = this.localstoragedataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "New Donor")
          .map((x) => x.isActive)[0];
        this.newAliyesPermission = this.localstoragedataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "New Aliyes")
          .map((x) => x.isActive)[0];
      }
    });
    this.isAliyasPledge =
      this.localstoragedataService.getLoginUserisAliyasPledge();
    this.makeTransactionPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Transaction")
      .map((x) => x.isActive)[0];
    this.newReasonPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Reason")
      .map((x) => x.isActive)[0];
    this.newLocationPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Location")
      .map((x) => x.isActive)[0];
    this.newCampaignPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Campaign")
      .map((x) => x.isActive)[0];
    this.newCollectorPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Collector")
      .map((x) => x.isActive)[0];
    this.newDonorPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Donor")
      .map((x) => x.isActive)[0];
    this.newAliyesPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Aliyes")
      .map((x) => x.isActive)[0];

    this.allButtonPermission =
      this.makeTransactionPermission ||
      this.newAliyesPermission ||
      this.newDonorPermission ||
      this.newReasonPermission ||
      this.newCampaignPermission ||
      this.newLocationPermission ||
      this.newCollectorPermission;

    this.subscription = this.commonMethodService.isOpen$.subscribe((isOpen) => {
      this.isDropDown = isOpen;
      if (isOpen == true) {
        this.isDpClicked = false;
        this.isCloseDrop = false;
        this.updateClasses();
      } else {
        this.isDpClicked = true;
        this.isCloseDrop = true;
        this.updateClasses();
      }
    });
  }
  onClick() {
    this.isCloseDrop = true;
    this.isDpClicked == true;
    this.updateClasses();
  }
  onButtonClick($event) {
    $event.stopPropagation();
    this.isCloseDrop = !this.isCloseDrop;
  }

  getCustomCss() {
    if (this.isCloseDrop == true && this.isDpClicked == true) {
      return "not-show";
    } else {
      return "show";
    }
  }

  closeDropdown() {
    console.log("clicked on closeDropdown");

    this.commonMethodService.closeDropdown();
    this.isDropDown = false;
  }

  openSaveDonorPopup() {
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup  donor_popup ",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }

  makeTransactionPopup() {
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddTransactionPopupComponent,
      this.modalOptions
    );
  }

  openSelectTransactionPopup() {
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
    this.modalOptions = {
      windowClass: "modal-transaction-dropdown",
      container: "#btn-transaction",
    };
    const modalRef = this.commonMethodService.openPopup(
      SelectTransactionPopupComponent,
      this.modalOptions
    );
  }

  openAliyesWindow() {
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup aliyasPledge_modal aliyasPledge_modal_small modal-popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      AliyasPledgeComponent,
      this.modalOptions
    );
  }

  openSaveReasonPopup() {
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savereason_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveReasonPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }

  openSaveCampaignPopup() {
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
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
    modalRef.componentInstance.Type = "add";
  }

  openSaveLocationPopup() {
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savelocation_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveLocationPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }
  openSaveCollectorPopup() {
    this.isDropDown = false;
    this.commonMethodService.closeDropdown();
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savecollector_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveCollectorPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }
  // test code start
  shortcuts: ShortcutInput[] = [];
  // @ViewChild('input', { static: false }) input: ElementRef;

  ngAfterViewInit(): void {
    this.shortcuts.push(
      {
        key: "alt + d",
        command: (output: ShortcutEventOutput) => console.log(output),
        preventDefault: true,
      },
      {
        key: "alt + p",
        command: (output: ShortcutEventOutput) => console.log(output),
        preventDefault: true,
      },
      {
        key: "alt + a",
        command: (output: ShortcutEventOutput) => console.log(output),
        preventDefault: true,
      }
    );

    this.keyboard.select("alt + d").subscribe((e) => {
      this.openSaveDonorPopup();
    });

    this.keyboard.select("alt + p").subscribe((e) => {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup transaction_modal",
      };
      const modalRef = this.commonMethodService.openPopup(
        AddTransactionPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.isShortcut = true;
    });

    this.keyboard.select("alt + a").subscribe((e) => {
      this.openAliyesWindow();
    });
  }

  @ViewChild(KeyboardShortcutsComponent, { static: false })
  private keyboard: KeyboardShortcutsComponent;

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  //test code end

  showButton = false;
  @HostListener("window:scroll")
  onWindowScroll() {
    // Check the scroll position and determine whether to show or hide the button
    const yOffset = document.documentElement.scrollTop;
    const threshold = 100; // Adjust this value as needed
    this.showButton = yOffset > threshold;
  }
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Add smooth scrolling effect
    });
  }

  openCreateAliyosGroupCardPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup create_aliyos_group_card modal-popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      CreateAliyosGroupPopupComponent,
      this.modalOptions
    );
  }

  updateClasses() {
    this.cdr.detectChanges();
  }
}
