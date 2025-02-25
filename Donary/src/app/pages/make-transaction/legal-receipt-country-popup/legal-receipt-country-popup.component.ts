import { CommonMethodService } from "./../../../commons/common-methods.service";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { LegalReceiptPopupComponent } from "../legal-receipt-popup/legal-receipt-popup.component";
import Swal from "sweetalert2";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PaymentApiGatewayService } from "src/app/services/payment-api-gateway.service";

@Component({
  selector: "app-legal-receipt-country-popup",
  templateUrl: "./legal-receipt-country-popup.component.html",
  styleUrl: "./legal-receipt-country-popup.component.scss",
  standalone: false,
})
export class LegalReceiptCountryPopupComponent {
  valueFromPopup: any;
  isClosed: boolean = true;
  countryCode: any = [];
  isloading = true;
  filteredCountries: { id: number; countryName: string }[];
  @Output() recallPaymentCard: EventEmitter<any> = new EventEmitter();

  constructor(
    private paymentTransactionService: PaymentTransactionService,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    public paymentApiGatewayService: PaymentApiGatewayService,
    public activeModal: NgbActiveModal
  ) {}
  @Input() paymentId: any;
  @Input() gridFilterData: any;
  @Input() transactionData: any;
  @Input() isBlukTransaction: any;
  @Input() isLegalReceiptNumPresent: any;
  modalOptions: NgbModalOptions;
  selectedCountry: any = 1;
  countries = [
    { id: 1, countryName: "USA" },
    { id: 2, countryName: "Canada" },
    { id: 3, countryName: "Belgium" },
    { id: 4, countryName: "UK" },
    { id: 5, countryName: "Israel" },
  ];

  ngOnInit() {
    this.getAllPaymentAPIGateway();
  }
  getAllPaymentAPIGateway() {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.paymentApiGatewayService
      .getAllPaymentAPIGateway(eventGuId)
      .subscribe((res: any) => {
        const countryCodeIds = [
          ...new Set(
            res
              .map((gateway) => gateway.countryCodeId)
              .filter((id) => id !== null)
          ),
        ];
        this.filteredCountries = this.countries.filter((country) =>
          countryCodeIds.includes(country.id)
        );
        this.selectedCountry = this.filteredCountries[0].id;
        this.isloading = false;
      });
  }
  onCountryChange(countryId) {
    this.selectedCountry = countryId;
  }

  Submit() {
    if (this.isBlukTransaction) {
      var obj = {
        paymentIds: this.paymentId,
        countryCodeId: this.selectedCountry,
      };
      this.activeModal.close();
      this.paymentTransactionService.BulkGenerateLegalReceipt(obj).subscribe(
        (res) => {
          if (this.isLegalReceiptNumPresent) {
            Swal.fire({
              title: "Error",
              text: "Some of the payments selected are not eligible to generate a legal receipt",
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          } else {
            if (res == "Success") {
              Swal.fire({
                title: "",
                text: "Receipt numbers generated successfully",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  this.commonMethodService.sendPaymentTrans(true);
                }
              });
            } else {
              Swal.fire({
                title: "Error",
                text: res,
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
        },
        (err) => {
          Swal.fire({
            title: "Error",
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
    } else {
      let obj = {
        paymentId: this.paymentId,
        countryCodeId: this.selectedCountry,
      };
      this.activeModal.close(this.isClosed);
      this.paymentTransactionService
        .GenerateLegalReceipt(obj)
        .subscribe((res) => {
          if (res.legalReceiptNum != null) {
            this.modalOptions = {
              centered: true,
              size: "md",
              backdrop: "static",
              keyboard: true,
              windowClass: "receipt_popup",
            };
            const modalRef = this.commonMethodService.openPopup(
              LegalReceiptPopupComponent,
              this.modalOptions
            );
            modalRef.result.then((result) => {
              this.valueFromPopup = result;
              if (this.valueFromPopup == true) {
                this.commonMethodService.sendPaymentTrans(true);
              }
            });
            modalRef.componentInstance.legalReceiptNum = res.legalReceiptNum;
            modalRef.componentInstance.transactionData = this.transactionData;
            modalRef.componentInstance.gridFilterData = this.gridFilterData;
            this.recallPaymentCard.emit(true);
          } else {
            Swal.fire({
              title: "Error",
              text: "Not able to generate legal receipt",
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
  }

  closePopup() {
    this.activeModal.close(this.isClosed);
  }
}
