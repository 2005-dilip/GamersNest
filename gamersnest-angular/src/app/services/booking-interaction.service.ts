import { Injectable, signal } from '@angular/core';
import { ContentService, type BookingExperience } from './content.service';

/**
 * Coordinates the cross-component booking interaction:
 * selecting an experience anywhere on the page updates a shared signal and
 * smooth-scrolls the user to the booking form (focusing the name field),
 * exactly matching the original `chooseExperience` behaviour.
 */
@Injectable({ providedIn: 'root' })
export class BookingInteractionService {
  /** Currently selected experience for the booking form. */
  readonly selectedExperience = signal<BookingExperience | ''>('');

  constructor(private content: ContentService) {}

  scrollToId(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  chooseExperience(experience: string): void {
    this.selectedExperience.set(this.content.normalizeBookingExperience(experience));
    this.scrollToId('book');
    window.setTimeout(() => document.getElementById('booking-name')?.focus(), 450);
  }
}
