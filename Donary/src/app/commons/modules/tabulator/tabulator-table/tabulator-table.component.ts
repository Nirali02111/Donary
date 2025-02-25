import {
  Input,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
  Component,
  ElementRef,
  EventEmitter,
  SimpleChanges,
  AfterViewInit,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
  signal,
} from "@angular/core";
import {
  CellComponent,
  ColumnDefinition,
  RowComponent,
  TabulatorFull as Tabulator,
} from "tabulator-tables";
import { Options } from "tabulator-tables";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { distinctUntilChanged, pluck } from "rxjs/operators";
import { calculateColumnWidth } from "src/app/commons/util";
import { RowFormatterDirective } from "../directive/row-formatter.directive";
import { CustomHeaderFormatterComponent } from "../formatters/custom-header-formatter/custom-header-formatter.component";
import { CustomCellFormatterComponent } from "../formatters/custom-cell-formatter/custom-cell-formatter.component";
import {
  CellClickEvent,
  FilterQuery,
  FormatterType,
  LayoutOption,
} from "../interface";
import { TabulatorServiceService } from "../tabulator-service.service";
/**
 *
 *
 * https://github.com/David-Mawer/tabulator-angular-sample
 */
declare var $: any;
@Component({
  selector: "app-tabulator-table",
  templateUrl: "./tabulator-table.component.html",
  styleUrls: ["./tabulator-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TabulatorTableComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  table!: Tabulator;
  tableRendered = signal<boolean>(false);
  isMobileView = false;
  @Input() currentPage: number = null;
  @Input() currentPageSize: number = null;
  @Input() iscustomTable: boolean = false;
  @Input() search = "";
  @Output() pageChanged = new EventEmitter<number>();
  @Output() rowHeightChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<number>();
  @Input() tableData: any[] = [];
  @Input() columnNames: ColumnDefinition[] = [];
  @Input() currentRowHeightFromTable;
  @Input() updatedColumn: ColumnDefinition[] = [];
  @Input() isStandardReport: boolean = false;

  @Input() height: string = "311px";

  @Input() layoutOption: LayoutOption = "fitDataStretch";

  @Input() dataTree: boolean = false;
  @Input() hidePagination = false;
  @Input() dataTreeElementColumn: string | boolean = false;

  @Input() filterQuery: FilterQuery[] = [];
  @Input() isReasonList: boolean = false;
  @Input() selectedRows: string = "";
  @ViewChild("tabulatorElement", { static: true })
  tabulatorElement!: ElementRef;

  @ContentChild(RowFormatterDirective, { static: true })
  rowTemplateDir: TemplateRef<any>;

  @ContentChild(TemplateRef, { static: true }) rowTemplate: TemplateRef<any>;

  @Output() cellClick: EventEmitter<CellClickEvent> = new EventEmitter();

  @Output() rowSelectionChanged: EventEmitter<Array<any>> = new EventEmitter();
  @Output() toggleIsSelectPopup: EventEmitter<Array<any>> = new EventEmitter();
  initialColumns = true;
  maxColForFitColumns = 8;
  initialLoad: boolean = true;
  selectAllCheckBox: any;
  page: number;
  pageSize: number;
  currentPageRows: RowComponent[];
  allRowsSelectedOnPage: boolean = false;
  colWidths: { [field: string]: string | number }[];
  previouscurrentPageSize: number = null;
  previousCurrentPage: number = null;
  previouscurrentRowHeightFromTable: any;
  previousRowHeightFromTable: any;

  constructor(
    public commonMethodService: CommonMethodService,
    private tabulatorService: TabulatorServiceService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe(["(max-width: 767px)"])
      .pipe(pluck("matches"), distinctUntilChanged())
      .subscribe(this.showHideHost);
  }

  ngOnInit(): void {
    $("body").on("click", () => $(".focused-row")?.removeClass("focused-row"));
    $("body").on("contextmenu", () =>
      $(".focused-row")?.removeClass("focused-row")
    );
  }

  private showHideHost = (matches: boolean) => {
    this.isMobileView = matches;
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (this.currentPage && this.table) {
      if (this.currentPage != this.previousCurrentPage) {
        this.previousCurrentPage = this.currentPage;
        this.table
          .setPage(this.currentPage)
          .then(() => {})
          .catch((err) => {});
      }
    }
    if (this.currentPageSize && this.table) {
      if (this.previouscurrentPageSize != this.currentPageSize) {
        this.previouscurrentPageSize = this.currentPageSize;
        this.table.setPageSize(this.currentPageSize);
      }
    }

    if (this.table) {
      this.table.options.rowFormatter = (row) => {
        if (this.currentRowHeightFromTable) {
          this.previousRowHeightFromTable = this.currentRowHeightFromTable;
          if (
            this.previousRowHeightFromTable == this.currentRowHeightFromTable
          ) {
            const height = this.currentRowHeightFromTable;
            const cells = row.getCells();
            cells.forEach((cell) => {
              cell.getElement().style.height = `${height}px`;
            });
          }
        }
      };
      this.table.redraw();
    }

    let filterVisible = this.columnNames.filter((column) => column.visible);
    filterVisible.forEach(
      (col, i) => (col.resizable = i == filterVisible.length - 1 ? false : true)
    );
    this.runFastForEach();

    if (changes.search && !changes.search.firstChange && this.table) {
      if (!changes.search.currentValue) {
        this.table.clearFilter(false);
        return;
      }

      if (this.filterQuery.length === 0) {
        this.table.clearFilter(false);
      }

      if (this.filterQuery.length !== 0) {
        this.table.clearFilter(false);
        this.table.setFilter(this.searchFilter(changes.search.currentValue));

        const customFilterArrayWithSearch = this.filterQuery.filter((o) => {
          return o.isCustomFilter;
        });

        this.applyCustomFilter(customFilterArrayWithSearch);
        return;
      }

      this.table.setFilter(this.searchFilter(changes.search.currentValue));

      return;
    }

    if (changes.filterQuery && !changes.filterQuery.firstChange && this.table) {
      const customFilterArray: Array<FilterQuery> =
        changes.filterQuery.currentValue.filter((o) => {
          return o.isCustomFilter;
        });

      if (customFilterArray.length === 0) {
        this.table.clearFilter(false);
      }

      if (this.search) {
        this.table.setFilter(this.searchFilter(this.search));
      }

      this.applyCustomFilter(customFilterArray);
      return;
    }

    if (changes.columnNames?.firstChange) {
      this.colWidths = this.columnNames.map((col) => ({
        [col.field]: col.width,
      }));
    }

    if (!this.table) {
      this.initTable();
    } else {
      if (changes.selectedRows) {
        if (changes.selectedRows.currentValue == "selectPage")
          this.toggleCurrentPageRows(true);
        else if (changes.selectedRows.currentValue == "selectAll")
          this.table.selectRow();
      }

      if (changes.columnNames) {
        this.table.setColumns(this.columnNames);
        this.resetTable();
      }

      if (changes.updatedColumn) {
        changes.updatedColumn.currentValue.forEach((element) => {
          let visibility = element.visible;
          let fieldValue = element.field;
          visibility
            ? this.table.showColumn(fieldValue)
            : this.table.hideColumn(fieldValue);
        });
        this.resetTable();
      }

      if (changes.tableData) {
        if (changes.tableData.currentValue && this.tableData.length > 0) {
          this.tableData = this.removeChildEmptyArray(this.tableData);
          setTimeout(() => {
            this.table
              ?.setData(this.tableData)
              .then(() => this.table.redraw(true));
          }, 0);
          if (!this.initialLoad) this.table.destroy();
          this.initialLoad = false;
          this.initTable();
        }
      }
    }
    setTimeout(() => this.table.redraw(true), 0);
  }

  resetTable() {
    let visibleCols = this.columnNames.filter((col) => col.visible).length;
    let currentLayout = this.table.options.layout;
    if (
      (visibleCols >= this.maxColForFitColumns &&
        currentLayout == "fitColumns") ||
      (visibleCols <= this.maxColForFitColumns &&
        currentLayout == "fitDataStretch")
    ) {
      this.table.destroy();
      this.initTable();
    }
  }

  runFastForEach() {
    this.fastForEach(this.columnNames, (colConfigEntry) => {
      if (!colConfigEntry.titleFormatter) {
        colConfigEntry.titleFormatter = (column) => {
          return this.headerCell(column);
        };
      }

      if (!colConfigEntry.cellClick) {
        colConfigEntry.cellClick = (e, cell) => {
          this.onCellClick(e, cell);
        };
      }

      if (!colConfigEntry.cellContext) {
        colConfigEntry.cellContext = (e, cell) => this.onContextMenu(e, cell);
      }
      if (
        colConfigEntry.formatter &&
        (colConfigEntry.formatter as FormatterType) === "customComponent"
      ) {
        colConfigEntry.formatter = (cell, formatterParams, onRendered) => {
          const hasPhoneNumberField = this.columnNames.some(
            (column) => column.field === "Phone number"
          );
          const hasEmailField = this.columnNames.some(
            (column) => column.field == "Email Address"
          );
          const hasAddressField = this.columnNames.some(
            (column) => column.field === "Address"
          );
          if (hasPhoneNumberField && this.isStandardReport) {
            const phoneData = cell.getValue();
            if (Array.isArray(phoneData) && phoneData.length > 0) {
              const formattedPhoneData = phoneData
                .map((phone) => {
                  return `${phone.labelName}:${phone.labelValue}`;
                })
                .join("<br/>");
              return `<div style="text-align: left;">${formattedPhoneData}</div>`;
            }
            return null;
          }
          if (hasEmailField && this.isStandardReport) {
            const emailData = cell.getValue();
            if (Array.isArray(emailData) && emailData.length > 0) {
              const formattedEmailData = emailData
                .map((email) => {
                  return `${email.labelName}:${email.labelValue}`;
                })
                .join("<br/>");
              return `<div style="text-align: left;">${formattedEmailData}</div>`;
            }
            return null;
          }
          if (hasAddressField && this.isStandardReport) {
            const data = cell.getValue();
            if (Array.isArray(data) && data.length > 0) {
              const formattedAddressData = data
                .map((address) => {
                  return `${address.labelName}:${address.labelValue}`;
                })
                .join("<br/>");
              return `<div style="text-align: left;">${formattedAddressData}</div>`;
            }
            return null;
          }
          return this.rowCell(cell, formatterParams, onRendered);
        };
      }
    });
  }

  ngAfterViewInit(): void {
    // this.initTable();
    this.setupRowFormatter();
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  setColWidth() {
    this.columnNames
      .filter((col) => col.visible)
      .forEach((col: ColumnDefinition, i) => {
        col.width = calculateColumnWidth(this.tableData, col.title, col.field);
      });
  }

  resetColWidth() {
    this.columnNames.forEach((col) => {
      if (col.field != undefined) col.width = undefined;
    });
  }

  private initTable() {
    let visibleCols = this.columnNames.filter((col) => col.visible).length;
    this.columnNames.length > 0 && visibleCols >= this.maxColForFitColumns
      ? this.setColWidth()
      : this.resetColWidth();
    this.layoutOption =
      visibleCols >= this.maxColForFitColumns ? "fitDataStretch" : "fitColumns";

    if (
      this.columnNames.find((col) => col.field == "reasonName") &&
      Object(this.tableData?.[0])?.hasOwnProperty("reasonNameJewish")
    ) {
      this.tableData = this.tableData?.map((data) => ({
        ...data,
        reasonName: {
          reasonName: data.reasonName,
          jewishName: data.reasonNameJewish,
        },
      }));
    }

    const options: Options = {
      data: this.removeChildEmptyArray(this.tableData),
      columns: this.columnNames,
      autoResize: false,
      // autoColumns: true,
      resizableColumnFit: true,
      reactiveData: true,
      addRowPos: "bottom",
      pagination: true,
      paginationSize: 25,
      paginationSizeSelector: [25, 50, 100],
      paginationCounter: "rows",
      movableColumns: true,
      resizableRows: true,
      // renderHorizontal: "virtual",
      renderVertical: "virtual",
      // height: this.height,
      layout: this.layoutOption,
      layoutColumnsOnNewData: true,
      dataTree: this.dataTree,
      dataTreeChildField: "children",
      placeholder: "No Data Available...",
    };

    if (this.dataTreeElementColumn) {
      options.dataTreeElementColumn = this.dataTreeElementColumn;
      options.dataTreeBranchElement = false;
      options.dataTreeCollapseElement =
        '<span class="h_arrow h_arrow_rotate"></span>';
      options.dataTreeExpandElement = '<span class="h_arrow"></span>';
    }

    this.table = new Tabulator(this.tabulatorElement.nativeElement, options);
    this.tableRendered.set(false);
    this.table.on("rowSelectionChanged", (data, rows) => {
      this.rowSelectionChanged.emit(data || []);

      if (this.isReasonList) {
        this.setSelectedRowsDetails();
        if (this.allRowsSelectedOnPage)
          this.selectAllCheckBox?.addClass("tabulator-reasons-select-all");
        else
          this.selectAllCheckBox?.removeClass("tabulator-reasons-select-all");
      }
    });

    this.table.on("pageSizeChanged", (res) => {
      this.pageSizeChanged.emit(res);
    });

    this.table.on("pageLoaded", (pageno) => {
      this.pageChanged.emit(pageno);
    });

    this.table.on("tableBuilt", () => {
      const defaultRowHeight = this.getDefaultRowHeight();
      this.rowHeightChanged.emit(defaultRowHeight);
    });

    this.table.on("renderComplete", () => {
      if (this.iscustomTable) {
        const defaultRowHeight = this.getDefaultRowHeight();
        this.rowHeightChanged.emit(defaultRowHeight);
      }
      this.tableRendered.set(true);
      this.handleSelectAllCheckbox();
      const paginationElement = document.querySelector(".tabulator-footer");
      if (paginationElement instanceof HTMLElement && this.hidePagination) {
        paginationElement.style.display = "none";
      }
    });

    if (this.isReasonList)
      this.table.on("renderStarted", () =>
        this.selectAllCheckBox?.off("click.selectAll")
      );

    setTimeout(() => {
      this.table.setColumns(this.columnNames);
      let padding = 30;
      this.table.on("dataTreeRowExpanded", (row, level) => {
        this.addStylingToExpandedRows(row.getElement());
        const rows = document.querySelectorAll(".tabulator-row");
        rows.forEach((row) => {
          row.classList.forEach((className) => {
            if (className.startsWith("tabulator-tree-level-")) {
              const level = parseInt(className.split("-").pop(), 10);
              const targetElement = row.childNodes[2];
              if (targetElement) {
                (targetElement as HTMLElement).style.paddingLeft = `${
                  level * padding
                }px`;
              }
            }
          });
        });
      });

      this.table.on("dataTreeRowCollapsed", (row, level) => {
        this.addStylingToExpandedRows(row.getElement());
        $(row.getElement().childNodes.item(2)).css(
          "padding-left",
          level * padding + "px"
        );
      });
    }, 0);
  }

  toggleCurrentPageRows(select: boolean) {
    this.currentPageRows.forEach((row) => {
      select ? row.select() : row.deselect();
    });
  }

  getDefaultRowHeight(): number {
    const firstRow = this.table.getRows()[0];
    if (firstRow) {
      const rowElement = firstRow.getElement();
      return rowElement ? rowElement.clientHeight : 0;
    }
    return 0;
  }
  addStylingToExpandedRows(row: HTMLElement) {
    let nextEle = row.nextSibling as HTMLElement;
    let isNextParentElement = nextEle.classList.contains(
      "tabulator-tree-level-0"
    );
    let isCurrentParentElement = row.classList.contains(
      "tabulator-tree-level-0"
    );
    row.classList.add("table-shadow");

    if (!isNextParentElement) row.classList.remove("table-shadow-last");
    if (isCurrentParentElement && !isNextParentElement)
      row.classList.add("table-shadow-frist");
    if (isNextParentElement && !isCurrentParentElement)
      row.classList.add("table-shadow-last");
    if (!isNextParentElement)
      this.addStylingToExpandedRows(row.nextSibling as HTMLElement);
    if (isCurrentParentElement && isNextParentElement)
      row.classList.remove("table-shadow-frist", "table-shadow");
  }

  private headerCell(column) {
    const { componentRef, domElem } = this.tabulatorService.createComponent(
      CustomHeaderFormatterComponent
    );
    (componentRef.instance as any).cell = column;
    column.getElement().appendChild(domElem);
    return domElem;
  }

  private rowCell(cell, formatterParams, onRendered) {
    const { componentRef, domElem } = this.tabulatorService.createComponent(
      CustomCellFormatterComponent
    );
    (componentRef.instance as any).cell = cell;
    (componentRef.instance as any).formatterParams = formatterParams;
    cell.getElement().appendChild(domElem);
    return domElem;
  }

  setupRowFormatter() {
    if (!this.isMobileView) {
      return;
    }

    this.table.options.columns = [];
    this.table.options.rowFormatter = (row) => {
      this.rowFormatter(row);
    };
  }

  private rowFormatter(row) {
    row.getElement().innerHTML = "";
    const view = this.rowTemplate.createEmbeddedView({
      $implicit: { rowData: row.getData() },
    });

    view.detectChanges();

    row.getElement().appendChild(view.rootNodes[0]);

    view.detectChanges();
  }

  private onContextMenu(e, cell: CellComponent) {
    setTimeout(
      () => cell.getRow().getElement().classList.add("focused-row"),
      0
    );
  }

  private onCellClick(e, cell: CellComponent) {
    /**
     * Row selection
     */
    if (this.dataTree && cell.getColumn().getDefinition().field != "campaign") {
      let row = cell.getRow();
      if (row.isTreeExpanded()) row.treeCollapse();
      else row.treeExpand();
    }

    setTimeout(
      () => cell.getRow().getElement().classList.add("focused-row"),
      0
    );

    if (cell.getColumn().getDefinition().formatter === "rowSelection") {
      cell.getRow().toggleSelect();
      return;
    }

    this.cellClick.emit({
      field: cell.getColumn().getDefinition().field,
      rowData: cell.getRow().getData(),
    });
  }

  /**
   * Manage both search by column and Filter Query
   *
   *
   */

  private applyCustomFilter(customFilterArray: Array<FilterQuery> = []) {
    for (let index = 0; index < customFilterArray.length; index++) {
      const element = customFilterArray[index];
      this.table.setFilter(
        (data, filterParams) => {
          return data[filterParams.dataKey] == filterParams.filterValue;
        },
        {
          dataKey: element.dataKey,
          filterValue: element.filterValue,
        }
      );
    }
  }

  /**
   *
   */
  private searchFilter(value: string) {
    const filter = this.columnNames.map((o) => {
      return {
        field: o.field,
        type: "like",
        value: value,
      };
    });

    return [filter];
  }

  downloadPDF() {
    this.table.download(
      "pdf",
      "table.pdf",
      {
        autoTable: {
          horizontalPageBreak: true,
        },
      },

      "all"
    );
  }

  downLoadExcel(filename = "table") {
    if (filename.indexOf(".xlsx") === -1) {
      filename = `${filename}.xlsx`;
    }
    this.table.download("xlsx", filename, { sheetName: "data" });
  }

  private fastForEach<T>(
    inArr: T[],
    execFunc: (element: T, i: number) => void
  ): void {
    let i = 0;

    while (i < inArr.length) {
      execFunc(inArr[i], i);
      i++;
    }
  }

  removeChildEmptyArray(data: Array<any>) {
    return (data || []).map((o) => {
      if (o) {
        return {
          ...o,
          children:
            o.children && o.children.length !== 0
              ? this.removeChildEmptyArray(o.children)
              : null,
        };
      }
    });
  }

  printReport() {
    this.table.redraw(true);
    this.table.print("all", true);
  }

  setSelectedRowsDetails() {
    this.page = this.table.getPage() as number;
    this.pageSize = this.table.getPageSize();
    this.currentPageRows = this.table
      .getRows()
      .slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    this.allRowsSelectedOnPage = this.currentPageRows.every((row) =>
      row.isSelected()
    );
  }

  handleSelectAllCheckbox() {
    if (this.isReasonList) {
      this.selectAllCheckBox = $('.tabulator-headers input[type="checkbox"]');
      this.setSelectedRowsDetails();
      if (this.allRowsSelectedOnPage && this.tableData?.length > 0)
        this.selectAllCheckBox?.addClass("tabulator-reasons-select-all");
      else this.selectAllCheckBox?.removeClass("tabulator-reasons-select-all");

      this.selectAllCheckBox?.on("click.selectAll", (event) => {
        if (this.selectAllCheckBox?.prop("checked")) {
          if (this.allRowsSelectedOnPage) this.toggleCurrentPageRows(false);
          else {
            let rowsOnPageCount = this.currentPageRows.length;
            this.selectedRows = "";
            this.toggleIsSelectPopup.emit([rowsOnPageCount]);
          }
          event.preventDefault();
        }
      });
    }
  }
}
