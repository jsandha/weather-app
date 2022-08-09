import { take } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Component, HostListener } from "@angular/core";
import { WeatherService } from "app/weather.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CountryList } from "app/modals/countryList";
import { Subscription } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-zipcode-entry",
  templateUrl: "./zipcode-entry.component.html",
  styleUrls: ["./zipcode-entry.component.css"],
})
export class ZipcodeEntryComponent {
  countryList: CountryList[];
  filteredList: CountryList[];
  isCountrySelected = false;
  btnArray = [
    ["Add Location", "btn-primary"],
    ["Loading...", "btn-primary"],
    ["Done", "btn-success"],
  ];
  btnHtmlContent;
  btnClicked = false;
  subscription = new Subscription();
  constructor(
    private weatherService: WeatherService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    this.btnHtmlContent = [
      this.sanitizer.bypassSecurityTrustHtml(this.btnArray[0][0]),
      this.btnArray[0][1],
    ];
    this.subscription = this.weatherService.buttonUpdate$.subscribe((val) => {
      // button transition delay from status done to Add Location

      if (val) {
        this.btnHtmlContent = [
          this.sanitizer.bypassSecurityTrustHtml(this.btnArray[2][0]),
          this.btnArray[2][1],
        ]; // for resetting to add location
        setTimeout(() => {
          this.btnHtmlContent = [
            this.sanitizer.bypassSecurityTrustHtml(this.btnArray[0][0]),
            this.btnArray[0][1],
          ]; // for resetting to add location
        }, 500);
      } else
        this.btnHtmlContent = [
          this.sanitizer.bypassSecurityTrustHtml(this.btnArray[0][0]),
          this.btnArray[0][1],
        ];
    });
    this.http
      .get("assets/country.list.json")
      .pipe(take(1))
      .subscribe((x: any) => {
        this.countryList = x;
      });
  }
  // with every keyup event filter the country list to show
  @HostListener("keyup", ["$event.target"])
  filterList(val) {
    if (val.id == "country") {
      this.isCountrySelected = false;
      this.filteredList = this.countryList.filter((x) => {
        return (
          x.name.substr(0, val.value.length).toUpperCase() ==
          val.value.toUpperCase()
        );
      });
    }
  }

  // Reactive forms fields initialization
  contactForm = new FormGroup({
    zipcode: new FormControl("", Validators.required),
    country: new FormControl("", Validators.required),
    id: new FormControl(),
  });

  addLocation() {
    if (this.contactForm.valid && this.isCountrySelected) {
      // updating location in app memory and local storage
      this.weatherService.addCurrentConditions(
        this.contactForm.value.zipcode,
        this.contactForm.value.id
      );
      this.contactForm.reset();
      this.weatherService.refreshLocations();
      this.btnHtmlContent = this.btnArray[1];
    }
  }
  // click on country from list set its value.
  setCountry(val) {
    this.contactForm.patchValue({
      country: val.name,
      id: val.code.toLowerCase(),
    });
    this.isCountrySelected = true;
  }

  // On focusout get country is spelling good otherwise clear field
  resetCountry(val) {
    if (
      val.value &&
      this.filteredList[0].name.toLowerCase() === val.value.toLowerCase()
    ) {
      this.contactForm.patchValue({
        country: this.filteredList[0].name,
        id: this.filteredList[0].code.toLowerCase(),
      });
      this.isCountrySelected = true;
    }
    setTimeout(() => {
      if (!this.isCountrySelected) this.contactForm.controls.country.reset();
      this.filteredList = [];
    }, 200);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
