import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seat-map-container glass-card">
      <div class="seat-legend">
        <div class="legend-item"><span class="seat-box available"></span> Available</div>
        <div class="legend-item"><span class="seat-box selected"></span> Selected</div>
        <div class="legend-item"><span class="seat-box occupied"></span> Occupied</div>
      </div>

      <div class="cabin-container">
        <!-- Cockpit Header -->
        <div class="cockpit-nose">
          <span>✈️ COCKPIT / FRONT</span>
        </div>

        <div class="column-labels">
          <span>A (Win)</span>
          <span>B (Mid)</span>
          <span>C (Aisle)</span>
          <span class="aisle-gap">AISLE</span>
          <span>D (Aisle)</span>
          <span>E (Mid)</span>
          <span>F (Win)</span>
        </div>

        <div class="seat-rows">
          <div *ngFor="let row of rows" class="seat-row">
            <span class="row-num">{{ row }}</span>
            
            <button *ngFor="let col of ['A', 'B', 'C']" 
              class="seat-btn"
              [class.occupied]="isOccupied(row + col)"
              [class.selected]="isSelected(row + col)"
              [disabled]="isOccupied(row + col)"
              (click)="toggleSeat(row + col)">
              {{ row }}{{ col }}
            </button>

            <span class="aisle-spacer"></span>

            <button *ngFor="let col of ['D', 'E', 'F']" 
              class="seat-btn"
              [class.occupied]="isOccupied(row + col)"
              [class.selected]="isSelected(row + col)"
              [disabled]="isOccupied(row + col)"
              (click)="toggleSeat(row + col)">
              {{ row }}{{ col }}
            </button>
          </div>
        </div>
      </div>

      <div class="seat-summary" *ngIf="selectedSeats.length > 0">
        <span>Selected Seats: <strong>{{ selectedSeats.join(', ') }}</strong></span>
      </div>
    </div>
  `,
  styles: [`
    .seat-map-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .seat-legend {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .seat-box {
      width: 20px;
      height: 20px;
      border-radius: 4px;

      &.available { background: var(--seat-available); border: 1px solid var(--seat-available-border); }
      &.selected { background: var(--seat-selected); }
      &.occupied { background: var(--seat-occupied); }
    }

    .cabin-container {
      width: 100%;
      max-width: 450px;
      background: var(--bg-primary);
      border: 2px solid var(--border-color);
      border-radius: 40px 40px 16px 16px;
      padding: 24px;
    }

    .cockpit-nose {
      text-align: center;
      font-weight: 700;
      font-size: 0.8rem;
      color: var(--text-muted);
      letter-spacing: 1px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px dashed var(--border-color);
    }

    .column-labels {
      display: grid;
      grid-template-columns: repeat(3, 1fr) 40px repeat(3, 1fr);
      text-align: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .seat-rows {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .seat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr) 40px repeat(3, 1fr);
      gap: 6px;
      align-items: center;
    }

    .row-num {
      position: absolute;
      left: 10px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    .seat-btn {
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--seat-available-border);
      background: var(--seat-available);
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        transform: scale(1.1);
        background: var(--primary-accent);
        color: #ffffff;
      }

      &.selected {
        background: var(--seat-selected);
        color: #ffffff;
        border-color: var(--seat-selected);
        box-shadow: 0 4px 10px rgba(2, 132, 199, 0.4);
      }

      &.occupied {
        background: var(--seat-occupied);
        border-color: transparent;
        color: #94a3b8;
        cursor: not-allowed;
      }
    }

    .aisle-spacer {
      width: 40px;
    }

    .seat-summary {
      margin-top: 20px;
      background: rgba(2, 132, 199, 0.1);
      padding: 10px 20px;
      border-radius: 20px;
      color: var(--primary-accent);
      font-size: 0.95rem;
    }
  `]
})
export class SeatMapComponent implements OnInit {
  @Input() occupiedSeats: string[] = [];
  @Input() maxSeats: number = 1;
  @Output() seatSelected = new EventEmitter<string[]>();

  rows: number[] = Array.from({ length: 15 }, (_, i) => i + 1);
  selectedSeats: string[] = [];

  ngOnInit() {}

  isOccupied(seatCode: string): boolean {
    return this.occupiedSeats.includes(seatCode);
  }

  isSelected(seatCode: string): boolean {
    return this.selectedSeats.includes(seatCode);
  }

  toggleSeat(seatCode: string) {
    if (this.isSelected(seatCode)) {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seatCode);
    } else {
      if (this.selectedSeats.length >= this.maxSeats) {
        this.selectedSeats.shift(); // remove first if limit reached
      }
      this.selectedSeats.push(seatCode);
    }
    this.seatSelected.emit(this.selectedSeats);
  }
}
