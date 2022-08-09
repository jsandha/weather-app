import { take } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Component, HostListener } from "@angular/core";
import { WeatherService } from "app/weather.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CountryList } from "app/modals/countryList";

@Component({
  selector: "app-zipcode-entry",
  templateUrl: "./zipcode-entry.component.html",
  styleUrls: ["./zipcode-entry.component.css"],
})
export class ZipcodeEntryComponent {
  countryList: CountryList[];
  filteredList: CountryList[];
  isCountrySelected = false;

  constructor(
    private weatherService: WeatherService,
    private http: HttpClient
  ) {
    this.http
      .get("assets/country.list.json")
      .pipe(take(1))
      .subscribe((x: any) => {
        this.countryList = x;
      });
  }

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
        this.contactForm.value.zipcode.toString(),
        this.contactForm.value.id
      );
      this.contactForm.reset();
      this.weatherService.refreshLocations();
    }
  }

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
}
