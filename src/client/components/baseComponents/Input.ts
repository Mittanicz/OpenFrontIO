import { LitElement, html, render } from "lit";
import { customElement, property, query } from "lit/decorators.js";

/**
 * `o-input` is a customizable input field component with built-in label,
 * validation message, and event handling for common input events.
 *
 * @element o-input
 * @fires o-input - Fired when the user types in the input
 * @fires o-change - Fired when the input value changes (on blur or enter)
 * @fires o-blur - Fired when the input loses focus
 */
@customElement("o-input")
export class OInput extends LitElement {
  /**
   * The label shown above the input.
   */
  @property({ type: String }) label = "";

  /**
   * The ID applied to the input element for accessibility and form labels.
   */
  @property({ type: String }) inputId = "";

  /**
   * The current value of the input.
   */
  @property({ type: String }) value = "";

  /**
   * Placeholder text shown when the input is empty.
   */
  @property({ type: String }) placeholder = "";

  /**
   * Maximum number of characters allowed.
   */
  @property({ type: Number }) maxlength = 24;

  /**
   * Type of the input (e.g., text, password, email).
   */
  @property({ type: String }) type = "text";

  /**
   * Error message displayed below the input. If set, highlights the input with an error state.
   */
  @property({ type: String }) errorMessage = "";

  @query("input")
  private _input!: HTMLInputElement;

  /**
   * Dispatches a `o-blur` event when input loses focus.
   */
  private handleBlur() {
    this.dispatchEvent(
      new CustomEvent("o-blur", {
        detail: this.value,
      }),
    );
  }

  private handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(
      new CustomEvent("o-change", {
        detail: this.value,
      }),
    );
  }

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(
      new CustomEvent("o-input", {
        detail: this.value,
      }),
    );
  }

  /**
   * Use the light DOM instead of shadow DOM.
   */
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="c-formElement ${this.errorMessage ? "is-error" : ""}">
        <slot name="pre"></slot>
        <div class="c-formElement__wrapper">
          <label class="c-label" for="${this.inputId}">${this.label}</label>
          <input
            class="c-input"
            id="${this.inputId}"
            value="${this.value}"
            type="${this.type}"
            placeholder="${this.placeholder}"
            maxlength="${this.maxlength}"
            @blur="${this.handleBlur}"
            @change="${this.handleChange}"
            @input="${this.handleInput}"
          />
        </div>
        <slot name="post"></slot>
      </div>
      ${this.errorMessage
        ? html` <div class="c-message">${this.errorMessage}</div>`
        : ""}
    `;
  }
}
