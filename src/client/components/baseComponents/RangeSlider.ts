import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("range-slider")
export class ORangeSlider extends LitElement {
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) value = 50;
  @property({ type: String }) label = "";

  static styles = css`
    .c-rangeSlider {
      background: var(--secondaryBoxBackgroundColor);
      border: 1px solid var(--borderColor);
      align-items: center;
      display: flex;
      gap: var(--space-md);
      padding: var(--space-md);
      margin-bottom: var(--space-xl);
    }

    .c-rangeSlider__label {
      font-weight: bold;
      flex: 1 0 auto;
    }

    .c-rangeSlider__input {
      -webkit-appearance: none;
      width: 100%;
      height: 4px;
      background: #ccc;
      outline: none;
    }

    .c-rangeSlider__input::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 24px;
      width: 6px;
      background: var(--primaryColor);
      margin-top: -3px;
      cursor: pointer;
      position: relative;
      z-index: 2;
    }

    .c-rangeSlider__value {
      text-align: right;
    }
  `;

  private handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = Number(input.value);
    this.dispatchEvent(new CustomEvent("input", { detail: this.value }));
  }

  private handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = Number(input.value);
    this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
  }

  render() {
    const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
    const trackStyle = `background: linear-gradient(to right, var(--primaryColor) ${percent}%, #ccc ${percent}%);`;

    return html`
      <div class="c-rangeSlider">
        <label class="c-rangeSlider__label">
          ${this.label} ${this.value}
        </label>
        <input
          class="c-rangeSlider__input"
          type="range"
          min=${this.min}
          max=${this.max}
          .value=${String(this.value)}
          style=${trackStyle}
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <div class="c-rangeSlider__value"></div>
      </div>
    `;
  }
}
