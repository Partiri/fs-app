import { Component, Inject, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { MatChipInputEvent, MatChipSelectionChange } from '@angular/material/chips';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

export interface Department {
  name: string;
}

export interface Timeline {
  start: string,
  end: string,
  archive: boolean,
  departments: Department[]
}

@Component({
  selector: 'app-search-settings',
  templateUrl: './search-settings.component.html',
  styleUrls: ['./search-settings.component.scss']
})
export class SearchSettingsComponent implements OnInit {

  theme: boolean;
  templateTheme: string;
  cssStyle: string;
  themePath: string;

  disableEndDate: boolean;
  nowState: boolean;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  searchDepartments: Department[] = [];
  searchTimeline: Timeline;

  listdepartments;
  departmentsCtrl = new FormControl();
  filteredDepartments: Observable<string[]>;

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService, private translate: TranslateService) {
    
  }

  ngOnInit(): void {

    this.searchTimeline = this.storage.get('searchTimeline');
    this.listdepartments = this.storage.get('available-departments') || ["N/A"];
    this.searchDepartments = this.storage.get('searchDepartments');

    if (!this.searchTimeline) {
      this.searchTimeline = { start: '', end: '', archive: false, departments: [] };
    }

    if (!this.searchDepartments) {
      this.searchDepartments = []
    }

    if (this.searchTimeline.end === 'now') {
      this.nowState = true;
      this.disableEndDate = true;
    }

    this.setTheme();
    this.initFilteredDep();
  }

  setTheme(): void {
    const theme = this.storage.get('theme')
    const defThemePath = 'assets/themes/classic/';
    const defCss = 'light';

    if (theme === 'classic') {
      this.cssStyle = 'light';
      this.themePath = 'assets/themes/classic/';
      this.theme = false;
    }
    else if (theme === 'darkmode') {
      this.cssStyle = 'dark';
      this.themePath = 'assets/themes/darkmode/';
      this.theme = true;
    }
    else {
      this.cssStyle = defCss;
      this.themePath = defThemePath;
      this.theme = false;
    }
  }

  searchArchive($event) {
    this.searchTimeline.archive = $event.checked;
    this.storage.set('searchTimeline', this.searchTimeline);
  }

  dateChange(type, $event) {
    if (type === 'start') {
      this.searchTimeline.start = $event.srcElement.value;
    } else {
      this.searchTimeline.end = $event.srcElement.value;
    }

    this.storage.set('searchTimeline', this.searchTimeline);
  }

  dateendNow($event) {
    this.disableEndDate = $event.checked;

    if ($event.checked) {
      this.searchTimeline.end = 'now';
      this.nowState = true;
      this.storage.set('searchTimeline', this.searchTimeline);
    }
  }

  addDepartment(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    const index = this.listdepartments.indexOf(event.value);
    if (index >= 0) {
      if ((value || '').trim()) {
        this.searchDepartments.push({ name: value.trim() });
        this.storage.set('searchDepartments', this.searchDepartments);
        this.searchTimeline.departments = this.searchDepartments;
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  selectDepartment(event: MatAutocompleteSelectedEvent):void{}

  removeDepartment(department): void {
    const index = this.searchDepartments.indexOf(department);

    if (index >= 0) {
      this.searchDepartments.splice(index, 1);
      this.storage.set('searchDepartments', this.searchDepartments);
      this.searchTimeline.departments = this.searchDepartments;
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listdepartments.filter(dep => dep.toLowerCase().indexOf(filterValue) === 0);
  }

  initFilteredDep(){
    this.filteredDepartments = this.departmentsCtrl.valueChanges.pipe(startWith(null),
        map((dep: string | null) => dep ? this._filter(dep) : this.listdepartments.slice()));
  }
}
