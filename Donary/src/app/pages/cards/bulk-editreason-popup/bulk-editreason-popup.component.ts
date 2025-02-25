import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { ReasonService } from "src/app/services/reason.service";
import Swal from "sweetalert2";
declare var $: any;
interface option {
  id: number;
  itemName: string;
}
@Component({
  selector: "app-bulk-editreason-popup",
  templateUrl: "./bulk-editreason-popup.component.html",
  styleUrls: ["./bulk-editreason-popup.component.scss"],
  standalone: false,
})
export class BulkEditreasonPopupComponent implements OnInit {
  @Input("SelectedIds") SelectedIds: Array<number>;
  isloading: boolean = false;
  isDeActive: boolean = false;

  // models
  selectedPaymentReasons: Array<option> = [];
  selectedFromCampaignList: Array<option> = [];
  paymentLocationList: Array<option> = [];
  paymentCollectorList: Array<option> = [];

  goal: number;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    public activeModal: NgbActiveModal,
    public reasonService: ReasonService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".popup_header",
      });
    });
    this.bindData();
  }
  closePopup() {
    this.activeModal.dismiss();
  }

  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      false,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    );
  }
  OnCheckboxChange(event) {
    if (event.target.checked) {
      this.isDeActive = true;
    } else {
      this.isDeActive = false;
    }
  }

  editBulkActions() {
    Swal.fire({
      icon: "warning",
      input: "number",

      showClass: {
        popup: `
              swal2-modal-primary
            `,
      },
      html: `<div>
                 <h2>Edit ${this.SelectedIds.length} reasons?</h2>
                 <p>You're editing multiple reasons.</p>
                 <span>To continue, type the amount of reasons you selected. </span>
             </div>`,
      showCloseButton: true,
      confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
      confirmButtonColor: "#7b5bc4",
      customClass: { confirmButton: "modal-are-you-sure" },
      didOpen: () => {
        $(".swal2-actions").on("click", () =>
          $("#swal2-content + .swal2-input").focus()
        );
      },
      inputValidator: (value: any) => {
        if (value != this.SelectedIds.length) {
          return 'Count entered does not match selected count"!';
        }
      },
    }).then((result) => {
      if (result.value) {
        this.isloading = true;
        let objBulkAction = {
          reasonIds: this.SelectedIds,
          eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
          campaignId:
            this.selectedFromCampaignList.length > 0
              ? this.selectedFromCampaignList.map((s) => s.id).toString()
              : null,
          parentReasonId:
            this.selectedPaymentReasons.length > 0
              ? this.selectedPaymentReasons.map((s) => s.id).toString()
              : null,
          goal: this.goal,
          isDeactivate: this.isDeActive,
          loginUserId: this.localstoragedataService.getLoginUserId(),
        };
        this.reasonService.reasonBulkAction(objBulkAction).subscribe(
          (res) => {
            this.isloading = true;
            if (res) {
              Swal.fire({
                title: "",
                html: res,
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              } as any);
              this.activeModal.dismiss();
              this.commonMethodService.sendReasonLst(true);
            }
          },
          (err) => {
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
            });
          }
        );
      }
    });
  }
}
