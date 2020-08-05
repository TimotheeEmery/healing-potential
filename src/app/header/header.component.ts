import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  classSelected = 'Classes';

  constructor() {}

  ngOnInit(): void {}

  onSelectClass(newClass) {
    this.classSelected = newClass;
  }
}
