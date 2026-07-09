import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container flex-center flex-col">
      <div class="plane-icon animate-float">✈️</div>
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Destination Not Found</h2>
      <p class="error-desc">
        It seems like the flight you are looking for has been rerouted or does not exist. 
        Let's get you back on track to your next adventure.
      </p>
      <a routerLink="/" class="btn-gradient">Back to Home</a>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: calc(100vh - 180px);
      padding: var(--space-4xl) var(--space-xl);
      text-align: center;
      background: radial-gradient(circle at 50% 30%, rgba(21, 101, 192, 0.05) 0%, transparent 70%);
    }

    .plane-icon {
      font-size: 80px;
      margin-bottom: var(--space-lg);
    }

    .error-code {
      font-size: 7rem;
      font-weight: 900;
      line-height: 1;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: var(--space-sm);
      letter-spacing: -2px;
    }

    .error-title {
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--space-md);
    }

    .error-desc {
      font-size: var(--font-size-md);
      color: var(--text-secondary);
      max-width: 500px;
      margin-bottom: var(--space-xl);
      line-height: 1.6;
    }
  `]
})
export class NotFoundComponent {}
