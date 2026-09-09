import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideUsers, LucideGamepad2, LucidePlay, LucideTrophy, LucideZap } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { SectionLabelComponent } from '../section-label/section-label.component';

@Component({
  selector: 'app-reasons',
  standalone: true,
  imports: [LucideUsers, LucideGamepad2, LucidePlay, LucideTrophy, LucideZap, SectionLabelComponent],
  templateUrl: './reasons.component.html',
  styleUrl: './reasons.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReasonsComponent {
  protected readonly content = inject(ContentService);
}
