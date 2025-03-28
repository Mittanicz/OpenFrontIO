import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { translateText } from "../Utils";
import "./baseComponents/Modal";
import "./baseComponents/Button";
import langIndex from "../../../resources/lang/index.json";
import { UserSettings } from "../../core/game/UserSettings";

@customElement("settings-modal")
export class SettingsModal extends LitElement {
  private dKeyPressed = false;
  private userSettings: UserSettings = new UserSettings();

  @query("o-modal") private modalEl!: HTMLElement & {
    open: () => void;
    close: () => void;
  };

  @state() private languages: Array<{
    label: string;
    value: string;
    image: string;
  }> = [];

  @state() private currentLang: string = localStorage.getItem("lang") || "en";
  @state() private debugMode = false;
  @state() private darkMode: boolean = this.userSettings.darkMode();

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.prepareLanguages();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "d") this.dKeyPressed = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "d") this.dKeyPressed = false;
  };

  private async prepareLanguages() {
    const langs = await Promise.all(
      langIndex.languages.map(async (langCode: string) => {
        const meta = await this.getLangMeta(langCode);
        if (!meta) return null;
        console.log(meta);
        return {
          label: `${meta.native} (${meta.en})`,
          value: langCode,
          image: `/flags/${meta.svg}.svg`,
        };
      }),
    );
    this.languages = langs.filter(
      (lang): lang is { label: string; value: string; image: string } =>
        lang !== null,
    );
  }

  private async getLangMeta(langCode: string) {
    try {
      const lang = await import(`../../../resources/lang/${langCode}.json`);
      return {
        native: lang.lang?.native ?? langCode,
        en: lang.lang?.en ?? langCode,
        svg: lang.lang?.svg ?? langCode,
      };
    } catch (err) {
      console.warn(`⚠️ Failed to load lang ${langCode}`, err);
      return null;
    }
  }

  private async changeLanguage(langCode: string) {
    localStorage.setItem("lang", langCode);
    location.reload();
  }
  private handleToggle(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked !== this.darkMode) {
      this.userSettings.toggleDarkMode();
      this.darkMode = this.userSettings.darkMode();
    }
  }

  public toggleDarkMode() {
    this.userSettings.toggleDarkMode();
    this.darkMode = this.userSettings.darkMode();
  }

  public createRenderRoot() {
    return this;
  }

  public open() {
    this.modalEl.open();
    this.darkMode = this.userSettings.darkMode();
  }

  public close() {
    this.modalEl?.close();
  }

  render() {
    return html`
      <o-modal title=${translateText("Settings")} id="settings-modal">
        <div class="options-section">
          <div class="option-title">Language</div>
          <o-select
            label="Language"
            .items=${this.languages}
            .selectedValue=${this.currentLang}
            showImageWithLabel
            @o-select-change=${(e: CustomEvent) => {
              this.changeLanguage(e.detail);
            }}
          ></o-select>
        </div>
        <div class="options-section">
          <div class="option-title">Dark mode</div>
          <label
            for="dark-mode"
            class="option-card ${this.darkMode ? "selected" : ""}"
          >
            <div class="checkbox-icon"></div>
            <input
              type="checkbox"
              id="dark-mode"
              .checked=${this.darkMode}
              @change=${this.handleToggle}
            />
            <div class="option-card-title">
              ${translateText("settings.dark_mode")}
            </div>
          </label>
        </div>
      </o-modal>
    `;
  }
}
