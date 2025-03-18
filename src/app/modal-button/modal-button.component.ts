// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-modal-button',
//   imports: [],
//   templateUrl: './modal-button.component.html',
//   styleUrl: './modal-button.component.scss'
// })
// export class ModalButtonComponent {

// }

// modal-button.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-modal-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <button (click)="toggleModal()" class="open-button">
        Add Peachy to your Server
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16m-1-4h2v2h-2zm0-1.992s2-.008 2 0C13 13.006 16 12 16 10c0-2.21-1.773-4-3.991-4A4 4 0 0 0 8 10h2c0-1.1.9-2 2-2s2 .9 2 2c0 .9-3 2.367-3 4.008"
          />
        </svg>
      </button>

      <div *ngIf="isModalOpen" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Instructions</h2>
            <button (click)="toggleModal()" class="close-button">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <p>
              These are the instructions for using this application. Please read
              carefully before proceeding.
            </p>
            <div class="outline">
              <p>
                1. Add Peachy using this link:
                <br />
                &nbsp; &nbsp;<a
                  href="https://discord.com/oauth2/authorize?client_id=1347209912316461210"
                  target="_blank"
                >
                  https://discord.com/oauth2/authorize?client_id=1347209912316461210
                </a>
              </p>
              <p>
                2. Add the following text-channels in your server:
                <strong>checkins</strong> and <strong>work-updates</strong>.
                &nbsp;&nbsp;&nbsp; From there, Peachy will send hourly messages.
              </p>
              <p>3. Enjoy!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .outline {
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .modal-body a {
        color: #007bff;
        text-decoration: none;
        font-weight: bold;
        white-space: nowrap; /* Prevents line breaks */
        word-break: break-word; /* Ensures it wraps properly if needed */
        overflow-wrap: break-word;
        display: inline-block;
      }
      .container {
        font-family: Arial, sans-serif;
      }

      .open-button {
        margin-bottom: 10px;
        background-color: transparent;
        color: #777;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        text-align: start;
        gap: 4px;

        svg {
          width: 18px;
          height: 18px;
        }
      }

      // .open-button:hover {
      //   background-color: #45a049;
      // }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background-color: white;
        border-radius: 5px;
        width: 80%;
        max-width: 600px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #ddd;
      }

      .modal-header h2 {
        margin: 0;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #777;
      }

      .close-button:hover {
        color: #000;
      }

      .modal-body {
        padding: 15px;
        line-height: 1.5;
        color: #555;
      }
    `,
  ],
})
export class ModalButtonComponent {
  isModalOpen = false;

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
}
