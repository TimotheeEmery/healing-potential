import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShamanComponent } from './shaman.component';

describe('ShamanComponent', () => {
  let component: ShamanComponent;
  let fixture: ComponentFixture<ShamanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShamanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShamanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
