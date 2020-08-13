import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({ selector: 'input[appNumbersOnly]' })
export class NumbersOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange() {
    // Removes non number characters
    this.el.nativeElement.value = this.el.nativeElement.value.replace(
      /[^0-9]*/g,
      ''
    );
  }
}
