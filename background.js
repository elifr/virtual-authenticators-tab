
chrome.runtime.onMessage.addListener((msg,sender,response) => {
    if (msg.name == "sendCred"){
        
        var keyObj = msg.keyObj;
        response({status:"success"});
        console.log(keyObj);
        var xj = new XMLHttpRequest();
        xj.open("POST", "http://localhost:3000/webauthn_api/sendCloud", true);
        xj.setRequestHeader("Content-Type", "application/json");
        xj.send(JSON.stringify({ keyObject: keyObj}));
        xj.onreadystatechange = function () {
         if (xj.readyState == 4) { 
            console.log(xj.responseText);
            }
        }
    }


   if (msg.name == "retCred"){
    var credential_id = msg.credential_id;
   
    response({status:"success"});
    console.log(credential_id);
    var xj = new XMLHttpRequest();
    xj.open("POST", "http://localhost:3000/webauthn_api/retCloud", true);
    xj.setRequestHeader("Content-Type", "application/json");
    xj.send(JSON.stringify({ credentialId: credential_id}));
    xj.onreadystatechange = function () {
         if (xj.readyState == 4) { 
            console.log(xj.responseText);
            }
        }
    }


   if (msg.name == "loadPriv"){
    var xj = new XMLHttpRequest();
    xj.open("GET", "http://localhost:3000/webauthn_api/getCred", true);
    xj.setRequestHeader("Content-Type", "application/json");
    xj.send();
    xj.onreadystatechange = function () {
        if (xj.readyState == 4) { 
            console.log("Got the private key from Azure:");
            console.log(xj.response);
           }
       }
    }

    return false;
});


 


