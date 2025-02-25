import { Component, OnInit, Input } from "@angular/core";
import { CommonMethodService } from "./../../../common-methods.service";

@Component({
  selector: "app-donor-dropdown-list",
  templateUrl: "./donor-dropdown-list.component.html",
  standalone: false,
  styleUrls: ["./donor-dropdown-list.component.scss"],
})
export class DonorDropdownListComponent implements OnInit {
  @Input("isSearchable") isSearchable: boolean = false;

  constructor(public commonMethodService: CommonMethodService) {}

  ngOnInit() {}

  settings() {
    return this.commonMethodService.setDropDownSettings(
      "Select Donor",
      2,
      true,
      false,
      this.isSearchable
    );
  }
}
