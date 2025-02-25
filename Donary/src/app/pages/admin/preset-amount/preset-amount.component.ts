import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from "@angular/core";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PresetAmountService } from "src/app/services/presetAmounts.service";
import Swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { SettingsService } from "src/app/services/settings.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { PaymentApiGatewayService } from "src/app/services/payment-api-gateway.service";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
interface presetAmount {
  amountID: number;
  amount: string;
  text: string;
  sort: number;
}
@Component({
  selector: "app-preset-amount",
  templateUrl: "./preset-amount.component.html",
  styleUrls: ["./preset-amount.component.scss"],
  standalone: false,
})
export class PresetAmountComponent implements OnInit {
  @ViewChild("editableDiv", { static: false }) editableDiv: ElementRef;
  @ViewChild("scrollContainer", { static: false }) scrollContainer: ElementRef;
  presetAmounts: Array<presetAmount> = [];
  isloading: boolean = false;
  isDevEnv: boolean;
  settingsArray = [];
  settingsArrayUpdated = [];
  messageVariables: any = [];
  isChangedValue: boolean = false;
  isChangedValuePresetAmounts: boolean = false;
  contentUpdateArray = [];
  presetAmountsOrgArray: Array<presetAmount> = [];
  settingsValuesUpdated: any;
  selectedItemId: any;
  trackCursorIndex: number;
  trackCursorSettingId: number;
  selectedMessageVariable: any;
  hasNonUSD: boolean = false;
  finalResult = [];
  messageVariableList = [];
  indices: number[] = [];
  private analytics = inject(AnalyticsService);

  constructor(
    private presetAmountService: PresetAmountService,
    private toastr: ToastrService,
    public commonMethodService: CommonMethodService,
    private localstorageService: LocalstoragedataService,
    private settingsService: SettingsService,
    private commonAPIMethodService: CommonAPIMethodService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public paymentApiGatewayService: PaymentApiGatewayService
  ) {}

  ngOnInit() {
    this.analytics.visitedAdminSettings();
    this.getSettings();
    this.getAllPaymentAPIGateway();
    this.getFeatureSettingValues();
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    this.getPresetAmount();
    setTimeout(() => {
      this.GetMessageVariables();
    }, 4000);
  }

  convertDecimal(j: number) {
    this.presetAmounts = this.presetAmounts.map((element, index) => {
      if (j == index) {
        element.amount = Number(element.amount).toFixed(2);
      }
      return element;
    });
  }

  SavePresetAmount() {
    if (this.presetAmounts.length > 0) {
      this.presetAmounts = this.presetAmounts.map((element) => {
        if (element.amount == null || element.amount == "0.00") {
          element.amount = "-1";
        }
        return element;
      });
    }
    this.isloading = true;
    var presetObj = {
      presetAmounts: this.presetAmounts,
    };
    this.presetAmountService.saveSavePresetAmount(presetObj).subscribe(
      (res: any) => {
        this.isloading = false;

        if (res) {
          this.analytics.editedSettingsPreset();
          if (this.isChangedValuePresetAmounts) {
            this.showToaster(res);
            this.isChangedValuePresetAmounts = false;
            return;
          }
          Swal.fire("", res, "success");
          this.getPresetAmount();
        }
      },
      (error) => {
        this.showToaster(error);
      }
    );
  }
  getPresetAmount() {
    this.presetAmountService.getPresetAmount().subscribe((res: any) => {
      this.isloading = false;
      if (res) {
        this.presetAmounts = res;
        if (this.presetAmounts.length == 0) {
          for (let index = 0; index < 6; index++) {
            let sort = index + 1;
            this.presetAmounts.push({
              amountID: 0,
              amount: null,
              text: null,
              sort: sort,
            });
          }
        } else {
          this.presetAmounts = this.presetAmounts.map((element) => {
            if (element.amount == "0") {
              element.amount = null;
            } else {
              element.amount = Number(element.amount).toFixed(2);
            }
            return element;
          });
          if (this.presetAmounts.length <= 6) {
            for (let index = this.presetAmounts.length; index < 6; index++) {
              let sort = index + 1;
              this.presetAmounts.push({
                amountID: 0,
                amount: null,
                text: null,
                sort: sort,
              });
            }
          } else {
            this.presetAmounts = this.presetAmounts.slice(0, 6);
          }
        }
        this.presetAmountsOrgArray = this.presetAmounts.map((item) => {
          return { ...item };
        });
      }
    });
  }

