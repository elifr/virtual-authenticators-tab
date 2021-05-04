
// send the private key to the node js end point
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

// post the credential id to get the relevant private key 

   if (msg.name == "retCred"){
       
   

        function getCred(callback) {
            let credential_id = msg.credential_id;
            var xhr = new XMLHttpRequest();
          
            xhr.onreadystatechange = (e) => {
              if (xhr.readyState !== 4) {
                return;
              }
          
              if (xhr.status === 200) {
                console.log('SUCCESS', xhr.responseText);
                callback(JSON.parse(xhr.responseText));
              } else {
                console.warn('request_error');
              }
            };
          
            xhr.open("POST", "http://localhost:3000/webauthn_api/retCloud", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify({ credentialId: credential_id}));
          }
          
          getCred(data => response(data));
          return true;


        
        
    
        
   
    }
    

   
    

    //   get the relevant private key 
});




 


