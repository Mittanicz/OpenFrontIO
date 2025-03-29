import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("o-copy-button")
export class OCopyButton extends LitElement {
  @property({ type: String })
  textToCopy = "";

  @state()
  private copySuccess = false;

  static styles = css`
    .c-copyButton {
      display: inline-flex;
      color: var(--fontColorLight);
      align-items: center;
      padding: var(--space-xs) var(--space-md);
      background: var(--secondaryBoxBackgroundColor);
      border: 1px solid var(--borderColor);
      cursor: pointer;
    }

    .c-copyButton__icon {
      width: 24px;
      height: 24px;
    }

    .c-copyButton__icon--success {
      color: var(--successColor);
    }
  `;

  private async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.textToCopy);
      this.copySuccess = true;
      setTimeout(() => (this.copySuccess = false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  render() {
    return html`
      <button
        class="c-copyButton"
        @click=${this.copyToClipboard}
        ?disabled=${this.copySuccess}
      >
        <span>${this.textToCopy}</span>
        ${this.copySuccess
          ? html`<svg
              class="c-copyButton__icon c-copyButton__icon--success"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE -->
              <path
                fill="currentColor"
                d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
              />
            </svg>`
          : html`
              <svg
                class="c-copyButton__icon"
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M296 48H176.5C154.4 48 136 65.4 136 87.5V96h-7.5C106.4 96 88 113.4 88 135.5v288c0 22.1 18.4 40.5 40.5 40.5h208c22.1 0 39.5-18.4 39.5-40.5V416h8.5c22.1 0 39.5-18.4 39.5-40.5V176L296 48zm0 44.6l83.4 83.4H296V92.6zm48 330.9c0 4.7-3.4 8.5-7.5 8.5h-208c-4.4 0-8.5-4.1-8.5-8.5v-288c0-4.1 3.8-7.5 8.5-7.5h7.5v255.5c0 22.1 10.4 32.5 32.5 32.5H344v7.5zm48-48c0 4.7-3.4 8.5-7.5 8.5h-208c-4.4 0-8.5-4.1-8.5-8.5v-288c0-4.1 3.8-7.5 8.5-7.5H264v128h128v167.5z"
                ></path>
              </svg>
            `}
      </button>
    `;
  }
}
