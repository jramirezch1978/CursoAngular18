import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'PROVIAS - LAB3: HTTP Interceptors';
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  testAuthenticatedRequest(): void {
    console.log('🔐 Testing Authenticated Request...');
    this.http.get(`${this.apiUrl}/products`).subscribe({
      next: (data) => {
        console.log('✅ Authenticated request successful:', data);
      },
      error: (error) => {
        console.error('❌ Authenticated request failed:', error);
      }
    });
  }

  testPublicRequest(): void {
    console.log('🌐 Testing Public Request...');
    this.http.get(`${this.apiUrl}/public/info`).subscribe({
      next: (data) => {
        console.log('✅ Public request successful:', data);
      },
      error: (error) => {
        console.error('❌ Public request failed:', error);
      }
    });
  }

  testErrorRequest(): void {
    console.log('⚠️ Testing Error Request...');
    this.http.get(`${this.apiUrl}/error/500`).subscribe({
      next: (data) => {
        console.log('✅ Unexpected success:', data);
      },
      error: (error) => {
        console.error('❌ Error request (expected):', error);
      }
    });
  }

  testTransformRequest(): void {
    console.log('🔄 Testing Transform Request...');
    this.http.get(`${this.apiUrl}/products/1`).subscribe({
      next: (data) => {
        console.log('✅ Transform request successful:', data);
        console.log('📅 Check if dates are transformed to Date objects');
      },
      error: (error) => {
        console.error('❌ Transform request failed:', error);
      }
    });
  }
}
