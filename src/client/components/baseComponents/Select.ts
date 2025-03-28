import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface selectItems {
  label: string;
  value: any;
  image?: string;
}

@customElement("o-select")
export class OSelect extends LitElement {
  @property({ type: Array }) items: selectItems[] = [];
  @property({ type: String }) selectedValue: string = "";
  @property({ type: Boolean }) filterEnabled: boolean = false;
  @property({ type: Boolean }) showImageWithLabel: boolean = false;

  @state() private selectedItem: selectItems | null = null;
  @state() private filter: string = "";
  @state() private isOpen: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("click", this._handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("click", this._handleOutsideClick);
  }

  willUpdate(changedProps: Map<string | number | symbol, unknown>) {
    if (changedProps.has("items") || changedProps.has("selectedValue")) {
      const match = this.items.find(
        (item) => item.value === this.selectedValue,
      );
      if (match) {
        this.selectedItem = match;
      }
    }
  }

  private _handleOutsideClick = (event: MouseEvent) => {
    if (!this.contains(event.target as Node)) {
      this.isOpen = false;
    }
  };

  private selectItem(item: selectItems) {
    this.selectedItem = item;
    this.filter = "";
    this.isOpen = false;
    this.dispatchEvent(
      new CustomEvent("o-select-change", {
        detail: item.value,
        bubbles: true,
        composed: true,
      }),
    );
  }
  private renderSelectedDisplay() {
    if (!this.selectedItem) {
      return html`<span>Select</span>`;
    }

    const { image, label } = this.selectedItem;

    if (this.showImageWithLabel) {
      return html`
        ${image
          ? html`<img
              src="${image}"
              alt="${label} flag"
              class="w-[32px] h-[32px] object-contain"
            />`
          : null}
        <span>${label}</span>
      `;
    }

    return image
      ? html`<img
          src="${image}"
          alt="${label} flag"
          class="w-[32px] h-[32px] object-contain"
        />`
      : html`<span>${label}</span>`;
  }

  get filteredItems() {
    return this.items.filter((item) =>
      item.label.toLowerCase().includes(this.filter.toLowerCase()),
    );
  }

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <div class="c-select" @click=${() => (this.isOpen = !this.isOpen)}>
        <div class="c-select__display">${this.renderSelectedDisplay()}</div>

        ${this.isOpen
          ? html`
              <div class="c-select__listWrapper">
                ${this.filterEnabled
                  ? html`
                      <input
                        class="c-select__input"
                        type="text"
                        placeholder="Search..."
                        .value=${this.filter}
                        @input=${(e: InputEvent) => {
                          this.filter = (e.target as HTMLInputElement).value;
                          e.stopPropagation();
                          e.stopImmediatePropagation();
                        }}
                        @click=${(e: Event) => e.stopPropagation()}
                      />
                    `
                  : null}
                <ul class="c-select__list">
                  ${this.filteredItems.map(
                    (item) => html`
                      <li
                        class="c-select__item"
                        @click=${(e: Event) => {
                          this.selectItem(item);
                          e.stopPropagation();
                          e.stopImmediatePropagation();
                        }}
                      >
                        ${item.image
                          ? html`<img
                              src="${item.image}"
                              alt="${item.label}"
                            />`
                          : ""}
                        <div>${item.label}</div>
                      </li>
                    `,
                  )}
                </ul>
              </div>
            `
          : ""}
      </div>
    `;
  }
}
