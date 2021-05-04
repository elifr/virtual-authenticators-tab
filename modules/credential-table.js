// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {LitElement, html, css} from "lit-element";

class CredentialTable extends LitElement {
  static get properties() {
    return {
      authenticatorId: {type: String},
      credentials: {type: Array},
    };
  }

  static get styles() {
    return css`
      .code {
        font-family: monospace;
      }
      .table-wrapper {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-spacing: 0;
        border: var(--divider-color) 1px solid;
      }
      thead {
        background-color: var(--toolbar-bg-color);
        height: 18px;
      }
      thead th {
        font-weight: normal;
        text-align: left;
        border-bottom: var(--divider-color) 1px solid;
        border-left: var(--divider-color) 1px solid;
        border-right: var(--divider-color) 1px solid;
        padding: 1px 4px;
      }
      table button {
        display: block;
        width: 85%;
        margin: auto;
      }
      table td {
        padding: 5px;
        min-height: 20px;
        border-left: var(--divider-color) 1px solid;
        border-right: var(--divider-color) 1px solid;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      tbody tr:nth-child(even) {
        background-color: var(--tab-selected-bg-color);
      }
      .empty-table td {
        padding: 8px;
      }
      .small-column {
        width: 10em;
      }
      .align-center {
        text-align: center;
      }
      .align-left {
        text-align: left;
      }
      .align-right {
        text-align: right;
      }
      a {
        color: var(--accent-color);
      }
      a:visited {
        color: var(--accent-color);
      }
      a:hover {
        color: var(--accent-color-hover);
      }
    `;
  }

  constructor() {
    super();
    this.authenticatorId = null;
    this.credentials = [];
    this.tabId = chrome.devtools.inspectedWindow.tabId;
  }

  disconnectedCallback() {
    window.clearInterval(this.intervalHandle);
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, _, value) {
    if (name !== "authenticatorid" || !value)
      return;

    this.intervalHandle = window.setInterval(() => {
      chrome.debugger.sendCommand(
        {tabId: this.tabId}, "WebAuthn.getCredentials",
        {authenticatorId: this.authenticatorId},
        (response) => {
          if (chrome.runtime.lastError) {
            this.dispatchEvent(new CustomEvent("on-error", {
              detail: chrome.runtime.lastError.message,
              bubbles: true,
              composed: true,
            }));
            return;
          }
          this.credentials = response.credentials;
        });
    }, 1000);

    super.attributeChangedCallback(name, _, value);
  }

  uploadCredential(){
    //let credential_id = document.querySelectorAll('input')[0].value;
    var inputField = document.querySelector('authenticator-table').shadowRoot.querySelector('credential-table').shadowRoot.querySelector('input');
    let credential_id = inputField.value;
    
    chrome.runtime.sendMessage({name: "retCred", credential_id: credential_id}, (response) => {
  
      chrome.debugger.sendCommand(
        {tabId: this.tabId}, "WebAuthn.addCredential",
        {
          authenticatorId: this.authenticatorId,
          credential: {
          credentialId: response.credential_id,
          isResidentCredential: false,
          privateKey: response.privateKey,
          rpId: "localhost",
          signCount: 1
          }
          
  
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
            this.dispatchEvent(new CustomEvent("on-error", {
              detail: chrome.runtime.lastError.message,
              bubbles: true,
              composed: true,
            }));
            return;
          }
        
          
        });

  
        
      

    });
    
     
    
  }

  removeCredential(credential) {
    chrome.debugger.sendCommand(
      {tabId: this.tabId}, "WebAuthn.removeCredential",
      {
        authenticatorId: this.authenticatorId,
        credentialId: credential.credentialId
      },
      (response) => {
        if (chrome.runtime.lastError) {
          this.dispatchEvent(new CustomEvent("on-error", {
            detail: chrome.runtime.lastError.message,
            bubbles: true,
            composed: true,
          }));
          return;
        }
        this.credentials =
          this.credentials.filter(c => c.id !== credential.credentialId);
      });
  }

 
  

  getCredential(credential){

    chrome.debugger.sendCommand(
      {tabId: this.tabId}, "WebAuthn.getCredential",
      {
        authenticatorId: this.authenticatorId,
        credentialId: credential.credentialId
      },
      (response) => {
        if (chrome.runtime.lastError) {
          this.dispatchEvent(new CustomEvent("on-error", {
            detail: chrome.runtime.lastError.message,
            bubbles: true,
            composed: true,
          }));
          return;
        }
        let keyObj = {
          credential_id : credential.credentialId,
          privateKey : credential.privateKey
        }
        var keyObject = keyObj;
        
        chrome.runtime.sendMessage({name: "sendCred", keyObj: keyObject}, (response) => {
          console.log(response.status);
        });
        
      });
    
  }

  export(credential) {
    let text = `-----BEGIN CREDENTIAL ID-----
    ${credential.credentialId}
    -----END CREDENTIAL ID-----`;
    let link = document.createElement("a");
    document.body.appendChild(link);
    link.download = "Credential_id.txt";
    link.href = "data:application/text/plain;charset=utf-8," + encodeURIComponent(text);
    link.click();
    document.body.removeChild(link);
  }

 
  

  

  render() {
    return html`
      <h3>Credentials</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="align-left">ID</th>
              <th class="small-column">Is Resident</th>
              <th class="small-column">RP ID</th>
              <th class="small-column">User Handle</th>
              <th class="small-column">Sign Count</th>
              <th class="small-column"></th>
              <th class="small-column"></th>
            </tr>
          </thead>
          <tbody>
            ${this.credentials.length === 0 ? html`
              <tr class="align-center empty-table">
                <td colspan="99">
                  NOCREDENTIALS
                </td>
                <td colspan="99" style="text-align:center;" >
                
                
                <input id="myinput" type="text">
                
                <button id="loadPriv" @click="${this.uploadCredential.bind(this)}"> Load credentials
                  </button>
                  
                </td>
              

              </tr>
            ` : html``}
            ${this.credentials.map(credential => html`
              <tr>
                <td class="code">${credential.credentialId}</td>
                <td class="align-center">
                  <input type="checkbox" disabled
                         ?checked="${credential.isResidentCredential}">
                </td>
                <td>${credential.rpId || "<unknown RP ID>"}</td>
                <td>${credential.userHandle || "<no user handle>"}</td>
                <td class="align-center">${credential.signCount}</td>
                <td class="align-center">
                  <a @click="${this.export.bind(this, credential)}" href="#">
                    Export
                  </a>
                </td>
                <td class="align-center">
                  <button id="sendCloud" @click="${this.getCredential.bind(this,credential)}"> Send credentials
                  </button>
                </td>
                <td class="align-center">
                  <a @click="${this.removeCredential.bind(this, credential)}" href="#">
                    Remove
                  </a>
                </td>
              </tr>
           `)}
          </tbody>
        </table>
      </div>
    `;
  }

  

}

customElements.define("credential-table", CredentialTable);
