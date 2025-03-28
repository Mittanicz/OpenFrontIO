import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { v4 as uuidv4 } from "uuid";
import {
  MAX_USERNAME_LENGTH,
  validateUsername,
} from "../../core/validations/username";
import { UserSettings } from "../../core/game/UserSettings";
import { translateText } from "../Utils";
import Countries from "../data/countries.json";

const usernameKey = "username";
const flagKey = "flag";

@customElement("username-input")
export class UsernameInput extends LitElement {
  @state() private username: string = "";
  @state() private flag: string = "xx"; // empty flag as default
  @property({ type: String }) validationError: string = "";

  private _isValid: boolean = true;
  private userSettings: UserSettings = new UserSettings();

  createRenderRoot() {
    return this;
  }

  public getCurrentUsername(): string {
    return this.username;
  }

  connectedCallback() {
    super.connectedCallback();
    this.username = this.getStoredUsername();
    this.flag = this.getStoredFlag();
    this.dispatchUsernameEvent();
  }

  render() {
    return html`
      <o-input
        label="Username"
        inputId="username"
        placeholder="${translateText("username.enter_username")}"
        maxlength="${MAX_USERNAME_LENGTH}"
        errorMessage="${this.validationError}"
        @o-change="${this.handleChange}"
        @o-input="${this.handleChange}"
        type="text"
      >
        <span slot="pre">
          <o-select
            .items=${this.getCountryItems()}
            .selectedValue=${this.flag || "xx"}
            filterEnabled
            @o-select-change="${this.handleFlagSelected}"
          ></o-select>
        </span>
      </o-input>
    `;
  }

  private handleChange(e: CustomEvent) {
    const input = e.target as HTMLInputElement;
    this.username = input.value.trim();
    const result = validateUsername(this.username);
    this._isValid = result.isValid;
    if (result.isValid) {
      this.storeUsername(this.username);
      this.validationError = "";
    } else {
      this.validationError = result.error;
    }
  }

  private handleFlagSelected(e: CustomEvent) {
    this.flag = e.detail;
    this.storeFlag(this.flag === "xx" ? "" : this.flag);
    this.dispatchEvent(
      new CustomEvent("flag-change", {
        detail: { flag: this.flag },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private getCountryItems() {
    return Countries.map((country) => ({
      label: country.name,
      value: country.code,
      image:
        country.code !== "xx" ? `/flags/${country.code}.svg` : "/flags/xx.svg",
    }));
  }

  private getStoredUsername(): string {
    return localStorage.getItem(usernameKey) || this.generateNewUsername();
  }

  private storeUsername(username: string) {
    localStorage.setItem(usernameKey, username);
  }

  private dispatchUsernameEvent() {
    this.dispatchEvent(
      new CustomEvent("username-change", {
        detail: { username: this.username },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private generateNewUsername(): string {
    const newUsername = "Anon" + this.uuidToThreeDigits();
    this.storeUsername(newUsername);
    return newUsername;
  }

  private uuidToThreeDigits(): string {
    const uuid = uuidv4().replace(/-/g, "").toLowerCase();
    const decimal = BigInt(`0x${uuid}`);
    const threeDigits = decimal % 1000n;
    return threeDigits.toString().padStart(3, "0");
  }

  public isValid(): boolean {
    return this._isValid;
  }

  private getStoredFlag(): string {
    return localStorage.getItem(flagKey) || "";
  }

  private storeFlag(code: string) {
    if (code) {
      localStorage.setItem(flagKey, code);
    } else {
      localStorage.removeItem(flagKey);
    }
  }
}
