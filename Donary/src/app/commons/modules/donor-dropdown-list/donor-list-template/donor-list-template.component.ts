import { Component, Input, OnInit } from "@angular/core";
import { CommonMethodService } from "src/app/commons/common-methods.service";

@Component({
  selector: "app-donor-list-template",
  templateUrl: "./donor-list-template.component.html",
  standalone: false,
  styleUrls: ["./donor-list-template.component.scss"],
})
export class DonorListTemplateComponent implements OnInit {
  phoneList: Array<{ label: string; phone: string }> = [];

  @Input("donorObj") donorObj: any = {};
  constructor(public commonMethodService: CommonMethodService) {}

  ngOnInit() {
    this.displayPhoneList();
  }

  displayName() {
    return this.donorObj.fullNameJewish;
  }

  displayEngName() {
    return this.donorObj.fullName;
  }

  displayAccountInfo() {
    if (this.donorObj.accountNum != null) {
      return `#${this.donorObj.accountNum}`;
    }

    return "";
  }

  displayFather() {
    if (this.donorObj.father != null) {
      return `${this.donorObj.father} / `;
    }

    return "";
  }

  displayPhoneList() {
    if (this.donorObj.phonenumbers && this.donorObj.phoneLabels) {
      if (
        this.donorObj.phoneLabels &&
        this.donorObj.phoneLabels.indexOf(",") > -1
      ) {
        let lblArray = this.donorObj.phoneLabels.split(",");
        let phoneNoArray = this.donorObj.phonenumbers.split(",");

        for (let k = 0; k < lblArray.length && k < 2; k++) {
          this.phoneList.push({
            label: lblArray[k].trim().charAt(0),
            phone: this.commonMethodService.formatPhoneNumber(phoneNoArray[k]),
          });
        }
      }
    }
  }
}
