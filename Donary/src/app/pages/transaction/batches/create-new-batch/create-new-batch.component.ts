import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { BatchService } from "src/app/services/batch.service";

@Component({
  selector: "app-create-new-batch",
  templateUrl: "./create-new-batch.component.html",
  standalone: false,
  styleUrls: ["./create-new-batch.component.scss"],
})
export class CreateNewBatchComponent implements OnInit {
  isNewBatch: boolean = true;
  batchNumbersList = [];
  @Output() emtOutputRoomAdded: EventEmitter<any> = new EventEmitter();
  constructor(
    private localstoragedataService: LocalstoragedataService,
    private batchService: BatchService
  ) {}

  ngOnInit() {
    this.getBatchNumbers();
  }

  backToBatchList() {
    this.isNewBatch = false;
    this.emtOutputRoomAdded.emit(true);
  }

  getBatchNumbers() {
    let eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.batchService.getBatchNumbers(eventGuid).subscribe((res: any) => {
      if (res && res.length !== 0) {
        this.batchNumbersList = res;
      }
    });
  }
}
