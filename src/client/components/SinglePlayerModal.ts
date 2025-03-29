import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { Difficulty, GameMapType, GameType } from "../../core/game/Game";
import { generateID as generateID } from "../../core/Util";
import { consolex } from "../../core/Consolex";
import "./Difficulties";
import "./baseComponents/Modal";
import "./baseComponents/ToggleSwitch";
import "./baseComponents/Button";
import { DifficultyDescription } from "./Difficulties";
import "./Maps";
import randomMap from "../../../resources/images/RandomMap.webp";
import { GameInfo } from "../../core/Schemas";
import { JoinLobbyEvent } from "../Main";
import { translateText } from "../Utils";

@customElement("single-player-modal")
export class SinglePlayerModal extends LitElement {
  @query("o-modal") private modalEl!: HTMLElement & {
    open: () => void;
    close: () => void;
  };
  @state() private selectedMap: GameMapType = GameMapType.World;
  @state() private selectedDifficulty: Difficulty = Difficulty.Medium;
  @state() private disableNPCs: boolean = false;
  @state() private disableNukes: boolean = false;
  @state() private bots: number = 400;
  @state() private infiniteGold: boolean = false;
  @state() private infiniteTroops: boolean = false;
  @state() private instantBuild: boolean = false;
  @state() private useRandomMap: boolean = false;

  render() {
    return html`
      <o-modal title=${translateText("single_modal.title")}>
        <o-section title="${translateText("single_modal.map")}">
          ${Object.entries(GameMapType)
            .filter(([key]) => isNaN(Number(key)))
            .map(
              ([key, value]) => html`
                <div
                  @click=${function () {
                    this.handleMapSelection(value);
                  }}
                >
                  <map-display
                    .mapKey=${key}
                    .selected=${!this.useRandomMap &&
                    this.selectedMap === value}
                    .translation=${translateText(`map.${key.toLowerCase()}`)}
                  ></map-display>
                </div>
              `,
            )}
          <div
            class="c-tile ${this.useRandomMap ? "c-tile--selected" : ""}"
            @click=${this.handleRandomMapToggle}
          >
            <div class="c-tile__image">
              <img src=${randomMap} alt="Random Map" />
            </div>
            <div class="c-tile__content">
              <div class="c-tile__title">${translateText("map.random")}</div>
            </div>
          </div>
        </o-section>
        <o-section title="${translateText("single_modal.difficulty")}">
          <difficulty-display
            .value=${this.selectedDifficulty}
            @difficulty-selected=${(e) => {
              this.selectedDifficulty = e.detail.difficulty;
            }}
          ></difficulty-display>
        </o-section>
        <o-section
          title="${translateText("single_modal.options_title")}"
          class="h-mb-md"
        >
          <range-slider
            label="${translateText("single_modal.bots")}"
            min="0"
            max="100"
            @input=${this.handleBotsChange}
            @change=${this.handleBotsChange}
            .value="${this.bots}"
          ></range-slider>

          <toggle-switch
            .checked=${this.disableNPCs}
            title="${translateText("single_modal.disable_nations")}"
            @change=${(e: CustomEvent) => (this.disableNPCs = e.detail)}
          ></toggle-switch>
          <toggle-switch
            .checked=${this.instantBuild}
            title="${translateText("single_modal.instant_build")}"
            @change=${(e: CustomEvent) => (this.instantBuild = e.detail)}
          ></toggle-switch>
          <toggle-switch
            .checked=${this.infiniteGold}
            title="${translateText("single_modal.infinite_gold")}"
            @change=${(e: CustomEvent) => (this.instantBuild = e.detail)}
          ></toggle-switch>
          <toggle-switch
            .checked=${this.infiniteTroops}
            title="${translateText("single_modal.infinite_troops")}"
            @change=${(e: CustomEvent) => (this.infiniteTroops = e.detail)}
          ></toggle-switch>
          <toggle-switch
            .checked=${this.disableNukes}
            title="${translateText("single_modal.disable_nukes")}"
            @change=${(e: CustomEvent) => (this.disableNukes = e.detail)}
          ></toggle-switch>
        </o-section>
        <o-button
          title=${translateText("single_modal.start")}
          @click=${this.startGame}
          blockDesktop
        ></o-button>
      </o-modal>
    `;
  }

  createRenderRoot() {
    return this; // light DOM
  }

  public open() {
    this.modalEl?.open();
    this.useRandomMap = false;
  }

  public close() {
    this.modalEl?.close();
  }

  private handleRandomMapToggle() {
    this.useRandomMap = true;
  }

  private handleMapSelection(value: GameMapType) {
    this.selectedMap = value;
    this.useRandomMap = false;
  }

  private handleDifficultySelection(value: Difficulty) {
    this.selectedDifficulty = value;
  }

  private handleBotsChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (isNaN(value) || value < 0 || value > 400) {
      return;
    }
    this.bots = value;
  }

  private handleInstantBuildChange(e: Event) {
    this.instantBuild = Boolean((e.target as HTMLInputElement).checked);
  }

  private handleInfiniteGoldChange(e: Event) {
    this.infiniteGold = Boolean((e.target as HTMLInputElement).checked);
  }

  private handleInfiniteTroopsChange(e: Event) {
    this.infiniteTroops = Boolean((e.target as HTMLInputElement).checked);
  }

  private handleDisableNPCsChange(e: Event) {
    this.disableNPCs = Boolean((e.target as HTMLInputElement).checked);
  }

  private handleDisableNukesChange(e: Event) {
    this.disableNukes = Boolean((e.target as HTMLInputElement).checked);
  }

  private getRandomMap(): GameMapType {
    const maps = Object.values(GameMapType);
    const randIdx = Math.floor(Math.random() * maps.length);
    return maps[randIdx] as GameMapType;
  }

  private startGame() {
    // If random map is selected, choose a random map now
    if (this.useRandomMap) {
      this.selectedMap = this.getRandomMap();
    }

    consolex.log(
      `Starting single player game with map: ${GameMapType[this.selectedMap]}${this.useRandomMap ? " (Randomly selected)" : ""}`,
    );

    this.dispatchEvent(
      new CustomEvent("join-lobby", {
        detail: {
          gameID: generateID(),
          gameConfig: {
            gameMap: this.selectedMap,
            gameType: GameType.Singleplayer,
            difficulty: this.selectedDifficulty,
            disableNPCs: this.disableNPCs,
            disableNukes: this.disableNukes,
            bots: this.bots,
            infiniteGold: this.infiniteGold,
            infiniteTroops: this.infiniteTroops,
            instantBuild: this.instantBuild,
          },
        } as JoinLobbyEvent,
        bubbles: true,
        composed: true,
      }),
    );
    this.close();
  }
}
