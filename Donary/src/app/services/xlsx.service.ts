import { Injectable } from '@angular/core';
import * as FileSaver from "file-saver";
import * as moment from 'moment';
import * as XLSX from "xlsx";
import { LocalstoragedataService } from '../commons/local-storage-data.service';

@Injectable({ providedIn: 'root'})
export class XLSXService {

    constructor(private localStorageDataService: LocalstoragedataService) {}

    getFilename(name: string): string {

        const eventCurrency = this.localStorageDataService.getUserEventCurrency();
        const fileFormat = eventCurrency === "USD" ? "YYYY-MM-DDTHH:mm" : "YYYY-MM-DDTHH:mm"
        
        let filename = `${name}_${moment(new Date()).format(fileFormat)}.xlsx`;
        filename = filename.trim();
        filename = filename.replace(/ /g, "_");
        return filename
    }

    generate(name: string, data: any) {
        let filename = this.getFilename(name);

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, { cellStyles: true });
        var range = XLSX.utils.decode_range(worksheet['!ref']);
        for (var C = range.s.r; C <= range.e.r; ++C) {
            var address = XLSX.utils.encode_col(C) + "1"; // <-- first row, column number C
            if (!worksheet[address]) continue;
            worksheet[address].s = { bold: true };
        }

        const workbook: XLSX.WorkBook = {
            Sheets: { data: worksheet },
            SheetNames: ["data"]
        };

        const excelBuffer: any = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
            cellStyles: true
        });

        const excelData: Blob = new Blob([excelBuffer], {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
        });
        FileSaver.saveAs(excelData, filename);
    }
}