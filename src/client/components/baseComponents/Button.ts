import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { translateText } from "../../Utils";

/**
 * `o-button` is a customizable button component that supports styling variants,
 * full-width modes, disabling, and i18n translation.
 *
 * @element o-button
 */
@customElement("o-button")
export class OButton extends LitElement {
  /**
   * Button label text (used when `translationKey` is not set).
   */
  @property({ type: String }) title = "";

  /**
   * i18n translation key used to render the button's label via `translateText()`.
   * If provided, overrides the `title`.
   */
  @property({ type: String }) translationKey = "";

  /**
   * Renders button with the secondary style (e.g., outlined or alternative theme).
   */
  @property({ type: Boolean }) secondary = false;

  /**
   * Makes the button full-width on all screen sizes.
   */
  @property({ type: Boolean }) block = false;

  /**
   * Makes the button full-width only on desktop screens.
   */
  @property({ type: Boolean }) blockDesktop = false;

  /**
   * Disables the button both visually and functionally.
   */
  @property({ type: Boolean }) disabled = false;

  /**
   * Use light DOM (not shadow DOM).
   */
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <button
        class=${classMap({
          "c-button": true,
          "c-button--block": this.block,
          "c-button--blockDesktop": this.blockDesktop,
          "c-button--secondary": this.secondary,
          "c-button--disabled": this.disabled,
        })}
        ?disabled=${this.disabled}
      >
        ${this.translationKey === ""
          ? this.title
          : translateText(this.translationKey)}
      </button>
    `;
  }
}
