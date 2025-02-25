import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
  name: "join_and_uppercase",
  standalone: false,
})
export class JoinAndUpperCasePipe implements PipeTransform {
  transform(value: string): string {
    return `${value?.split(" ").join("").toUpperCase()}`;
  }
}
