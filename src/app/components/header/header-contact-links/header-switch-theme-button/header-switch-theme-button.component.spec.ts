import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSwitchThemeButtonComponent } from './header-switch-theme-button.component';

describe('HeaderSwitchThemeButtonComponent', () => {
  let component: HeaderSwitchThemeButtonComponent;
  let fixture: ComponentFixture<HeaderSwitchThemeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSwitchThemeButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderSwitchThemeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
