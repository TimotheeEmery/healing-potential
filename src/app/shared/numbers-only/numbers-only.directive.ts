import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({ selector: 'input[appNumbersOnly]' })
export class NumbersOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange() {
    const initalValue = this.el.nativeElement.value;
    // Removes non number or point characters
    this.el.nativeElement.value = initalValue.replace(/[^0-9.]*/gm, '');

    // Removes second decimal point
    this.el.nativeElement.value = initalValue.replace(/(\..*)(\.)/gm, '$1');
  }
}
