import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideArrowUpRight } from '@lucide/angular';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-instagram-section',
  standalone: true,
  imports: [LucideArrowUpRight],
  templateUrl: './instagram-section.component.html',
  styleUrl: './instagram-section.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstagramSectionComponent {
  protected readonly content = inject(ContentService);
}
