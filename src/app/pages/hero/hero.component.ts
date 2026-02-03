import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HoloVideoContainerComponent } from '../../components/holo-video-container/holo-video-container.component';
import { HeroTextComponent } from './hero-text/hero-text.component';

@Component({
  selector: 'app-hero',
  imports: [HoloVideoContainerComponent, HeroTextComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent { }
