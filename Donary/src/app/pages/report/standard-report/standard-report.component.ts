import {
  Component,
  signal,
  computed,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DynamicGridReportService } from "src/app/services/dynamic-grid-report.service";
import * as _ from "lodash";
import {
  StandardReportObj,
  Sections,
} from "src/app/models/report-query-sections.model";
import { AnalyticsService } from "src/app/services/analytics.service";

@Component({
  selector: "app-standard-report",
  standalone: true,
  imports: [NgbModule, NgSelectModule, FormsModule, CommonModule],
  templateUrl: "./standard-report.component.html",
  styleUrl: "./standard-report.component.scss",
})
export class StandardReportComponent implements OnInit {
  @ViewChild("header", { static: false }) headerRef: ElementRef;
  @ViewChild("collapseshow", { static: false }) collapseshow: ElementRef;
  activeId = 1;
  selectedReport: any;
  selectedGroup = signal<number | string>("Donor");
  reportList = signal<Array<StandardReportObj>>([]);
  groupNames: Sections[] = [];
  donorsReportList = computed(() => {
    const group = this.selectedGroup();
    return _.sortBy(
      this.reportList().filter((o) => o.sectionID == group),
      ["reportSort"]
    );
  });
  allDyanamicReportList: any;
  reportType: string = "custom";

  getIndex(sectionID) {
    return this.groupNames.findIndex((group) => group.sectionID === sectionID);
  }
  private analytics = inject(AnalyticsService);

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private localstoragedataService: LocalstoragedataService,
    private dynamicGridReportService: DynamicGridReportService
  ) {}

  ngOnInit(): void {
    this.analytics.visitedStandardReports();
    this.getReportSections();
    this.getAllDynamicReport();
  }

  getReportSections() {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.dynamicGridReportService
      .getReportGroups(eventGuId, this.reportType)
      .subscribe(
        (data: Sections[]) => {
          if (data && data.length > 0) {
            this.groupNames = data;
          }
        },
        (err) => {}
      );
  }

  getAllDynamicReport() {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.dynamicGridReportService
      .getAllDynamicGridReport(eventGuId, this.reportType)
      .subscribe(
        (res: StandardReportObj[]) => {
          if (res && res.length > 0) {
            this.allDyanamicReportList = res.map((element) => {
              let obj = {
                id: element.reportId,
                itemName: element.reportName,
              };
              return obj;
            });
            const updatedReports = res.map((report) => {
              if (!report.sectionID) {
                return { ...report, sectionID: "-1" };
              }
              return report;
            });
            this.reportList.set(updatedReports);
          }
        },
        (error) => {}
      );
  }

  OpenReport(reportId, autoRun) {
    this.dynamicGridReportService.setAutoRun(autoRun);
    this.router.navigate(["/report", reportId]);
  }

  setSelectedGroup(sectionId: string | number) {
    this.selectedGroup.set(sectionId);
    const allHeaderElements = document.querySelectorAll(".accordion-header");
    allHeaderElements.forEach((element) => {
      element.classList.add("collapsed");
    });
    const headerElement = document.getElementById(sectionId.toString());
    if (headerElement) {
      headerElement.classList.remove("collapsed");
    }
    const index = this.getIndex(sectionId);
    const collapseshowElementId = `collapsed-${index + 1}`;
    const collapseshowElement = document.getElementById(collapseshowElementId);
    const allCollapseshowElements =
      document.querySelectorAll('[id^="collapsed-"]');
    allCollapseshowElements.forEach((element) => {
      element.classList.remove("show");
    });
    if (collapseshowElement) {
      collapseshowElement.classList.add("show");
    }
  }
}
