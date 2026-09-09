import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { LucideArrowUpRight } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { SectionLabelComponent } from '../section-label/section-label.component';
import { LightboxComponent } from '../lightbox/lightbox.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [LucideArrowUpRight, SectionLabelComponent, LightboxComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  protected readonly content = inject(ContentService);

  protected readonly selectedGallery = signal<number | null>(null);

  open(index: number): void {
    this.selectedGallery.set(index);
  }

  close(): void {
    this.selectedGallery.set(null);
  }

  setIndex(index: number): void {
    this.selectedGallery.set(index);
  }
}
