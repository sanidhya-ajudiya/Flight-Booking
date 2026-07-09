import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [ngStyle]="{ 'height': height, 'width': width, 'border-radius': borderRadius }">
      <div class="shimmer-effect"></div>
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      background-color: var(--border-color);
      position: relative;
      overflow: hidden;
      display: inline-block;
    }

    .shimmer-effect {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.15) 50%, 
        transparent 100%
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() height = '20px';
  @Input() width = '100%';
  @Input() borderRadius = '4px';
}