  ngAfterViewInit() {
    this.scrollContainer.nativeElement.addEventListener(
      "scroll",
      this.onScroll.bind(this)
    );
  }

  activeSection: string = "section1"; // Set the initial active section

  @HostListener("window:scroll", [])
  onScroll() {
    const section1 = document.getElementById("section1");
    const section2 = document.getElementById("section2");
    const section3 = document.getElementById("section3");

    if (this.isElementInViewport(section1)) {
      this.activeSection = "section1";
      return;
    }
    if (this.isElementInViewport(section2)) {
      this.activeSection = "section2";
      return;
    }
    if (this.isElementInViewport(section3)) {
      this.activeSection = "section3";
      return;
    }
  }

  isElementInViewport(el: HTMLElement | null): boolean {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  showToaster(msg) {
    this.toastr.success(msg);
  }
  getAllPaymentAPIGateway() {
    let eventGuId = this.localstorageService.getLoginUserEventGuId();
    this.paymentApiGatewayService
      .getAllPaymentAPIGateway(eventGuId)
      .subscribe((res: any) => {
        res.forEach((item) => {
          if (!(item.countryCodeId == 1 || item.countryCodeId == null)) {
            this.hasNonUSD = true;
          }
        });
      });
  }

  getSettings() {
    let eventGuId = this.localstorageService.getLoginUserEventGuId();
    this.settingsService.getSettings(eventGuId).subscribe((res) => {
      setTimeout(() => {
        if (res) {
          res.settingName == "DisableAutomaticPledgeReceiptEmail"
            ? (this.commonMethodService.isDisableAutomaticPledge =
                res.settingsValue)
            : false;
          res = res.map((item) => {
            item.settingsValue = item.settingsValue.replace(/{/g, "{<span>");
            item.settingsValue = item.settingsValue.replace(/}/g, "</span>}");
            if (this.hasNonUSD && item.settingId == 228) {
              item.settingsValue = "true";
            }
            if (item.settingsValue !== "True") {
              let obj = {
                id: item.settingId,
                value: item.settingsValue,
              };
              this.finalResult.push(obj);
            }
            return item;
          });
          this.settingsArray = res;
          this.settingsArrayUpdated = res.map((x) => Object.assign({}, x));
        }
      }, 1000);
    });
  }
  GetMessageVariables() {
    this.commonAPIMethodService.GetMessageVariables().subscribe((res) => {
      if (res) {
        this.settingsArray.find((val) => {
          this.messageVariables = res;
          if (
            val.settingsValue.toString() !== "true" &&
            val.settingsValue.toString() !== "false"
          ) {
            if (val.settingName == "PaymentReceiptSMS") {
              this.messageVariableList.push(
                this.messageVariables.filter(
                  (o) => o.variableType == "Receipt-SMS-Variables"
                )
              );
            } else if (val.settingName == "PledgeSMS") {
              this.messageVariableList.push(
                this.messageVariables.filter(
                  (o) => o.variableType == "Pledge-SMS-Variables"
                )
              );
            } else if (val.settingName == "StatementSMS") {
              this.messageVariableList.push(
                this.messageVariables.filter(
                  (o) => o.variableType == "Statement-SMS-Variables"
                )
              );
            }
          }
        });
      }
    });
  }

  onDiscardChanges() {
    if (this.isChangedValue) {
      this.isChangedValue = false;
      this.settingsArray = this.settingsArrayUpdated.map((item) => {
        return { ...item };
      });
      this.changeDetectorRef.detectChanges();
    }
    if (this.isChangedValuePresetAmounts) {
      this.isChangedValuePresetAmounts = false;
      this.presetAmounts = this.presetAmountsOrgArray.map((item) => {
        return { ...item };
      });
      this.changeDetectorRef.detectChanges();
    }
  }

  presetAmoutUpdateChanges() {
    for (let index = 0; index < this.presetAmounts.length; index++) {
      const element = this.presetAmounts[index];
      const exist = this.presetAmountsOrgArray.some(
        (y) => y.amount == element.amount && y.text == element.text
      );
      if (!exist) {
        this.isChangedValuePresetAmounts = true;
        break;
      }
      this.isChangedValuePresetAmounts = false;
    }
  }

  saveSettings() {
    if (!this.isChangedValue) {
      return false;
    }

    const obj = {
      eventGuid: this.localstorageService.getLoginUserEventGuId(),
      settingId: this.settingsValuesUpdated.settingId,
      settingValue: this.settingsValuesUpdated.settingsValue,
      loginUserId: this.localstorageService.getLoginUserId(),
    };
    this.settingsService.saveSettings(obj).subscribe(
      (res) => {
        this.analytics.editedSettingsSMS();
        this.isChangedValue = false;
        this.showToaster(res);
        this.getSettings();
      },
      (error) => {
        this.showToaster(error);
      }
    );
  }

  updateChagesSave() {
    if (this.isChangedValue) {
      this.saveSettings();
    }
    if (this.isChangedValuePresetAmounts) {
      this.SavePresetAmount();
    }
  }

  trackCursor(event, settingId, settingsValue): void {
    const selection: any = window.getSelection();
    let testselection = selection.baseOffset;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedNode = range.commonAncestorContainer;
      let testdata = selectedNode.data;
      let indiceCount = this.findIndexOccurrences(settingsValue, testdata);
      if (this.indices.length > 1) {
        this.trackCursorIndex = indiceCount + testselection;
        this.trackCursorSettingId = settingId;
        return;
      }
      let index = settingsValue.value.indexOf(testdata);
      this.trackCursorIndex = index + testselection;
    }
    this.trackCursorSettingId = settingId;
  }

