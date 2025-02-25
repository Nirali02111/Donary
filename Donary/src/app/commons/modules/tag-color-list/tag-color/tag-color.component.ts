import { Component, OnInit, forwardRef, Provider } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

const TAG_COLOR_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TagColorComponent),
  multi: true,
};

@Component({
  selector: "app-tag-color",
  templateUrl: "./tag-color.component.html",
  styleUrls: ["./tag-color.component.scss"],
  providers: [TAG_COLOR_CONTROL_VALUE_ACCESSOR],
  standalone: false,
})
export class TagColorComponent implements ControlValueAccessor {
  isOpen: boolean = false;
  colors = [
    { code: "red", name: "Red" },
    { code: "orange", name: "Orange" },
    { code: "purple", name: "Purple" },
    { code: "blue", name: "Blue" },
    { code: "green", name: "Green" },
  ];
  selected!: string;
  disabled = false;
  private onTouched!: Function;
  private onChanged!: Function;

  selectColor(code: string) {
    this.onTouched();
    this.selected = code;
    this.onChanged(code);
    this.isOpen = false;
  }

  writeValue(value: string): void {
    this.selected = value ? value : "red";
  }
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  openDropdown() {
    this.isOpen = true;
  }

  displayTagColorName() {
    const obj = this.colors.find((o) => o.code === this.selected);
    return obj.name;
  }
}
