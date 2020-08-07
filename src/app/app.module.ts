import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ShamanComponent } from './shaman/shaman.component';
import { NumbersOnlyDirective } from './shared/numbers-only/numbers-only.directive';
import { ShamanCalculationComponent } from './shaman/shaman-calculation/shaman-calculation/shaman-calculation.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ShamanComponent,
    NumbersOnlyDirective,
    ShamanCalculationComponent,
  ],
  imports: [BrowserModule, NgbModule, FormsModule ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
