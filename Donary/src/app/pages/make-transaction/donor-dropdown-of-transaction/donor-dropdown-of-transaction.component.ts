import { NgTemplateOutlet } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
  signal,
  ViewChild,
} from "@angular/core";
import {
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import { NgbModalOptions, NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectComponent, NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { Subject } from "rxjs";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { DonorSaveComponent } from "../../donor/donor-save/donor-save.component";

export interface DonorOfDropdownInTransactionObj {
  accountNum: string | null;
  fullName: string | null;
  fullNameJewish: string | null;
  address: string | null;
  cityStateZip: string | null;
  emailLabels: string | null;
  emails: string | null;
  additionalPhoneNumbers: string | null;
  donorStatus: string | null;
  class: string | null;
  group: string | null;
  phoneLabels: string | null;
  phonenumbers: string | null;
}

@Component({
  selector: "app-donor-dropdown-of-transaction",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    NgSelectModule,
    TranslateModule,
    NgbPopoverModule,
    DoanryDirective,
  ],
  templateUrl: "./donor-dropdown-of-transaction.component.html",
  styleUrl: "./donor-dropdown-of-transaction.component.scss",

  providers: [],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class DonorDropdownOfTransactionComponent
  implements OnInit, AfterViewInit
{
  eventService: any;
  isNotifyDonarEmailShow: any;
  isOpenFromCard: boolean;
  paymentDetails: any;
  cardtype: string;
  emailResult: any;
  phoneResult: any;
  notifyDonarEmailArray: any;
  notifyDonarEmail: any;
  notifyDonarPhoneArray: any;
  EmailCheckbox: boolean;
  tempemailCheckbox: any;
  tempnotifyDonarEmail: any;
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService
  ) {}

  @HostListener("click", ["$event"])
  onClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.closest(".ng-input")) {
      const selectedItem = this.donorDrp.selectedItems[0];
      if (selectedItem) {
        if (this.donorDrp) {
          this.donorDrp.close();
        }
        const accountId = selectedItem.value.accountId;
        this.openDonorCard(accountId);
      }
    }
  }
  isGlobal = false;

  modalOptions: NgbModalOptions;

  donorSearch = signal<string | null>(null);
  searchInDonorObservable = new Subject<string>();

  readonly cdr = inject(ChangeDetectorRef);

  parentControl = inject(ControlContainer);
  commonMethodService = inject(CommonMethodService);

  get formGroup() {
    return this.parentControl.control as FormGroup;
  }

  @ViewChild("donorDrp") donorDrp!: NgSelectComponent;

  @Output() public donorChange =
    new EventEmitter<DonorOfDropdownInTransactionObj | null>();

  ngOnInit(): void {
    if (this.commonMethodService.localDonorList.length === 0) {
      this.commonMethodService.getDonorList();
    }

    this.searchInDonorObservable.subscribe((searchValue: string) => {
      this.donorSearch.update(() => searchValue);
      if (!this.isGlobal) {
        this.donorDrp.filter(searchValue);
        return;
      }
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onClickGlobalSearch() {
    this.commonMethodService.onDonorSearchFieldChange(
      this.donorSearch(),
      this.isGlobal
    );
    if (this.donorDrp) {
      this.donorDrp.open();
    }

    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 5000);
  }

  customSearchFn(term: string, item: DonorOfDropdownInTransactionObj) {
    const isInSearch = (
      termValue: string,
      objectKey: string | number | null
    ) => {
      return (
        objectKey && objectKey.toString().toLowerCase().indexOf(termValue) > -1
      );
    };

    return (
      item &&
      item.donorStatus &&
      item.donorStatus.toString().toLowerCase() === "active" &&
      (isInSearch(term, item.accountNum) ||
        isInSearch(term, item.fullName) ||
        isInSearch(term, item.fullNameJewish) ||
        isInSearch(term, item.address) ||
        isInSearch(term, item.cityStateZip) ||
        isInSearch(term, item.class) ||
        isInSearch(term, item.phoneLabels) ||
        isInSearch(term, item.phonenumbers) ||
        isInSearch(term, item.emailLabels) ||
        isInSearch(term, item.emails) ||
        isInSearch(term, item.additionalPhoneNumbers))
    );
  }

  openDonorCard(accountId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_card new_trans_donor",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AccountId = accountId;
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountId,
    };
    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      modalRef.componentInstance.DonorCardData = res;
    });
  }

  GetSetting() {
    const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.eventService.GetSetting(eventGuid, true).subscribe((res) => {
      this.isNotifyDonarEmailShow = res.some(
        (item) =>
          (item.settingName == "DisableAutomaticPledgeReceiptEmail" &&
            item.text.toLowerCase() == "false") ||
          (item.settingName == "DisableAutomaticPaymentReceiptEmail" &&
            item.text.toLowerCase() == "false")
      );
      if (this.isOpenFromCard == true) {
        this.isOpenFromCard = false;
        this.paymentDetailsValue();
      }
    });
  }

  paymentDetailsValue() {
    if (this.paymentDetails) {
      if (this.cardtype == "DonorCard") {
        this.emailResult = this.paymentDetails.lstEmail.map((item) => {
          const [label, email] = item.split(":");
          return {
            email: email.trim(),
            label: label.trim(),
          };
        });

        this.phoneResult = this.paymentDetails.lstPhoneNumber.map((item) => {
          const [label, phone] = item.split(":");
          return {
            phone: phone.trim(),
            label: label.trim(),
          };
        });
      } else {
        const emails = this.paymentDetails.emails
          ? this.paymentDetails.emails.split(",")
          : [];
        const emailLabels = this.paymentDetails.emailLabels
          ? this.paymentDetails.emailLabels.split(",")
          : [];
        this.emailResult = this.margeKeyValue(emails, emailLabels, "email");

        const phoneNumber = this.paymentDetails.additionalPhoneNumbers
          ? this.paymentDetails.additionalPhoneNumbers.split(",")
          : [];
        const phoneLabels = this.paymentDetails.additionalPhoneLabels
          ? this.paymentDetails.additionalPhoneLabels.split(",")
          : [];
        this.phoneResult = this.margeKeyValue(
          phoneNumber,
          phoneLabels,
          "phone"
        );
      }
      var donarDetails = [{ email: this.emailResult, phone: this.phoneResult }];
      this.notifyDonarEmailArray =
        donarDetails && donarDetails.length > 0 ? donarDetails[0].email : [];
      this.notifyDonarEmail =
        this.notifyDonarEmailArray && this.notifyDonarEmailArray.length > 0
          ? this.notifyDonarEmailArray[0]
          : "";

      if (!this.isNotifyDonarEmailShow) {
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      this.notifyDonarPhoneArray =
        donarDetails && donarDetails.length > 0 ? donarDetails[0].phone : [];
      this.EmailCheckbox =
        this.notifyDonarEmail && this.notifyDonarEmail.email != "Select Email";
      this.tempemailCheckbox = this.EmailCheckbox;
      this.tempnotifyDonarEmail = this.notifyDonarEmail;
    }
  }

  margeKeyValue(keys = [], values = [], item = "") {
    const resultArray = [];
    for (let index = 0; index < keys.length; index++) {
      let obj =
        item == "email"
          ? { email: keys[index], label: values[index] }
          : { phone: keys[index], label: values[index] };
      resultArray.push(obj);
    }
    return resultArray;
  }

  isCreateDonorPopup = false;
  OpenCreateDonorPopup() {
    this.isCreateDonorPopup = true;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_popup",
    };

    const modalRef = this.commonMethodService.openPopup(
      DonorSaveComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";

    const ishebrew = this.contains_heb(this.donorSearch());
    const jewish = ishebrew ? this.donorSearch() : null;
    const english = !ishebrew ? this.donorSearch() : null;

    modalRef.componentInstance.DonorName = {
      jewishName: jewish,
      englishName: english,
    };

    // Subscribe to the modal's output
    modalRef.componentInstance.emtOutputDonorTransaction.subscribe(
      (response) => {
        this.isCreateDonorPopup = false;
        if (response) {
          // Add the new donor to the list
          this.commonMethodService.localDonorList = [
            ...this.commonMethodService.localDonorList,
            response,
          ];
          // Update the form control
          this.formGroup.get("accountId")?.setValue(response.accountId);
          // Optionally, trigger change detection if the ng-select is not reflecting changes
          this.changeDetectorRef.detectChanges();
          this.donorChange.emit(response);
          if (this.donorDrp) {
            this.donorDrp.open();
            setTimeout(() => this.donorDrp.close(), 100);
          }
        }
      }
    );
  }
}
