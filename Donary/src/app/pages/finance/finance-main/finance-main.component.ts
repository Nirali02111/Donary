import { Component, inject, OnInit } from "@angular/core";
import { environment } from "./../../../../environments/environment";
import { AnalyticsService } from "src/app/services/analytics.service";

@Component({
  selector: "app-finance-main",
  templateUrl: "./finance-main.component.html",
  standalone: false,
  styleUrls: ["./finance-main.component.scss"],
})
export class FinanceMainComponent implements OnInit {
  isDevEnv: boolean;
  isProdEnv: boolean;
  private analytics = inject(AnalyticsService);

  constructor() {}

  ngOnInit() {
    this.analytics.visitedFinance();
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    this.isProdEnv = environment.baseUrl.includes("https://webapi.donary.com/");
  }
}
