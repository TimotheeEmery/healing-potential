import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShamanCalculationComponent } from './shaman-calculation.component';

describe('ShamanCalculationComponent', () => {
  let component: ShamanCalculationComponent;
  let fixture: ComponentFixture<ShamanCalculationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShamanCalculationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShamanCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
