import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { Difficulty, GameMapType } from "../../core/game/Game";
import { GameConfig, GameInfo } from "../../core/Schemas";
import { consolex } from "../../core/Consolex";
import "./Difficulties";
import "./baseComponents/Modal";
import "./baseComponents/CopyButton";
import { DifficultyDescription } from "./Difficulties";
import "./Maps";
import randomMap from "../../../resources/images/RandomMap.webp";
import { generateID } from "../../core/Util";
import { getServerConfigFromClient } from "../../core/configuration/ConfigLoader";
import { JoinLobbyEvent } from "../Main";
import { translateText } from "../Utils";

@customElement("host-lobby-modal")
export class HostLobbyModal extends LitElement {
  @query("o-modal") private modalEl!: HTMLElement & {
    open: () => void;
    close: () => void;
  };
  @state() private selectedMap: GameMapType = GameMapType.World;
  @state() private selectedDifficulty: Difficulty = Difficulty.Medium;
  @state() private disableNPCs = false;
  @state() private disableNukes: boolean = false;
  @state() private bots: number = 400;
  @state() private infiniteGold: boolean = false;
  @state() private infiniteTroops: boolean = false;
  @state() private instantBuild: boolean = false;
  @state() private lobbyId = "";
  @state() private copySuccess = false;
  @state() private players: string[] = [];
  @state() private useRandomMap: boolean = false;

  private playersInterval = null;
  // Add a new timer for debouncing bot changes
  private botsUpdateTimer: number | null = null;

