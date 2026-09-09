import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { LucideX, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { GalleryItem } from '../../services/content.service';

/** Full-screen photo viewer with keyboard + click navigation. */
@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [LucideX, LucideChevronLeft, LucideChevronRight],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LightboxComponent {
  @Input({ required: true }) items!: GalleryItem[];
  @Input({ required: true }) index!: number;
  @Output() closed = new EventEmitter<void>();
  @Output() indexChange = new EventEmitter<number>();

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.close();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }

  close(): void {
    this.closed.emit();
  }

  prev(): void {
    this.indexChange.emit((this.index - 1 + this.items.length) % this.items.length);
  }

  next(): void {
    this.indexChange.emit((this.index + 1) % this.items.length);
  }

  stop(event: Event): void {
    event.stopPropagation();
  }
}
