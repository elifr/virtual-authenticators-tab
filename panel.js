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

"use strict";

import {html, render} from "lit-html";
import "./modules/authenticator-table.js";
import "./modules/display-error.js";

if (chrome.devtools.panels.themeName === "dark") {
  document.getElementById("body").classList.add("-theme-with-dark-background");
}

let tabId = chrome.devtools.inspectedWindow.tabId;
let _enabled = false;

let displayError = error => {
  let container = document.querySelector("display-error");
  container.errors = container.errors.concat([error]);
  window.setTimeout(
    () => container.errors = container.errors.filter(e => e !== error), 15000);
};

window.addEventListener("on-error", event => {
  displayError(event.detail);
});

let displayEnabled = enabled => {
  _enabled = enabled;

  document.getElementById("toggle").checked = enabled;
  if (enabled) {
    document.getElementById("splash").classList.add("hidden");
  } else {
    document.getElementById("authenticators").removeChild(
      document.querySelector("authenticator-table"));
    document.getElementById("splash").classList.remove("hidden");
  }
};

let enable = () => {
  chrome.debugger.attach({tabId}, "1.3", () => {
    if (chrome.runtime.lastError) {
      displayError(chrome.runtime.lastError.message);
      document.getElementById("toggle").checked = false;
      return;
    }
    chrome.debugger.sendCommand(
        {tabId}, "WebAuthn.enable", {}, () => {
          displayEnabled(true);
          let table = document.createElement("authenticator-table");
          document.getElementById("authenticators").appendChild(table);
          table.tabId = tabId;
          // add the retrieve button
          let text = document.createElement("p");
          text.innerHTML= "Click the button if you want to retrieve your credentials from the cloud using your credential_id"
          text.setAttribute("style","font-style: italic");
          let credential_field = document.createElement("input");
          credential_field.setAttribute("type","text");
          credential_field.setAttribute("id","credential_id");
          credential_field.setAttribute("style","border-radius: 5px; color: var(--accent-text-color); border-color: var(--accent-color);");
          let button = document.createElement("button");
          button.setAttribute("type","button");
          button.setAttribute("id","retCloudButton");
          button.setAttribute("style", "border-radius: 5px; color: var(--accent-text-color) ; background-colour: var(--accent-button-color); border-style: solid; border-width: 2px; padding: 0 12px; border-color: var(--accent-color); height: 24px");
          button.innerText= "Retrieve the private key from the cloud"
          let userIdContext = document.getElementById("user_id");
          userIdContext.appendChild(text);
          userIdContext.appendChild(credential_field);
          userIdContext.appendChild(button);
          let button2 = document.createElement("button");
          button2.setAttribute("type","button");
          button2.setAttribute("id","LoadButton");
          button2.setAttribute("style", "border-radius: 5px; color: var(--accent-text-color) ; background-colour: var(--accent-button-color); border-style: solid; border-width: 2px; padding: 0 12px; border-color: var(--accent-color); height: 24px");
          button2.innerText= "Load the credentials to the current authenticator"
          userIdContext.appendChild(button2);
          //button.addEventListener("click", (e) => {
          //chrome.runtime.sendMessage({name: "retCred", credential_id: credential_field.value }, (response) => {
            //console.log("panel.js");
            //console.log(response);
          //});

          
          //});

         
            
            
          });



          });
    
      
    


            

          

          

            





        
  

  
  



  chrome.debugger.onDetach.addListener(source => {
    if (source.tabId == tabId) {
      displayEnabled(false);
    }
  });

};

let disable = async () => {
  chrome.debugger.detach({tabId}, () => displayEnabled(false));
};

window.addEventListener("beforeunload", () => {
  if (_enabled)
    chrome.debugger.detach({tabId}, () => {});
});

let toggle = document.getElementById("toggle");
toggle.addEventListener("click", (e) => {
  if (toggle.checked)
    enable();
  else
    disable();

});