  render() {
    return html`
      <o-modal title=${translateText("host_modal.title")}>
        <div class="container__row container__row--center h-mb-md">
          <o-copy-button .textToCopy="${this.lobbyId}"></o-copy-button>
        </div>
        <o-section limitHeight title="${translateText("host_modal.map")}">
          ${Object.entries(GameMapType)
            .filter(([key]) => isNaN(Number(key)))
            .map(
              ([key, value]) => html`
                <map-display
                  .mapKey=${key}
                  .selected=${!this.useRandomMap && this.selectedMap === value}
                  .translation=${translateText(`map.${key.toLowerCase()}`)}
                ></map-display>
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
        <o-section title="${translateText("host_modal.difficulty")}">
          <difficulty-display
            .value=${this.selectedDifficulty}
            @difficulty-selected=${(e) => {
              this.selectedDifficulty = e.detail.difficulty;
            }}
          ></difficulty-display>
        </o-section>      
        <o-section title="${translateText("host_modal.options_title")}">
          <range-slider
            label="${translateText("host_modal.bots")}"
            min="0"
            max="100"
            @input=${this.handleBotsChange}
            @change=${this.handleBotsChange}
            .value="${this.bots}"
          ></range-slider>
          <toggle-switch
            .checked=${this.instantBuild}
            title="${translateText("host_modal.instant_build")}"
            @change=${(e: CustomEvent) => (this.instantBuild = e.detail)}
          ></toggle-switch>
          <toggle-switch
            .checked=${this.infiniteGold}
            title="${translateText("host_modal.infinite_gold")}"
            @change=${(e: CustomEvent) => (this.infiniteGold = e.detail)}
          ></toggle-switch>
          <toggle-switch
            .checked=${this.infiniteTroops}
            title="${translateText("host_modal.infinite_troops")}"
            @change=${(e: CustomEvent) => (this.infiniteTroops = e.detail)}
          ></toggle-switch>
          <toggle-switch
            .checked=${this.disableNukes}
            title="${translateText("host_modal.disable_nukes")}"
            @change=${(e: CustomEvent) => (this.disableNukes = e.detail)}
          ></toggle-switch>
        </o-section>
        <o-section class="h-mb-md" title="${this.players.length}
            ${
              this.players.length === 1
                ? translateText("host_modal.player")
                : translateText("host_modal.players")
            }">
          <o-chips .items="${this.players}" limitHeight></o-chips>
        </o-section>

        <o-button
          @click=${this.startGame}
          block
          .disabled=${this.players.length < 2}
          title="${
            this.players.length === 1
              ? translateText("host_modal.waiting")
              : translateText("host_modal.start")
          }"
        >
        </o-button>
        </div>
      </o-modal>
    `;
  }

  createRenderRoot() {
    return this;
  }

  public open() {
    createLobby()
      .then((lobby) => {
        this.lobbyId = lobby.gameID;
        // join lobby
      })
      .then(() => {
        this.dispatchEvent(
          new CustomEvent("join-lobby", {
            detail: {
              gameID: this.lobbyId,
            } as JoinLobbyEvent,
            bubbles: true,
            composed: true,
          }),
        );
      });
    this.modalEl?.open();
    this.playersInterval = setInterval(() => this.pollPlayers(), 1000);
  }

  public close() {
    this.modalEl?.close();
    this.copySuccess = false;
    if (this.playersInterval) {
      clearInterval(this.playersInterval);
      this.playersInterval = null;
    }
    // Clear any pending bot updates
    if (this.botsUpdateTimer !== null) {
      clearTimeout(this.botsUpdateTimer);
      this.botsUpdateTimer = null;
    }
  }

  private async handleRandomMapToggle() {
    this.useRandomMap = true;
    this.putGameConfig();
  }

  private async handleMapSelection(value: GameMapType) {
    this.selectedMap = value;
    this.useRandomMap = false;
    this.putGameConfig();
  }

  private async handleDifficultySelection(value: Difficulty) {
    this.selectedDifficulty = value;
    this.putGameConfig();
  }

  // Modified to include debouncing
  private handleBotsChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (isNaN(value) || value < 0 || value > 400) {
      return;
    }

    // Update the display value immediately
    this.bots = value;

    // Clear any existing timer
    if (this.botsUpdateTimer !== null) {
      clearTimeout(this.botsUpdateTimer);
    }

    // Set a new timer to call putGameConfig after 300ms of inactivity
    this.botsUpdateTimer = window.setTimeout(() => {
      this.putGameConfig();
      this.botsUpdateTimer = null;
    }, 300);
  }

  private handleInstantBuildChange(e: Event) {
    this.instantBuild = Boolean((e.target as HTMLInputElement).checked);
    this.putGameConfig();
  }

  private handleInfiniteGoldChange(e: Event) {
    this.infiniteGold = Boolean((e.target as HTMLInputElement).checked);
    this.putGameConfig();
  }

  private handleInfiniteTroopsChange(e: Event) {
    this.infiniteTroops = Boolean((e.target as HTMLInputElement).checked);
    this.putGameConfig();
  }

  private handleDisableNukesChange(e: Event) {
    this.disableNukes = Boolean((e.target as HTMLInputElement).checked);
    this.putGameConfig();
  }

  private async handleDisableNPCsChange(e: Event) {
    this.disableNPCs = Boolean((e.target as HTMLInputElement).checked);
    consolex.log(`updating disable npcs to ${this.disableNPCs}`);
    this.putGameConfig();
  }

  private async putGameConfig() {
    const config = await getServerConfigFromClient();
    const response = await fetch(
      `${window.location.origin}/${config.workerPath(this.lobbyId)}/api/game/${this.lobbyId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameMap: this.selectedMap,
          difficulty: this.selectedDifficulty,
          disableNPCs: this.disableNPCs,
          disableNukes: this.disableNukes,
          bots: this.bots,
          infiniteGold: this.infiniteGold,
          infiniteTroops: this.infiniteTroops,
          instantBuild: this.instantBuild,
        } as GameConfig),
      },
    );
  }

  private getRandomMap(): GameMapType {
    const maps = Object.values(GameMapType);
    const randIdx = Math.floor(Math.random() * maps.length);
    return maps[randIdx] as GameMapType;
  }

  private async startGame() {
    if (this.useRandomMap) {
      this.selectedMap = this.getRandomMap();
    }

    await this.putGameConfig();
    consolex.log(
      `Starting private game with map: ${GameMapType[this.selectedMap]} ${this.useRandomMap ? " (Randomly selected)" : ""}`,
    );
    this.close();
    const config = await getServerConfigFromClient();
    const response = await fetch(
      `${window.location.origin}/${config.workerPath(this.lobbyId)}/api/start_game/${this.lobbyId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  private async copyToClipboard() {
    try {
      //TODO: Convert id to url and copy
      await navigator.clipboard.writeText(
        `${location.origin}/join/${this.lobbyId}`,
      );
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (err) {
      consolex.error(`Failed to copy text: ${err}`);
    }
  }

  private async pollPlayers() {
    const config = await getServerConfigFromClient();
    fetch(`/${config.workerPath(this.lobbyId)}/api/game/${this.lobbyId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data: GameInfo) => {
        console.log(`got response: ${data}`);
        this.players = data.clients.map((p) => p.username);
      });
  }
}

async function createLobby(): Promise<GameInfo> {
  const config = await getServerConfigFromClient();
  try {
    const id = generateID();
    const response = await fetch(
      `/${config.workerPath(id)}/api/create_game/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(data), // Include this if you need to send data
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    consolex.log("Success:", data);

    return data as GameInfo;
  } catch (error) {
    consolex.error("Error creating lobby:", error);
    throw error; // Re-throw the error so the caller can handle it
  }
}
