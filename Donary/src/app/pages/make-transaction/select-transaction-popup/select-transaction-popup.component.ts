import { Component } from "@angular/core";
import { DonationTransactionPopupComponent } from "../donation-transaction-popup/donation-transaction-popup.component";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PayOffPledgeTransactionPopupComponent } from "../pay-off-pledge-transaction-popup/pay-off-pledge-transaction-popup.component";
import { CreatePledgeTransactionPopupComponent } from "../create-pledge-transaction-popup/create-pledge-transaction-popup.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AddTransactionPopupComponent } from "../add-transaction-popup/add-transaction-popup.component";
import { environment } from "src/environments/environment";
import { AliyasPledgeComponent } from "../../aliyas-pledge/aliyas-pledge.component";
import { CreateAliyosGroupPopupComponent } from "../../cards/create-aliyos-group-popup/create-aliyos-group-popup.component";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";

@Component({
  selector: "app-select-transaction-popup",
  templateUrl: "./select-transaction-popup.component.html",
  standalone: false,
  styleUrl: "./select-transaction-popup.component.scss",
})
export class SelectTransactionPopupComponent {
  formGroup!: FormGroup;
  isNewAliyaPopupRelease: boolean = false;
  uiPageSettingId: any = null;
  pageLayout: any;
  isloading: boolean = false;
  get TransactionSwitch() {
    return this.formGroup.get("transactionSwitch");
  }

  constructor(
    public commonMethodService: CommonMethodService,
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private localStorage: LocalstoragedataService,
    private uiPageSettingService: UIPageSettingService
  ) {
    this.getLayout();
  }
  ngOnInit() {
    this.isloading = true;
    this.isNewAliyaPopupRelease =
      environment.releaseFeature.isNewAliyaPopupRelease;

    this.formGroup = this.fb.group({
      transactionSwitch: this.fb.control(false),
    });

    this.TransactionSwitch.valueChanges.subscribe((active) => {
      this.setLayout(active);
    });
  }

  setLayout(e: Event | any) {
    let isAvctive = e.target.checked;
    let setting = {
      newTransactionSwitch: isAvctive,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorage.getLoginUserId(),
      moduleName: "new-transaction",
      screenName: "new-transaction-switch",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe(() => {});
  }

  getLayout() {
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorage.getLoginUserId(),
      moduleName: "new-transaction",
      screenName: "new-transaction-switch",
    };

    this.uiPageSettingService.Get(objLayout).subscribe(
      (res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.pageLayout = JSON.parse(res.setting);
          this.TransactionSwitch.setValue(
            this.pageLayout?.newTransactionSwitch
          );
        }
        this.isloading = false;
      },
      (err) => (this.isloading = false)
    );
  }

  openTransaction() {
    this.closePopup();

    this.commonMethodService.openPopup(AddTransactionPopupComponent, {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    });
  }

  openDonation() {
    this.closePopup();

    this.commonMethodService.openPopup(DonationTransactionPopupComponent, {
      centered: true,
      size: "xl",
      keyboard: true,
      backdropClass: "backdrop-show",
      windowClass: "modal-main modal-donation",
    });
  }

  openPledgeOffPayment() {
    this.closePopup();

    this.commonMethodService.openPopup(PayOffPledgeTransactionPopupComponent, {
      centered: true,
      size: "xl",
      keyboard: true,
      backdropClass: "backdrop-show",
      windowClass: "modal-main modal-pledge",
    });
  }

  openPledgeBill() {
    this.closePopup();

    this.commonMethodService.openPopup(CreatePledgeTransactionPopupComponent, {
      centered: true,
      size: "xl",
      keyboard: true,
      backdropClass: "backdrop-show",
      windowClass: "modal-main modal-bill",
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  openAliyesWindow() {
    this.closePopup();

    this.commonMethodService.closeDropdown();
    let modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup aliyasPledge_modal aliyasPledge_modal_small modal-popup",
    };
    this.commonMethodService.openPopup(AliyasPledgeComponent, modalOptions);
  }

  openCreateAliyosGroupCardPopup() {
    this.closePopup();

    let modalOptions = {
      centered: true,
      size: "lg",
      keyboard: true,
      windowClass: "drag_popup create_aliyos_group_card modal-popup",
    };
    this.commonMethodService.openPopup(
      CreateAliyosGroupPopupComponent,
      modalOptions
    );
  }
}
