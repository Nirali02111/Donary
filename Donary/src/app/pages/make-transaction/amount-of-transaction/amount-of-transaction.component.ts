import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { ControlContainer, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { CommonMethodService } from 'src/app/commons/common-methods.service';
import { LocalstoragedataService } from 'src/app/commons/local-storage-data.service';
import { AngularMultiSelect } from 'src/app/commons/modules/angular-multi-select-module/multiselect.component';
import { DonaryInputModule } from 'src/app/commons/modules/donary-input/donary-input.module';
import { CommonAPIMethodService } from 'src/app/services/common-api-method.service';
import { PresetAmountService } from 'src/app/services/presetAmounts.service';
declare var $: any;
@Component({
  selector: 'app-amount-of-transaction',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DonaryInputModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './amount-of-transaction.component.html',
  styleUrl: './amount-of-transaction.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class AmountOfTransactionComponent implements OnInit, AfterViewInit {
  public formatAmt$ = new Subject<string>();
  symbol: string = "";
  currency: any;
  currencies = [];
  presetAmountList: any[] = [];
  currencyClass = "icon icon-dollar";
  reasonCurrencyClass = "icon-content icon-dollar-content";
  currencyIcon = "$";
  
  parentControl = inject(ControlContainer);
  commonMethodService = inject(CommonMethodService);
  private commonAPI = inject(CommonAPIMethodService);
  private localStorageDataService = inject(LocalstoragedataService);
  private presetAmountService = inject(PresetAmountService);

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  @Output() symbolChange: EventEmitter<string> = new EventEmitter()
  @Output() amountChange: EventEmitter<string> = new EventEmitter()
  @ViewChild("campaigndrp", { static: false }) dropdownRef: AngularMultiSelect;
  @ViewChild("donorNextButton", { static: false }) donorNext: ElementRef;
  @ViewChild("donorProcessButton", { static: false }) donorProcess: ElementRef;
  @ViewChild("paymentNextBtn", { static: false }) paymentNext: ElementRef;
  @ViewChild("paymentProcessBtn", { static: false }) paymentProcess: ElementRef;
  @ViewChild("cashNextBtn", { static: false }) cashNext: ElementRef;
  @ViewChild("cashProcessBtn", { static: false }) cashProcess: ElementRef;
  @ViewChild("pledgeNextBtn", { static: false }) pledgeNext: ElementRef;
  @ViewChild("peldgeProcessBtn", { static: false }) pledgeProcess: ElementRef;
  @ViewChild("donationAmt", { static: false }) donationAmtField: ElementRef;
  @ViewChild("donorSearch", { static: false }) donorSearchField: ElementRef;
  @ViewChild("amount10", { static: false }) amount10Field: ElementRef;
  @ViewChild("ccField", { static: false }) ccField: ElementRef;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild("reasondrp", { static: false })
  reasondropdownRef: AngularMultiSelect;
  @ViewChild("locationdrp", { static: false })
  locationdropdownRef: AngularMultiSelect;
  disableValue: boolean;
  @ViewChild("collectordrp", { static: false })

  get formGroup() {
    return this.parentControl.control as FormGroup;
  }

  get amount() {
    return this.formGroup.get("amount");
  }

  constructor(private localstoragedataService: LocalstoragedataService, private readonly changeDetectorRef: ChangeDetectorRef,) {

  }


  ngOnInit(): void {
    this.getCurrencies();
    this.getPresetAmountList();
    this.formGroup.get("currency").valueChanges.subscribe((val) => {
      if (!val) {
        return;
      }
      this.symbol = this.getCurrencySymbol(val);
      this.symbolChange.emit(this.symbol);
      this.changeDetectorRef.detectChanges();
    });
    this.formGroup.get("currency").setValue("USD");
    // this.formGroup.get("currency").setValue(this.symbol);
  }

  ngAfterViewInit(): void { }

  getPresetAmountList() {
    this.presetAmountService.getPresetAmount().subscribe((res: any) => {
      if (res) {
        this.presetAmountList = res;
      }
    });
  }

  getCurrencies() {
    this.currency = this.localStorageDataService.getLoginUserCurrency();

    if (this.currency != null) {
      this.formGroup.get("currency").patchValue(Number(this.currency));
      this.symbol = this.getCurrencySymbol(this.currency);
      this.symbolChange.emit(this.symbol)
    }
    let eventGuId = this.localStorageDataService.getLoginUserEventGuId();
    this.commonAPI.getCurrencies(eventGuId).subscribe((res) => {
      this.currencies = res;
    });
  }

  getCurrencySymbol(currencyName: string): string {
    switch (currencyName) {
      case "USD":
        return "$";
      case "CAD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "ILS":
        return "₪";
      default:
        return "";
    }
  }

  isSelectAmoutClickddlPaymentReason = false;
  SelectAmount(amt: number | string, id: string = ""): void {
    // Handle amount input
    if (amt !== "") {
      amt = typeof amt === 'string' ? parseFloat(amt) : amt;
      if (this.amount) {
        this.amount.setValue(amt.toFixed(2));
      }
      if (id != "") {
        $("#" + id).focus();
      } if (id != "") {
        $("#" + id).focus();
      }
      this.disableValue = false;
    } else {
      this.disableValue = true
    }

    // Future logic (currently commented out)
    // TODO: Implement validation and navigation logic as needed
  }

  fisrtIndexTab(event, amt: number, cls: number) {
    $(".tab-active").removeClass("tab-active");
    $(".li-" + cls).addClass("tab-active");

    setTimeout(() => {
      if (this.amount) {
        this.amount.patchValue(amt.toFixed(2));
      }
    }, 0);
  }

  removeClsfisrtIndexTab(event) {
    $(".tab-active").removeClass("tab-active");
  }

  formatAmount(value, currency = "USD") {
    if (value != null) {
      let defaultCurrency = this.localstoragedataService.getLoginUserCurrency();
      let payCurrency = this.localstoragedataService.getPayCurrency();
      if (currency != "USD") {
        defaultCurrency = currency;
      }
      if (payCurrency != "USD" || currency != "USD") {
        defaultCurrency = payCurrency;
      }
      //let defaultCurrency="ILS"
      defaultCurrency =
        defaultCurrency == null || defaultCurrency == "CAD"
          ? "USD"
          : defaultCurrency;
      if (
        defaultCurrency == null ||
        defaultCurrency == "USD" ||
        defaultCurrency == "CAD"
      ) {
        this.currencyClass = "icon icon-dollar";
        this.reasonCurrencyClass = "icon-content icon-dollar-content";
        this.currencyIcon = "$";
      } else if (defaultCurrency == "GBP") {
        this.currencyClass = "icon icon-gbp";
        this.reasonCurrencyClass = "icon-content icon-gbp-content";
        this.currencyIcon = "£";
      } else if (defaultCurrency == "EUR") {
        this.currencyClass = "icon icon-eur";
        this.reasonCurrencyClass = "icon-content icon-eur-content";
        this.currencyIcon = "€";
      } else if (defaultCurrency == "ILS") {
        this.currencyClass = "icon icon-ils";
        this.reasonCurrencyClass = "icon-content icon-ils-content";
        this.currencyIcon = "₪";
      }
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: defaultCurrency,
      }).format(value);
    }
  }

  getLoginUserCurrency() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).eventCurrency;
    } else {
      return null;
    }
  }

  getPayCurrency() {
    if (JSON.parse(localStorage.getItem("userpay_storage"))) {
      return JSON.parse(localStorage.getItem("userpay_storage")).eventCurrency;
    } else {
      return null;
    }
  }

  isPresetAmountList() {
    if (this.presetAmountList && this.presetAmountList.length == 0) {
      return false;
    }
    if (this.presetAmountList == undefined) {
      return false;
    }
    return true;
  }

  focusAmtEvent() {
    this.amount10Field.nativeElement.focus();
    ///alert("Hello");
  }

  removeDpw() {
    this.isSelectAmoutClickddlPaymentReason = false;
  }

  changeSideTab(amount: number, tabName) {
    this.amount.patchValue(Number(amount));
  }

}
