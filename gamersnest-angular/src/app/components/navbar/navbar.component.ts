import { ChangeDetectionStrategy, Component, HostListener, ViewEncapsulation, inject, signal } from '@angular/core';
import { LucideArrowUpRight, LucideMenu, LucideX } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { BookingInteractionService } from '../../services/booking-interaction.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideArrowUpRight, LucideMenu, LucideX],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly content = inject(ContentService);
  private readonly interaction = inject(BookingInteractionService);

  protected readonly scrolled = signal(false);
  protected readonly mobileOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 32);
  }

  closeMenu(): void {
    this.mobileOpen.set(false);
  }

  toggleMenu(): void {
    this.mobileOpen.update((value) => !value);
  }

  chooseExperience(experience: string): void {
    this.closeMenu();
    this.interaction.chooseExperience(experience);
  }
}
