import { Options } from "@angular-slider/ngx-slider";
import { ColumnDefinition, Formatter } from "tabulator-tables";

export interface CellClickEvent {
  field: string;
  rowData: any;
}

export type CustomFormatterParamsType = "currency" | "address" | 'date_short' | 'date_long' | 'phone' | 'campaignTree'


export type LayoutOption = "fitData" | "fitColumns" | "fitDataFill" | "fitDataStretch" | "fitDataTable"


export type CustomFormatterParams = {
  type: CustomFormatterParamsType
};

export type CustomType = "customComponent";

export type FormatterType = Formatter | CustomType;

export interface ColumnDefinitionType extends Omit<ColumnDefinition, 'formatter' | 'columns' >  {
  formatter?: FormatterType,
  columns?: Array<ColumnDefinitionType>
  isTotalPanel?: boolean
}

export interface OptionsType extends Omit<Options, 'columns'>  {
  columns?: Array<ColumnDefinitionType>
}

export interface FilterQuery {
  isCustomFilter: boolean;
  dataKey?: string,
  filterValue?: any
}
