import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { translateText } from "../../Utils";

/**
 * `o-section` is a customizable section component for grouping related UI elements.
 * It supports an optional translated or static title and a slot for injecting content.
 *
 * Features:
 * - Optional static title or i18n translation key
 * - Uses light DOM to allow external CSS styling
 * - Decorated borders for visual structure
 *
 * @element o-section
 * @slot - Default slot for section content
 */
@customElement("o-section")
export class OSection extends LitElement {
  static styles = css`
    o-section {
      display: flex;
      flex-direction: column-reverse;
      position: relative;
      padding: var(--space-xs);
    }

    .c-section__title {
      text-align: center;
      position: relative;
      font-size: 18px;
      font-weight: 400;
      margin: 0 0 var(--space-xs) 0;
    }

    .c-section__borderTopLeft {
      position: absolute;
      left: 0;
      top: 0;
      width: 1px;
      height: 8px;
      background: var(--secondaryBorderColor);

      &:before {
        content: "";
        top: 0;
        position: absolute;
        left: 1px;
        width: 8px;
        height: 1px;
        background: var(--secondaryBorderColor);
      }
    }

    .c-section__borderTopRight {
      position: absolute;
      right: 0;
      top: 0;
      width: 1px;
      height: 8px;
      background: var(--secondaryBorderColor);

      &:before {
        content: "";
        top: 0;
        position: absolute;
        right: 1px;
        width: 8px;
        height: 1px;
        background: var(--secondaryBorderColor);
      }
    }

    .c-section__borderBottomLeft {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 1px;
      height: 8px;
      background: var(--secondaryBorderColor);

      &:before {
        content: "";
        bottom: 0;
        position: absolute;
        left: 1px;
        width: 8px;
        height: 1px;
        background: var(--secondaryBorderColor);
      }
    }

    .c-section__borderBottomRight {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 1px;
      height: 8px;
      background: var(--secondaryBorderColor);

      &:before {
        content: "";
        bottom: 0;
        position: absolute;
        right: 1px;
        width: 8px;
        height: 1px;
        background: var(--secondaryBorderColor);
      }
    }
  `;
  /**
   * Section title text (used when `translationKey` is not set).
   */
  @property({ type: String }) title = "";

  /**
   * i18n translation key used to render the section title via `translateText()`.
   * If provided, overrides the `title`.
   */
  @property({ type: String }) translationKey = "";

  /**
   * Use light DOM (not shadow DOM).
   */

  render() {
    return html`
      <section class="c-section">
        <span class="c-section__borderTopLeft"></span>
        <span class="c-section__borderTopRight"></span>
        <span class="c-section__borderBottomLeft"></span>
        <span class="c-section__borderBottomRight"></span>
        <h3 class="c-section__title">
          ${this.translationKey
            ? translateText(this.translationKey)
            : this.title}
        </h3>
        <slot></slot>
      </section>
    `;
  }
}
