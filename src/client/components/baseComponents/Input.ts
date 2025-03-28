import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("o-input")
export class OInput extends LitElement {
  @property({ type: String }) label = "";
  @property({ type: String }) inputId = "";
  @property({ type: String }) value = "";
  @property({ type: String }) placeholder = "";
  @property({ type: Number }) maxlength = 24;
  @property({ type: String }) type = "text";
  // New property for error messages
  @property({ type: String }) errorMessage = "";

  @query("input")
  private _input!: HTMLInputElement;

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
}
