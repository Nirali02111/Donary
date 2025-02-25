import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorService } from "src/app/services/donor.service";
import Swal from "sweetalert2";
import * as _ from "lodash";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { CardService } from "src/app/services/card.service";
declare var $: any;

interface LabelAndValue {
  label: string;
  value: string;
}

interface AddressAndZip {
  address: string;
  cityStateZip: string;
}

interface fatherName {
  fatherNameJewish: string;
}

interface fatherInLawName {
  fatherInLawNameJewish: string;
}

interface DonorMergeItem {
  accountId1: number;
  accountId2: number;
  accountNum: string;
  address: string;
  cityStateZip: string;
  addressArray: Array<AddressAndZip>;
  fatherNameArray: Array<fatherName>;
  fatherInLawNameArray: Array<fatherInLawName>;
  fullName: string;
  fullNameJewish: string;
  fatherNameJewish: string;
  fatherInLawNameJewish: string;
  group: number;
  emails: string;
  emailsArray: Array<LabelAndValue>;
  phones: string;
  phonesArray: Array<LabelAndValue>;
  paymentCount: number;
  pledgesCount: number;
  scheduleCount: number;
  walletsCount: number;
  subCards?: Array<DonorMergeItem>;
  subCardId: number;
  primaryCls: string;
  addresses: string;
  addressesArray: Array<LabelAndValue>;
}

interface SelectItem {
  FromAccountIds: Array<number>;
  ToAccountId: number;
  address: string;
  cityStateZip: string;
  addressArray: Array<AddressAndZip>;
  emailsArray: Array<LabelAndValue>;
  phonesArray: Array<LabelAndValue>;
  paymentCount: number;
  pledgesCount: number;
  scheduleCount: number;
  walletsCount: number;
  fatherNameArray: Array<fatherName>;
  fatherInLawNameArray: Array<fatherInLawName>;
  addressesArray: Array<LabelAndValue>;
}

@Component({
  selector: "app-donor-merge",
  templateUrl: "./donor-merge.component.html",
  standalone: false,
  styleUrls: ["./donor-merge.component.scss"],
})
export class DonorMergeComponent implements OnInit {
  isloading: boolean = false;

  hasMergeAction: boolean = false;

  selectedList: Array<SelectItem> = [];

  listData: Array<DonorMergeItem> = [];