  findIndexOccurrences(settingsValue, searchString) {
    let index = settingsValue.value.indexOf(searchString);
    this.indices = [];
    while (index !== -1) {
      this.indices.push(index);
      index = settingsValue.value.indexOf(searchString, index + 1);
    }

    let nearestIndex = this.findNearestNumber(this.trackCursorIndex);
    return nearestIndex;
  }

  findNearestNumber(target: number): number | undefined {
    let nearest: number | undefined;
    let minDifference = Infinity;

    this.indices.forEach((number) => {
      const difference = Math.abs(target - number);
      if (difference < minDifference) {
        minDifference = difference;
        nearest = number;
      }
    });

    return nearest;
  }

  replaceSubstringBetweenIndices(
    originalString,
    startIndex,
    endIndex,
    replacement
  ) {
    return (
      originalString.substring(0, startIndex) +
      replacement +
      originalString.substring(endIndex)
    );
  }

  nearestGreater(arr, target) {
    let result = -1;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > target) {
        result = arr[i];
        return result;
      }
    }
    return result;
  }

  onSectionChange(cls) {
    const element = document.querySelector(`.${cls}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  removeSpanTag(str: string) {
    let splt = str.split("{<span>");
    let splt1 = splt.join("{");
    let splt2 = splt1.split("</span>}");
    let output = splt2.join("}");
    return output;
  }

  onSendAutomatic(event, item) {
    this.isChangedValue =
      item.settingsValue == event.target.checked ? false : true;
    let obj = {
      settingId: item.settingId,
      settingsValue: !event.target.checked,
    };
    this.settingsValuesUpdated = obj;
    if (this.isChangedValue) this.analytics.editedSettingsDisableEmail();
  }

  getFeatureSettingValues() {
    //  this.commonMethodService.featureName = 'save_preset_amounts'
    //  this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    if (this.isChangedValuePresetAmounts) {
      this.commonMethodService.featureName = "save_preset_amounts";
      this.commonMethodService.getFeatureSettingValues();
      this.commonMethodService.commenSendUpgradeEmail(
        this.commonMethodService.featureDisplayName
      );
    }
    if (this.isChangedValue) {
      this.commonMethodService.featureName = "Edit_SMS_for_receipts";
      this.commonMethodService.getFeatureSettingValues();
      this.commonMethodService.commenSendUpgradeEmail(
        this.commonMethodService.featureDisplayName
      );
    } else if (!this.isChangedValuePresetAmounts) {
      this.commonMethodService.featureName = "Edit_SMS_for_receipts";
      this.commonMethodService.getFeatureSettingValues();
      this.commonMethodService.commenSendUpgradeEmail(
        this.commonMethodService.featureDisplayName
      );
    }
    this.isChangedValuePresetAmounts = false;
  }

  onClickDiv(event, settingId) {
    let ele = document.getElementById(event.currentTarget.id);
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(ele);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      this.trackCursorIndex = preCaretRange.toString().length;
    }
    this.trackCursorSettingId = settingId;
  }
  onMessageVariable(event, i) {
    if (event) {
      let originalObj = this.settingsArray.filter(
        (id) => id.settingId == this.trackCursorSettingId
      );
      let originalValue = originalObj[0].settingsValue;
      if (originalValue.endsWith("<br><br>")) {
        originalValue = originalValue.substring(0, originalValue.length - 4);
      }
      let result =
        originalValue.substring(0, this.trackCursorIndex) +
        `{<span>${event.variableName}</span>}` +
        originalValue.substring(this.trackCursorIndex);
      this.settingsArray[i].settingsValue = result;
      this.finalResult[i].value = result;
      this.trackCursorIndex = result.length;
      setTimeout(() => {
        this.setCursorEndPoint();
        this.selectedItemId = null;
        this.changeDetectorRef.detectChanges();
      }, 100);
      this.isChangedValue = true;
    }
  }
  onInput(event, i) {
    this.settingsArray[i].settingsValue = event.currentTarget.innerHTML;
    this.trackCursorIndex = event.currentTarget.innerHTML.length;

    let obj = {
      settingId: this.settingsArray[i].settingId,
      settingsValue: event.currentTarget.innerText,
      deviceType: this.settingsArray[i].deviceType,
      settingName: this.settingsArray[i].settingName,
      displayName: this.settingsArray[i].displayName,
    };
    this.settingsValuesUpdated = obj;
  }
  onBackspace(event: any, item, index) {
    let spanId = `${item.settingId}_`;
    let spanEle = document.getElementById(spanId);
    let settingsValue = this.finalResult[index];

    if (event.code == "Backspace") {
      event.preventDefault();

      let t = this.removeSpanTag(item.settingsValue);
      this.trackCursor(event, item.settingId, settingsValue);
      const cursorPosition = this.trackCursorIndex + 7;
      let curlybrackets = settingsValue.value.charAt(cursorPosition);
      if (curlybrackets != "}") {
        let obj = {
          settingId: item.settingId,
          settingsValue: event.currentTarget.innerHTML,
          deviceType: item.deviceType,
          settingName: item.settingName,
          displayName: item.displayName,
        };
        settingsValue.value = event.currentTarget.innerHTML;
        this.settingsValuesUpdated = obj;
        return false;
      }

      const indexes = [];
      for (var i = 0; i < settingsValue.value.length; i++) {
        if (settingsValue.value[i] == "{" || settingsValue.value[i] == "}") {
          indexes.push(i);
        }
      }
      if (indexes.length > 0) {
        let lastIndex = indexes.indexOf(cursorPosition);
        let curlybrackets = settingsValue.value.charAt(cursorPosition);
        if (curlybrackets != "}") {
          const atPosition = this.nearestGreater(indexes, cursorPosition);
          lastIndex = indexes.indexOf(atPosition);
        }
        let endIndex = indexes[lastIndex];
        let startIndex = indexes[lastIndex - 1];
        endIndex = endIndex + 1;
        settingsValue.value = this.replaceSubstringBetweenIndices(
          settingsValue.value,
          startIndex,
          endIndex,
          ""
        );

        spanEle.innerHTML = settingsValue.value;
        let obj = {
          settingId: item.settingId,
          settingsValue: settingsValue.value,
          deviceType: item.deviceType,
          settingName: item.settingName,
          displayName: item.displayName,
        };
        this.settingsValuesUpdated = obj;
        setTimeout(() => {
          this.setCursorEndPoint();
        }, 30);
      }
    }
  }
  setCursorEndPoint() {
    let id = this.trackCursorSettingId.toString() + "_";
    let el = document.getElementById(id);
    let sel = window.getSelection();
    sel.selectAllChildren(el);
    sel.collapseToEnd();
  }
  messegeBoxInput(event, i) {
    this.isChangedValue =
      this.settingsArrayUpdated[i].settingsValue ==
      event.currentTarget.innerHTML
        ? false
        : true;
  }
}
