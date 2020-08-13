import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'remover' })
export class RemoverPipe implements PipeTransform {
  constructor() {}

  transform(value: string, stringToRemove: string): string {
    return value.split(stringToRemove).join('');
  }
}
