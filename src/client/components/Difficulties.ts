import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { translateText } from "../Utils";

export enum DifficultyKey {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
  Impossible = "Impossible",
}

export enum DifficultyDescription {
  Easy = "Relaxed",
  Medium = "Balanced",
  Hard = "Intense",
  Impossible = "Impossible",
}

const difficulties: DifficultyKey[] = [
  DifficultyKey.Easy,
  DifficultyKey.Medium,
  DifficultyKey.Hard,
  DifficultyKey.Impossible,
];

@customElement("difficulty-display")
export class DifficultyDisplay extends LitElement {
  @property({ type: String }) value: DifficultyKey | "" = "";

  @state() private internalValue: DifficultyKey | "" = "";

  static styles = css`
    .c-rangeSelector {
      padding: var(--space-md);
      border: 1px solid var(--borderColor);
      background: var(--secondaryBoxBackgroundColor);
    }

    .c-rangeSelector__rating {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
      margin-bottom: var(--space-md);
    }

    .c-rangeSelector__icon {
      width: 24px;
    }

    .c-rangeSelector__icon--active {
      color: var(--errorColor);
    }

    .c-rangeSelector__label {
      font-size: 14px;
      text-align: center;
    }
  `;

  updated(changed: Map<string, unknown>) {
    if (changed.has("value")) {
      this.internalValue = this.value;
    }
  }

  private getSkullIcon() {
    return html`<svg
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      height="100%"
      width="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m12.5 17-.5-1-.5 1h1z"></path>
      <path
        d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"
      ></path>
      <circle cx="15" cy="12" r="1"></circle>
      <circle cx="9" cy="12" r="1"></circle>
    </svg>`;
  }

  private handleClick(index: number) {
    const selected = difficulties[index];
    this.internalValue = selected;

    this.dispatchEvent(
      new CustomEvent("difficulty-selected", {
        detail: { difficulty: selected },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderSkulls() {
    return difficulties.map((diff, index) => {
      const active =
        difficulties.indexOf(this.internalValue as DifficultyKey) >= index;
      const icon = this.getSkullIcon();

      return html`
        <div
          class=${classMap({
            "c-rangeSelector__icon": true,
            "c-rangeSelector__icon--active": active,
          })}
          @click=${() => this.handleClick(index)}
          title="${diff}"
        >
          ${icon}
        </div>
      `;
    });
  }

  render() {
    const selectedLabel = this.internalValue
      ? translateText(`difficulty.${DifficultyDescription[this.internalValue]}`)
      : "";

    return html`
      <div class="c-rangeSelector">
        <div class="c-rangeSelector__rating">${this.renderSkulls()}</div>
        ${selectedLabel
          ? html`<div class="c-rangeSelector__label">${selectedLabel}</div>`
          : ""}
      </div>
    `;
  }
}
