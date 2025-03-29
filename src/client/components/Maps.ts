import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { GameMapType } from "../../core/game/Game";
import { getMapsImage } from "../utilities/Maps";

// Add map descriptions
export const MapDescription: Record<keyof typeof GameMapType, string> = {
  World: "World",
  Europe: "Europe",
  Mena: "MENA",
  NorthAmerica: "North America",
  Oceania: "Oceania",
  BlackSea: "Black Sea",
  Africa: "Africa",
  Pangaea: "Pangaea",
  Asia: "Asia",
  Mars: "Mars",
  SouthAmerica: "South America",
  Britannia: "Britannia",
  GatewayToTheAtlantic: "Gateway to the Atlantic",
  Australia: "Australia",
  Iceland: "Iceland",
};

@customElement("map-display")
export class MapDisplay extends LitElement {
  @property({ type: String }) mapKey = "";
  @property({ type: Boolean }) selected = false;
  @property({ type: String }) translation: string = "";

  static styles = css``;
  public createRenderRoot() {
    return this;
  }
  render() {
    const mapValue = GameMapType[this.mapKey as keyof typeof GameMapType];

    return html`
      <div class="c-tile ${this.selected ? "c-tile--selected" : ""} h-mb-md">
        <div class="c-tile__image">
          ${getMapsImage(mapValue)
            ? html`<img src="${getMapsImage(mapValue)}" alt="${this.mapKey}" />`
            : html`<div class="option-image">
                <p>${this.mapKey}</p>
              </div>`}
        </div>
        <div class="c-tile__content">
          <div class="c-tile__title">
            ${this.translation ||
            MapDescription[this.mapKey as keyof typeof GameMapType]}
          </div>
        </div>
      </div>
    `;
  }
}
