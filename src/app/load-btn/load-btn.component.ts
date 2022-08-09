import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-load-btn",
  templateUrl: "./load-btn.component.html",
  styleUrls: ["./load-btn.component.css"],
})
export class LoadBtnComponent {
  @Input() isFilled: boolean;
  @Input() btnHtml: any[];
  @Output() ldBtn = new EventEmitter();

  buttonClicked() {
    if (this.isFilled) {
      this.ldBtn.emit();
    }
  }
}
