import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideArrowUpRight } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { BookingInteractionService } from '../../services/booking-interaction.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [LucideArrowUpRight],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly content = inject(ContentService);
  private readonly interaction = inject(BookingInteractionService);
  protected readonly year = new Date().getFullYear();

  scrollToId(id: string): void {
    this.interaction.scrollToId(id);
  }
}
