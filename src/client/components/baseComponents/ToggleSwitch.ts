import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("toggle-switch")
export class OToggleSwitch extends LitElement {
  @property({ type: Boolean }) checked = false;
  @property({ type: String }) title = "";

  static styles = css`
    .c-toggleSwitch {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-xs);
    }

    .c-toggleSwitch__state {
      display: flex;
      border: 1px solid var(--secondaryBorderColor);
      padding: var(--space-xs);
      overflow: hidden;
      cursor: pointer;
      gap: var(--space-xl);
    }

    .c-toggleSwitch__option {
      flex: 1;
      text-align: center;
      padding: var(--space-xs);
      background: transparent;
      transition: var(--transition);
    }

    .c-toggleSwitch__option--active {
      background-color: oklch(
        from var(--successColorBackground) l c h / calc(alpha - 0.6)
      );
    }
  `;

  private toggleState(newState: boolean) {
    this.checked = newState;
    this.dispatchEvent(new CustomEvent("change", { detail: this.checked }));
  }

  render() {
    return html`
      <div class="c-toggleSwitch">
        <label class="c-toggleSwitch__label"> ${this.title} </label>
        <div class="c-toggleSwitch__state">
          <div
            class="c-toggleSwitch__option ${!this.checked
              ? "c-toggleSwitch__option--active"
              : ""}"
            @click=${() => this.toggleState(false)}
          >
            OFF
          </div>
          <div
            class="c-toggleSwitch__option ${this.checked
              ? "c-toggleSwitch__option--active"
              : ""}"
            @click=${() => this.toggleState(true)}
          >
            ON
          </div>
        </div>
      </div>
    `;
  }
}
