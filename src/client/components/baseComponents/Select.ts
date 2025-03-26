import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface CountryItem {
  label: string;
  value: any;
  image?: string;
}

@customElement("o-select")
export class OSelect extends LitElement {
  @property({ type: Array })
  items: CountryItem[] = [];

  @state()
  private selectedItem: CountryItem | null = null;

  @state()
  private filter: string = "";

  @state()
  private isOpen: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("click", this._handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("click", this._handleOutsideClick);
  }

  private _handleOutsideClick = (event: MouseEvent) => {
    if (!this.shadowRoot) return;
    const path = event.composedPath();
    if (!path.includes(this)) {
      this.isOpen = false;
    }
  };

  private selectItem(item: CountryItem) {
    this.selectedItem = item;
    this.filter = "";
    this.isOpen = false;

    this.dispatchEvent(
      new CustomEvent("value-selected", {
        detail: item.value,
        bubbles: true,
        composed: true,
      }),
    );
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
        <div class="c-select__display">
          ${this.selectedItem?.image
            ? html`<img
                src="${this.selectedItem.image}"
                alt="${this.selectedItem.label} flag"
              />`
            : ""}
          <span>${this.selectedItem?.label ?? "Select"}</span>
        </div>

        ${this.isOpen
          ? html`
              <input
                class="c-select__input"
                type="text"
                placeholder="Search..."
                .value=${this.filter}
                @input=${(e: InputEvent) => {
                  this.filter = (e.target as HTMLInputElement).value;
                }}
                @click=${(e: Event) => e.stopPropagation()}
              />
              <ul class="c-select__list">
                ${this.items}
                ${this.filteredItems.map(
                  (item) => html`
                    <div
                      class="c-select__item"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this.selectItem(item);
                      }}
                    >
                      ${item.image
                        ? html`<img src="${item.image}" alt="${item.label}" />`
                        : ""}
                      <span>${item.label}</span>
                    </div>
                  `,
                )}
              </ul>
            `
          : ""}
      </div>
    `;
  }
}
