import { Injectable } from "@angular/core";
import * as _ from "lodash";

interface GridDataObj {
  paymentId?: number | string;
  phoneNumbers: any;
  emailAddresses: any;
  phoneNumberList: any;
  phoneLabels: any;
  smsSentList: any;
}

@Injectable({
  providedIn: "root",
})
export class AdvanceSMSActionService {
  constructor() {}

  private moveArrayValue(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }

  private orderColumns(columnslst: Array<string>): Array<string> {
    let columnslstArry: Array<string> = [...columnslst];

    let cellIndex = columnslstArry.findIndex(
      (obj) => obj.toLowerCase() === "cell"
    );

    if (cellIndex !== -1) {
      columnslstArry = this.moveArrayValue(columnslstArry, cellIndex, 0);
    }

    cellIndex = columnslstArry.findIndex((obj) => obj.toLowerCase() === "cell");
    let mobileIndex = columnslstArry.findIndex(
      (obj) => obj.toLowerCase() === "mobile"
    );

    if (cellIndex !== -1 && mobileIndex !== -1) {
      columnslstArry = this.moveArrayValue(columnslstArry, mobileIndex, 1);
    } else if (cellIndex === -1 && mobileIndex !== -1) {
      columnslstArry = this.moveArrayValue(columnslstArry, mobileIndex, 0);
    }

    cellIndex = columnslstArry.findIndex((obj) => obj.toLowerCase() === "cell");
    mobileIndex = columnslstArry.findIndex(
      (obj) => obj.toLowerCase() === "mobile"
    );
    let homeIndex = columnslstArry.findIndex(
      (obj) => obj.toLowerCase() === "home"
    );

    if (cellIndex !== -1 && mobileIndex !== -1 && homeIndex !== -1) {
      columnslstArry = this.moveArrayValue(columnslstArry, homeIndex, 2);
    } else if (
      (cellIndex === -1 && mobileIndex !== -1 && homeIndex !== -1) ||
      (cellIndex !== -1 && mobileIndex === -1 && homeIndex !== -1)
    ) {
      columnslstArry = this.moveArrayValue(columnslstArry, homeIndex, 1);
    } else if (cellIndex === -1 && mobileIndex === -1 && homeIndex !== -1) {
      columnslstArry = this.moveArrayValue(columnslstArry, homeIndex, 0);
    }

    return columnslstArry;
  }

  getValidLabelAndNumber(label: string, value, sent) {
    if (
      label.toLowerCase() == "home" ||
      label.toLowerCase() == "cell" ||
      label.toLowerCase() == "mobile"
    ) {
      if (label.toLowerCase() == "home") {
        return {
          label: "Home",
          value: value,
          originalLabel:"Home",
          sent,
        };
      }
      else if (label.toLowerCase() == "mobile") {
        return {
          label: "Mobile",
          value: value,
          originalLabel:"Mobile",
          sent,
        };
      }
      else {
        return {
          label: "Cell",
          value: value,
          originalLabel:"Cell",
          sent,
        };
      }
    } else {
      return {
        label: "Other",
        value: value,
        originalLabel:label,
        sent,
      };
    }
  }

  getAdvanceSMSReceiptActionListObj(
    recordSelectedArray: Array<number>,
    gridFilterData: Array<GridDataObj>
  ) {
    var resultArray = [];

    let columnslst: Set<string> = new Set();

    for (const item of recordSelectedArray) {
      var donorDetails = gridFilterData.find((x) => x.paymentId == item);

      if (donorDetails) {
        let {
          phoneNumbers,
          emailAddresses,
          phoneNumberList,
          phoneLabels,
          smsSentList,
          ...restdonorDetails
        } = donorDetails;

        let rowColumn = [];

        if (phoneLabels) {
          if (phoneLabels.indexOf(",") > -1) {
            const phoneLabelArray = phoneLabels.split(", ");

            rowColumn = phoneLabelArray.map((v, index) => {
              return this.getValidLabelAndNumber(
                v,
                phoneNumberList[index],
                smsSentList ? smsSentList[index] : null
              );
            });
          } else {
            rowColumn = [
              {
                ...this.getValidLabelAndNumber(
                  phoneLabels,
                  phoneNumberList,
                  smsSentList ? smsSentList : null
                ),
              },
            ];
          }
        }

        const grpCl = _(rowColumn)
          .chain()
          .groupBy("label")
          .map((value, key) => {
            columnslst.add(key);

            return {
              label: key,
              list: _.uniq(_.flatMap(_.map(value, (p) => p.value))),
            };
          })
          .value();

        const newDonotRcd = {
          ...donorDetails,
          column: rowColumn,
        };

        resultArray.push(newDonotRcd);
      }
    }

    let dd = _(resultArray)
      .chain()
      .groupBy((p) => p.receiptNum)
      .map((props) => ({
        ..._.head(props),
        paymentIds: _.map(props, (p) => p.paymentId),
        columns: _(_.uniq(_.flatMap(_.map(props, (p) => p.column))))
          .chain()
          .groupBy("label")
          .map((value, key) => ({
            label: key,
            list: _.uniq(_.flatMap(_.map(value, (p) => p.value))),
            selectedChild: 0,
            // sentList: _.uniq(_.flatMap(_.map(value, (p) => p.sent))),
            sentList: _.flatMap(_.map(value, (p) => p.sent)),
            originalLabelList: _.flatMap(_.map(value, (p) => p.originalLabel)),
          }))
          .value(),
      }))
      .value();

    const arrayListFnl = [];

    let columnslstArry = this.orderColumns([...columnslst]);

    const tmpCollection = columnslstArry.map((o) => ({
      label: o,
      list: [],
      sentList: [],
      originalLabelList:[],
      }));

    for (let index = 0; index < dd.length; index++) {
      const element = dd[index];

      const finlElm = {
        ...element,
        columns: _.unionBy(element.columns, tmpCollection, "label"),
      };
      arrayListFnl.push(finlElm);
    }

    return {
      columns: [...columnslstArry],
      list: [...arrayListFnl],
    };
  }
}
