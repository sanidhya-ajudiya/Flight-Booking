import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    ToastContainerComponent,
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <!-- App Loading Screen -->
    <div class="app-loader" *ngIf="isLoading" [class.fade-out]="isFadingOut">
      <div class="loader-logo">✈️</div>
      <div class="loader-dots">
        <span></span><span></span><span></span>
      </div>
      <div class="loader-text">Loading SkyWings...</div>
    </div>

    <!-- Main App -->
    <div class="app-shell" [attr.data-theme]="themeService.theme()">
      <app-header></app-header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
      transition: background var(--transition-slow);
    }

    .main-content {
      flex: 1;
      position: relative;
    }

    .app-loader {
      transition: opacity 0.5s ease, visibility 0.5s ease;
      &.fade-out {
        opacity: 0;
        visibility: hidden;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isLoading = true;
  isFadingOut = false;

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    // Simulate app initialization
    setTimeout(() => {
      this.isFadingOut = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }, 1200);
  }
}
