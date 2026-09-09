import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { LucideArrowUpRight } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { SectionLabelComponent } from '../section-label/section-label.component';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [LucideArrowUpRight, SectionLabelComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesComponent {
  protected readonly content = inject(ContentService);

  protected readonly activeCategory = signal('ALL');
  protected readonly visibleGames = computed(() => {
    const category = this.activeCategory();
    return category === 'ALL'
      ? this.content.games
      : this.content.games.filter((game) => game.category === category);
  });

  setCategory(category: string): void {
    this.activeCategory.set(category);
  }
}
