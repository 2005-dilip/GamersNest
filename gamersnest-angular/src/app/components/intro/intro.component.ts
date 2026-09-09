import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideArrowUpRight } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { BookingInteractionService } from '../../services/booking-interaction.service';
import { SectionLabelComponent } from '../section-label/section-label.component';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [LucideArrowUpRight, SectionLabelComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroComponent {
  protected readonly content = inject(ContentService);
  private readonly interaction = inject(BookingInteractionService);

  scrollToId(id: string): void {
    this.interaction.scrollToId(id);
  }
}