  listGridData: Array<DonorMergeItem> = [];
  resMergeDonorsArray: Array<any> = [];
  searchValue: string = "";
  modalOptions: NgbModalOptions;
  eventDivIdDonarUpdate: any;
  itemDonarUpdate: any;
  @Output() emtMergeDonorModel: EventEmitter<any> = new EventEmitter();
  constructor(
    public activeModal: NgbActiveModal,
    private donorService: DonorService,
    private localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private cardService: CardService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".title_stripbar",
      });
    });
    this.reloadData();
    // added new
    this.commonMethodService.getDonorSingle().subscribe((res: any) => {
      if (res && res.length > 0) {
        this.newLocallyUpdateDonar(res);
        this.commonMethodService.sendDonorSingle(null);
      }
    });
  }

  extractFromString(stringValue, separator = ","): Array<LabelAndValue> {
    if (stringValue && stringValue.indexOf(separator) > -1) {
      let multipleArray = stringValue.split(separator);

      const finalPhones = multipleArray
        .map((s) => {
          if (s.indexOf(":") > -1) {
            let singleArray = s.split(":");
            return {
              label: _.trim(singleArray[0]),
              value: _.trim(singleArray[1]),
            };
          }
          return null;
        })
        .filter((v) => v !== null);
      return finalPhones;
    } else if (stringValue && stringValue.indexOf(":") > -1) {
      let singleArray = stringValue.split(":");
      return [{ label: _.trim(singleArray[0]), value: _.trim(singleArray[1]) }];
    }
  }
  newDonarResArray = [];
  reloadData() {
    this.isloading = true;
    let eventId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getMergeDonors(eventId)
      .subscribe((res: Array<DonorMergeItem>) => {
        this.isloading = false;
        this.newDonarResArray = res;
        res = res.map((o) => {
          let phoneArray = [];
          let emailArray = [];
          let addressArray = [];

          if (o.phones) {
            phoneArray = this.extractFromString(o.phones);
          }

          if (o.emails) {
            emailArray = this.extractFromString(o.emails);
          }
          if (o.addresses) {
            let address = this.addressAddSpace(o.addresses);
            addressArray = this.extractFromString(address, ";");
          }

          return {
            ...o,
            phonesArray: phoneArray,
            emailsArray: emailArray,
            addressesArray: addressArray,
          };
        });

        this.listData = _(res)
          .groupBy("group")
          .map((props) => ({
            ..._.find(props, (o) => {
              return o.accountId1 === o.accountId2;
            }),
            subCards: _.filter(props, (o) => {
              return o.accountId1 !== o.accountId2;
            }),
          }))
          .value();
        this.resMergeDonorsArray = this.listData; //new added
        this.listGridData = this.listData;
        this.selectedList = [];
        this.searchValue = "";
        this.addSubCardId();
      });
  }

  closePopup() {
    this.activeModal.dismiss();
    if (this.hasMergeAction) {
      this.emtMergeDonorModel.emit(true);
    }
  }

  /**
   * Search Query for in donor list
   * @param obj DonorMergeItem
   * @param key String
   * @param searchValue String
   * @returns
   */
  searchInField(obj: DonorMergeItem, key: string, searchValue: string) {
    const field = obj[key];
    return field && field.toString().toLowerCase().indexOf(searchValue) > -1;
  }

  /**
   * Search Query for array element
   * @param obj DonorMergeItem
   * @param key String
   * @param searchValue String
   * @returns
   */
  searchInLastField(obj: DonorMergeItem, key: string, searchValue: string) {
    const field = obj[key];
    if (field && field.length !== 0) {
      const el = field[field.length - 1];
      return (
        el.value && el.value.toString().toLowerCase().indexOf(searchValue) > -1
      );
    }
    return false;
  }

  searchInDonor(event) {
    let keyword = this.searchValue.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        this.listGridData = _.filter(this.listData, (obj) => {
          return (
            this.searchInField(obj, "accountNum", searchValue) ||
            this.searchInField(obj, "fullName", searchValue) ||
            this.searchInField(obj, "fullNameJewish", searchValue) ||
            this.searchInLastField(obj, "phonesArray", searchValue) ||
            this.searchInLastField(obj, "emailsArray", searchValue) ||
            obj.subCards.filter(
              (subobj) =>
                this.searchInField(subobj, "accountNum", searchValue) ||
                this.searchInField(subobj, "fullName", searchValue) ||
                this.searchInField(subobj, "fullNameJewish", searchValue) ||
                this.searchInLastField(subobj, "phonesArray", searchValue) ||
                this.searchInLastField(subobj, "emailsArray", searchValue)
            ).length > 0
          );
        });
      }
    } else {
      this.listGridData = this.listData;
    }
  }

  showMessageAndReload(message, isError) {
    if (isError) {
      Swal.fire({
        title: this.commonMethodService.getTranslate(
          "WARNING_SWAL.SOMETHING_WENT_WRONG"
        ),
        text: message,
        icon: "error",
        customClass: {
          container: "swal2-container-merge-donor",
        },
      }).then(() => {
        this.reloadData();
      });

      return;
    }

    Swal.fire({
      title: this.commonMethodService.getTranslate(
        "WARNING_SWAL.SUCCESS_TITLE"
      ),
      text: "Donor Merge Successfully",
      icon: "success",
      customClass: {
        container: "swal2-container-merge-donor",
      },
    }).then(() => {
      this.hasMergeAction = true;
      this.reloadData();
    });
  }

  /**
   *
   * @param toAccountId number
   * @param phonesArray total all phone list value
   * @returns
   */
  removeDuplicatePhoneOnMerge(
    toAccountId: number,
    phonesArray: Array<LabelAndValue>
  ) {
    const list = _.uniqWith(phonesArray, _.isEqual);
    const found = this.listData.find((o) => {
      return o.accountId1 === toAccountId;
    });

    return list.filter((o) => {
      if (found.phonesArray != undefined) {
        return !found.phonesArray.find((fp) => {
          return fp.label === o.label && fp.value === o.value;
        });
      }
    });
  }

  /**
   *
   * @param toAccountId number
   * @param emailsArray total all email list value
   * @returns
   */
  removeDuplicateEmailOnMerge(
    toAccountId: number,
    emailsArray: Array<LabelAndValue>
  ) {
    const list = _.uniqWith(emailsArray, _.isEqual);

    const found = this.listData.find((o) => {
      return o.accountId1 === toAccountId;
    });

    return list.filter((o) => {
      if (found.emailsArray != undefined) {
        return !found.emailsArray.find((fp) => {
          return fp.label === o.label && fp.value === o.value;
        });
      }
    });
  }

  removeDuplicateAddressOnMerge(
    toAccountId: number,
    addressesArray: Array<LabelAndValue>
  ) {
    const list = _.uniqWith(addressesArray, _.isEqual);

    const found = this.listData.find((o) => {
      return o.accountId1 === toAccountId;
    });

    return list.filter((o) => {
      if (found.addressesArray != undefined) {
        return !found.addressesArray.find((fp) => {
          return fp.label === o.label && fp.value === o.value;
        });
      }
    });
  }

  /**
   * Add selected sub card in to selcted list in Primary card
   * @param item DonorMergeItem
   */
  onMergeClick(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );
    if (found) {
      if (!found.FromAccountIds.find((o) => o === item.accountId2)) {
        this.selectedList = this.selectedList.map((o) => {
          if (o.ToAccountId === item.accountId1) {
            return {
              ...o,
              FromAccountIds: [...o.FromAccountIds, item.accountId2],
              phonesArray:
                item.phonesArray == undefined || found.phonesArray == null
                  ? null
                  : this.removeDuplicatePhoneOnMerge(item.accountId1, [
                      ...found.phonesArray,
                      ...item.phonesArray,
                    ]),
              emailsArray:
                item.emailsArray == undefined || found.emailsArray == null
                  ? null
                  : this.removeDuplicateEmailOnMerge(item.accountId1, [
                      ...found.emailsArray,
                      ...item.emailsArray,
                    ]),
              paymentCount: found.paymentCount + item.paymentCount,
              pledgesCount: found.pledgesCount + item.pledgesCount,
              scheduleCount: found.scheduleCount + item.scheduleCount,
              walletsCount: found.walletsCount + item.walletsCount,
              addressesArray: !item.addressesArray
                ? null
                : this.removeDuplicateAddressOnMerge(item.accountId1, [
                    ...found.addressesArray,
                    ...item.addressesArray,
                  ]),
            };
          }

          return o;
        });
      }
    } else {
      let subAddress = item.subCards;
      if (!subAddress) {
        subAddress = [];
      }
      let addressArrayTemp = [
        {
          address: item.address,
          cityStateZip: item.cityStateZip,
        },
        ...subAddress.map((x) => {
          return {
            address: x.address,
            cityStateZip: x.cityStateZip,
          };
        }),
      ];

      addressArrayTemp = _.uniqBy(
        addressArrayTemp,
        (x) =>
          (x.address ? x.address : "") + (x.cityStateZip ? x.cityStateZip : "")
      );

      /* FatherName Array */

      let subFatherName = item.subCards;
      if (!subFatherName) {
        subFatherName = [];
      }
      let fatherNameArrayTemp = [
        {
          fatherNameJewish: item.fatherNameJewish,
        },
        ...subFatherName.map((x) => {
          return {
            fatherNameJewish: x.fatherNameJewish,
          };
        }),
      ];

      fatherNameArrayTemp = _.uniqWith(fatherNameArrayTemp, (x) =>
        x.fatherNameJewish ? x.fatherNameJewish : ""
      );

      /* FatherName Array End */

      let subFatherInLawName = item.subCards;
      if (!subFatherInLawName) {
        subFatherInLawName = [];
      }
      let fatherInLawNameArrayTemp = [
        {
          fatherInLawNameJewish: item.fatherInLawNameJewish,
        },
        ...subFatherInLawName.map((x) => {
          return {
            fatherInLawNameJewish: x.fatherInLawNameJewish,
          };
        }),
      ];

      fatherInLawNameArrayTemp = _.uniqWith(fatherInLawNameArrayTemp, (x) =>
        x.fatherInLawNameJewish ? x.fatherInLawNameJewish : ""
      );

      this.selectedList.push({
        FromAccountIds: [item.accountId2],
        ToAccountId: item.accountId1,
        phonesArray:
          item.phonesArray == undefined
            ? null
            : this.removeDuplicatePhoneOnMerge(item.accountId1, [
                ...item.phonesArray,
              ]),
        emailsArray:
          item.emailsArray == undefined
            ? null
            : this.removeDuplicateEmailOnMerge(item.accountId1, [
                ...item.emailsArray,
              ]),
        paymentCount: item.paymentCount,
        pledgesCount: item.pledgesCount,
        scheduleCount: item.scheduleCount,
        walletsCount: item.walletsCount,
        address: item.address,
        cityStateZip: item.cityStateZip,
        addressArray: addressArrayTemp,
        fatherNameArray: fatherNameArrayTemp,
        fatherInLawNameArray: fatherInLawNameArrayTemp,
        addressesArray:
          item.addressesArray == undefined
            ? null
            : this.removeDuplicateAddressOnMerge(item.accountId1, [
                ...item.addressesArray,
              ]),
      });
    }
  }

  getMergedAddress(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      return found.addressesArray;
    }

    return [];
  }

  getMergedFatherName(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );
    if (found) {
      return found.fatherNameArray;
    }

    return [];
  }

  getMergedFatherInLawName(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );
    if (found) {
      return found.fatherInLawNameArray;
    }

    return [];
  }

  /**
   * Remove all selected sub cards from Primary card
   * @param item DonorMergeItem
   */
  onExtractClick(item: DonorMergeItem) {
    this.selectedList = this.selectedList.filter(
      (o) => o.ToAccountId !== item.accountId1
    );
  }

  /**
   * On Swap cards
   */
  dynamicSetclass = -1;
  onSwapClick(item: DonorMergeItem, event, i, index) {
    let eventDivId = event.currentTarget.id;
    this.eventDivIdDonarUpdate = eventDivId;
    this.itemDonarUpdate = item;
    let divId = parseInt(event.currentTarget.offsetParent.id);
    let subDivCls = "sub-" + i + "-" + index;
    setTimeout(function () {
      $(".subcard-clicked").removeClass("subcard-clicked");
      $("." + subDivCls).addClass("subcard-clicked");
      $(".dynamicCls-" + eventDivId).addClass("animation");
      $(".dynamicCls-" + eventDivId + " .primary_pop").animate(
        {
          left:
            $(".dynamicCls-" + eventDivId + " .primary_pop").outerWidth() +
            40 +
            divId * 440,
        },
        2500,
        "linear"
      );
    }, 500);

    setTimeout(function () {
      $(".dynamicCls-" + eventDivId).removeClass("animation");
    }, 3000);

    $("#" + eventDivId).removeClass("disabled-animation");
    this.dynamicSetclass = eventDivId;

    for (let index = 0; index < 50000; index++) {}

    const { subCards, ...primeCard } = this.listGridData.find((o) => {
      return o.group === item.group;
    });
    const newPrimary = subCards.find((n) => {
      return n.accountId2 === item.accountId2;
    });

    const itemsNewSubcards = subCards.map((n) => {
      if (n.accountId2 === item.accountId2) {
        return {
          ...primeCard,
          accountId1: item.accountId2,
        };
      }
      return {
        ...n,
        accountId1: item.accountId2,
      };
    });

    const newItem: DonorMergeItem = {
      ...newPrimary,
      accountId1: item.accountId2,
      subCards: itemsNewSubcards,
    };

    this.listGridData = this.listGridData.map((lg) => {
      if (lg.group === newPrimary.group) {
        return newItem;
      }
      return lg;
    });

    this.listData = this.listData.map((ld) => {
      if (ld.group === newPrimary.group) {
        return newItem;
      }
      return ld;
    });

    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      this.selectedList = this.selectedList.map((o) => {
        if (o.ToAccountId === item.accountId1) {
          /**
           * Add account Id into froms
           */
          const fromIds = o.FromAccountIds.map((fi) => {
            if (fi === item.accountId2) {
              return o.ToAccountId;
            }
            return fi;
          });

          return {
            ...o,
            FromAccountIds: fromIds,
            ToAccountId: item.accountId2,
          };
        }
        return o;
      });
    }
    //////////
  }

  /**
   * Check if sub card is already selected or not
   * @param item DonorMergeItem
   * @returns
   */
  isSelectedCard(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );
    if (!found) {
      return false;
    }

    if (found.FromAccountIds.find((o) => o === item.accountId2)) {
      return true;
    }

    return false;
  }

  /**
   * Disable Process button until any card selected
   * @returns boolean
   */
  isProcessBtnDisable() {
    return this.selectedList.length === 0;
  }

  getEmailArrayOfSelected(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      return found.emailsArray;
    }

    return [];
  }

  getPhoneArrayOfSelected(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      return found.phonesArray;
    }

    return [];
  }

  /**
   * Get Payment counts for Primary card
   * if selected then count is promary + selected counts
   * @param item DonorMergeItem
   * @returns number
   */
  getPaymentCount(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      return item.paymentCount + found.paymentCount;
    }

    return item.paymentCount;
  }

  /**
   * Get Pledges counts for Primary card
   * if selected then count is promary + selected counts
   * @param item DonorMergeItem
   * @returns number
   */
  getPledgesCount(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      return item.pledgesCount + found.pledgesCount;
    }

    return item.pledgesCount;
  }

  /**
   * Get Schedule counts for Primary card
   * if selected then count is promary + selected counts
   * @param item DonorMergeItem
   * @returns number
   */
  getScheduleCount(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      return item.scheduleCount + found.scheduleCount;
    }

    return item.scheduleCount;
  }

  /**
   * Get Wallet counts for Primary card
   * if selected then count is promary + selected counts
   * @param item DonorMergeItem
   * @returns number
   */
  getWalletCount(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      return item.walletsCount + found.walletsCount;
    }

    return item.walletsCount;
  }

  getSelectedCount(item: DonorMergeItem) {
    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );
    if (found) {
      return found.FromAccountIds.length;
    }
  }

  onProcess() {
    if (this.selectedList.length === 0) {
      return;
    }

    const reqParams = {
      Donors: this.selectedList,
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
    };

    this.isloading = true;
    this.donorService.saveMergeDonors(reqParams).subscribe(
      (res) => {
        this.isloading = false;
        if (res) {
          this.showMessageAndReload(res, false);
        }
      },
      (error) => {
        this.isloading = false;
        this.showMessageAndReload(error.error, true);
      }
    );
  }
  localUpadateDonaraccountID;
  openDonorCardPopup(accountID, donarID) {
    this.localUpadateDonaraccountID = donarID;
    this.isloading = false;
    if (accountID) {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup donor_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        DonorCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.AccountId = accountID;
      var objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: accountID,
      };

      this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
        this.isloading = false;
        modalRef.componentInstance.DonorCardData = res;
      });
    }
  }
  locallyUpdateDonar(item) {
    for (let index = 0; index < this.resMergeDonorsArray.length; index++) {
      const element = this.resMergeDonorsArray[index];
      if (
        this.localUpadateDonaraccountID == "accountId1" &&
        item[0].accountId == element.accountId1
      ) {
        this.resMergeDonorsArray[index].accountNum = item[0].accountNum;
        this.resMergeDonorsArray[index].fullName = item[0].fullName;
        this.resMergeDonorsArray[index].fullNameJewish = item[0].fullNameJewish;
        this.resMergeDonorsArray[index].address = item[0].address;
        this.resMergeDonorsArray[index].cityStateZip = item[0].cityStateZip;
        this.resMergeDonorsArray[index].phones = this.updatePhones(
          item[0].accountPhones
        );
        this.resMergeDonorsArray[index].emails = this.updateEmails(
          item[0].accountEmails
        );
        this.resMergeDonorsArray[index].phonesArray = this.extractFromString(
          this.resMergeDonorsArray[index].phones
        );
        this.resMergeDonorsArray[index].emailsArray = this.extractFromString(
          this.resMergeDonorsArray[index].emails
        );
      }
      if (
        this.localUpadateDonaraccountID == "accountId2" &&
        element.subCards &&
        element.subCards.length > 0
      ) {
        for (let i = 0; i < element.subCards.length; i++) {
          const e = element.subCards[i];
          if (e.accountId2 == item[0].accountId) {
            this.resMergeDonorsArray[index].subCards[i].fullName =
              item[0].fullName;
            this.resMergeDonorsArray[index].subCards[i].fullNameJewish =
              item[0].fullNameJewish;
            this.resMergeDonorsArray[index].subCards[i].address =
              item[0].address;
            this.resMergeDonorsArray[index].subCards[i].cityStateZip =
              item[0].cityStateZip;
            this.resMergeDonorsArray[index].subCards[i].phones =
              this.updatePhones(item[0].accountPhones);
            this.resMergeDonorsArray[index].subCards[i].emails =
              this.updateEmails(item[0].accountEmails);
            this.resMergeDonorsArray[index].subCards[i].phonesArray =
              this.extractFromString(
                this.resMergeDonorsArray[index].subCards[i].phones
              );
            this.resMergeDonorsArray[index].subCards[i].emailsArray =
              this.extractFromString(
                this.resMergeDonorsArray[index].subCards[i].emails
              );
          }
        }
      }
    }
    this.listGridData = this.resMergeDonorsArray;
  }
  updatePhones(accountPhones) {
    let newStr = "";
    if (accountPhones) {
      for (let index = 0; index < accountPhones.length; index++) {
        const element = accountPhones[index];
        newStr += element.phoneLabel + ":" + element.phoneNumber + ", ";
      }
    }
    return newStr;
  }
  updateEmails(accountEmails) {
    let newStr = "";
    if (accountEmails) {
      for (let index = 0; index < accountEmails.length; index++) {
        const element = accountEmails[index];
        newStr += element.emailLabels + ":" + element.emailAddress + ", ";
      }
    }
    return newStr;
  }
  newLocallyUpdateDonar(item) {
    for (let index = 0; index < this.newDonarResArray.length; index++) {
      const element = this.newDonarResArray[index];
      if (
        item[0].accountId == element.accountId1 &&
        item[0].accountNum == element.accountNum
      ) {
        this.newDonarResArray[index].accountNum = item[0].accountNum;
        this.newDonarResArray[index].fullName = item[0].fullName;
        this.newDonarResArray[index].fullNameJewish = item[0].fullNameJewish;
        this.newDonarResArray[index].address = item[0].address;
        this.newDonarResArray[index].cityStateZip = item[0].cityStateZip;
        this.newDonarResArray[index].phones = this.updatePhones(
          item[0].accountPhones
        );
        this.newDonarResArray[index].emails = this.updateEmails(
          item[0].accountEmails
        );
      } else if (
        item[0].accountId == element.accountId2 &&
        item[0].accountNum == element.accountNum
      ) {
        this.newDonarResArray[index].accountNum = item[0].accountNum;
        this.newDonarResArray[index].fullName = item[0].fullName;
        this.newDonarResArray[index].fullNameJewish = item[0].fullNameJewish;
        this.newDonarResArray[index].address = item[0].address;
        this.newDonarResArray[index].cityStateZip = item[0].cityStateZip;
        this.newDonarResArray[index].phones = this.updatePhones(
          item[0].accountPhones
        );
        this.newDonarResArray[index].emails = this.updateEmails(
          item[0].accountEmails
        );
      }
    }
    var res = this.newDonarResArray;
    res = res.map((o) => {
      let phoneArray = [];
      let emailArray = [];

      if (o.phones) {
        phoneArray = this.extractFromString(o.phones);
      }

      if (o.emails) {
        emailArray = this.extractFromString(o.emails);
      }

      return {
        ...o,
        phonesArray: phoneArray,
        emailsArray: emailArray,
      };
    });

    this.listData = _(res)
      .groupBy("group")
      .map((props) => ({
        ..._.find(props, (o) => {
          return o.accountId1 === o.accountId2;
        }),
        subCards: _.filter(props, (o) => {
          return o.accountId1 !== o.accountId2;
        }),
      }))
      .value();
    this.listGridData = this.listData;
    this.addSubCardId();
    this.selectedList = [];
    this.searchValue = "";
    if (this.itemDonarUpdate && this.eventDivIdDonarUpdate) {
      this.onUpdateSwapClick(this.itemDonarUpdate, this.eventDivIdDonarUpdate);
    }
  }

  onUpdateSwapClick(item: DonorMergeItem, eventDivIdUpdate) {
    let eventDivId = eventDivIdUpdate;
    setTimeout(() => {
      $(".remove-data").removeAttr("data"),
        $(".dynamicCls-" + eventDivId).attr("data", item.subCardId),
        10;
    });
    $("#" + eventDivId).removeClass("disabled-animation");
    this.dynamicSetclass = eventDivId;
    const { subCards, ...primeCard } = this.listGridData.find((o) => {
      return o.group === item.group;
    });
    const newPrimary = subCards.find((n) => {
      return n.accountId2 === item.accountId2;
    });

    const itemsNewSubcards = subCards.map((n) => {
      if (n.accountId2 === item.accountId2) {
        return {
          ...primeCard,
          accountId1: item.accountId2,
        };
      }
      return {
        ...n,
        accountId1: item.accountId2,
      };
    });

    const newItem: DonorMergeItem = {
      ...newPrimary,
      accountId1: item.accountId2,
      subCards: itemsNewSubcards,
    };

    this.listGridData = this.listGridData.map((lg) => {
      if (lg.group === newPrimary.group) {
        return newItem;
      }
      return lg;
    });

    this.listData = this.listData.map((ld) => {
      if (ld.group === newPrimary.group) {
        return newItem;
      }
      return ld;
    });

    const found = this.selectedList.find(
      (o) => o.ToAccountId === item.accountId1
    );

    if (found) {
      this.selectedList = this.selectedList.map((o) => {
        if (o.ToAccountId === item.accountId1) {
          /**
           * Add account Id into froms
           */
          const fromIds = o.FromAccountIds.map((fi) => {
            if (fi === item.accountId2) {
              return o.ToAccountId;
            }
            return fi;
          });

          return {
            ...o,
            FromAccountIds: fromIds,
            ToAccountId: item.accountId2,
          };
        }
        return o;
      });
    }
  }
  addSubCardId() {
    let result = this.listGridData.map((x) => {
      x.subCardId = 0;
      let subCards = x.subCards.map((element, index) => {
        element.subCardId = index + 1;
        return element;
      });
    });

    return this.listGridData;
  }
  addressAddSpace(addresses) {
    let spt = addresses.split(";");
    let valueString = "";
    for (let i = 0; i < spt.length; i++) {
      valueString += valueString ? ";" : "";
      const elementValue = spt[i];

      for (let j = 0; j < elementValue.length; j++) {
        const element = elementValue[j];
        let isNumber = parseInt(element);
        let iStr = valueString.substring(
          valueString.length - 2,
          valueString.length
        );
        let checkLastDig = valueString.substring(
          valueString.length - 1,
          valueString.length
        );
        if (
          !Number.isNaN(isNumber) &&
          iStr &&
          iStr === iStr.toUpperCase() &&
          Number.isNaN(parseInt(checkLastDig))
        ) {
          valueString += " ";
        }
        valueString += element;
      }
    }
    return valueString;
  }
}
