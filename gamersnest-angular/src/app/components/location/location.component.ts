import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideArrowUpRight, LucidePhone, LucideClock3, LucideMessageCircle } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { SectionLabelComponent } from '../section-label/section-label.component';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [LucideArrowUpRight, LucidePhone, LucideClock3, LucideMessageCircle, SectionLabelComponent],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationComponent {
  protected readonly content = inject(ContentService);
}
