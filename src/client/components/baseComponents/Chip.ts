import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("o-chips")
export class OChips extends LitElement {
  @property({ type: Array })
  items: string[] = [];
  @property({ type: Boolean })
  limitHeight = false;

  static styles = css`
    .c-chipGroup {
      display: flex;
      gap: var(--space-md);
      flex-wrap: wrap;
    }

    .c-chipGroup--limit {
      max-height: 40dvh;
      overflow: scroll;
    }

    .c-chip {
      display: inline-block;
      padding: var(--space-xs) var(--space-md);
      border: 1px solid var(--secondaryBorderColor);
      border-radius: 6px;
      background: var(--secondaryBoxBackgroundColor);
    }
  `;

  render() {
    return html`
      <div class="c-chipGroup ${this.limitHeight ? "c-chipGroup--limit" : ""}"">
        ${this.items.map((item) => html`<span class="c-chip">${item}</span>`)}
      </div>
    `;
  }
}
