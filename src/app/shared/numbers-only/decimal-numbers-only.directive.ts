import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({ selector: 'input[appDecimalNumbersOnly]' })
export class DecimalNumbersOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange() {
    // Removes non number or point characters
    // And removes second decimal point
    this.el.nativeElement.value = this.el.nativeElement.value
      .replace(/[^0-9.]*/g, '')
      .replace(/(\..*)(\.)/g, '$1');
  }
}
