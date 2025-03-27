import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { v4 as uuidv4 } from "uuid";
import {
  MAX_USERNAME_LENGTH,
  validateUsername,
} from "../core/validations/username";
import { UserSettings } from "../core/game/UserSettings";
import { translateText } from "../client/Utils";
import Countries from "./data/countries.json";

const usernameKey: string = "username";
const flagKey: string = "flag";

@customElement("username-input")
export class UsernameInput extends LitElement {
  @state() private username: string = "";
  @state() private flag: string = "";
  @state() private search: string = "";
  @state() private showModal: boolean = false;

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
        @input="${this.handleChange}"
        type="text"
      >
        <span slot="pre">
          <o-select
            .items=${this.getCountryItems()}
            @value-selected="${this.handleFlagSelected}"
          ></o-select>
        </span>
      </o-input>
    `;
  }

  private getCountryItems() {
    return Countries.map((country) => ({
      label: country.name,
      value: country.code,
      image: `/flags/${country.code}.svg`,
    }));
  }
  private handleFlagSelected(e: CustomEvent) {
    const code = e.detail;
    this.flag = code === "xx" ? "" : code;
    this.storeFlag(this.flag);
    this.dispatchEvent(
      new CustomEvent("flag-change", {
        detail: { flag: this.flag },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleChange(e: Event) {
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

  private getStoredUsername(): string {
    const storedUsername = localStorage.getItem(usernameKey);
    return storedUsername || this.generateNewUsername();
  }

  private storeUsername(username: string) {
    if (username) {
      localStorage.setItem(usernameKey, username);
    }
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
    const uuid = uuidv4();
    const cleanUuid = uuid.replace(/-/g, "").toLowerCase();
    const decimal = BigInt(`0x${cleanUuid}`);
    const threeDigits = decimal % 1000n;
    return threeDigits.toString().padStart(3, "0");
  }

  public isValid(): boolean {
    return this._isValid;
  }

  private getStoredFlag(): string {
    return localStorage.getItem(flagKey) || "";
  }

  private setFlag(code: string) {
    this.flag = code === "xx" ? "" : code;
    this.showModal = false;
    this.storeFlag(this.flag);
    this.dispatchEvent(
      new CustomEvent("flag-change", {
        detail: { flag: this.flag },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private storeFlag(code: string) {
    if (code) {
      localStorage.setItem(flagKey, code);
    } else {
      localStorage.removeItem(flagKey);
    }
  }
}
