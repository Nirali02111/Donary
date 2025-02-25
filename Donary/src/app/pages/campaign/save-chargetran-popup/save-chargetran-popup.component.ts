import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { ToiremService } from "src/app/services/toirem.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-save-chargetran-popup",
  templateUrl: "./save-chargetran-popup.component.html",
  standalone: false,
  styleUrls: ["./save-chargetran-popup.component.scss"],
})
export class SaveChargetranPopupComponent implements OnInit {
  campaignId: number;
  note: string;
  amount: number;
  @Input() set CampaignId(value: any) {
    if (value) {
      this.campaignId = value;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    public toiremService: ToiremService
  ) {}

  ngOnInit() {}

  closePopup() {
    this.activeModal.dismiss();
  }

  SaveChargeTrans() {
    let objCharge = {
      transTypeId: 5,
      campaignId: this.campaignId,
      note: this.note,
      amount: this.amount,
      totalAmount: this.amount,
      macAddress: this.localstoragedataService.getLoginUserGuid(),
    };
    this.toiremService.saveChargeTrans(objCharge).subscribe((res) => {
      if (res) {
        this.activeModal.dismiss();
        Swal.fire({
          title: res,
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
}
