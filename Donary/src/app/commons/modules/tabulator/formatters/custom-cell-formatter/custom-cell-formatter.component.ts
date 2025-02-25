import { Component, Input, OnInit } from "@angular/core";
import { CustomFormatterParams } from "../../interface";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";

@Component({
  selector: "[app-custom-cell-formatter]",
  templateUrl: "./custom-cell-formatter.component.html",
  styleUrls: ["./custom-cell-formatter.component.scss"],
  standalone: false,
})
export class CustomCellFormatterComponent implements OnInit {
  @Input() cell: any;

  @Input() formatterParams: CustomFormatterParams;

  constructor(
    public datePipe: DonaryDateFormatPipe,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {}

  get isCurrency() {
    return this.formatterParams.type === "currency";
  }

  get isDateShort() {
    return this.formatterParams.type === "date_short";
  }

  get isDateLong() {
    return this.formatterParams.type === "date_long";
  }

  get isAddress() {
    return this.formatterParams.type === "address";
  }

  get isPhone() {
    return this.formatterParams.type === "phone";
  }

  get isCampaignTree() {
    return this.formatterParams.type === "campaignTree";
  }

  get isOther() {
    return (
      !this.isCurrency &&
      !this.isDateShort &&
      !this.isDateLong &&
      !this.isAddress &&
      !this.isPhone
    );
  }
}
