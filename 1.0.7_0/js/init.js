/*
 * Init extension global constants and settings.
 */

printLog = false ;  //log switch

console.log('Image Prompter init... log? %s', printLog );


function isPrintLog() {
    try {
        return printLog;
    }catch( err ) {  
        console.warn(`Log switch variable 'printLog' not provided outside! Use default value 'true'. You can add code "let printLog = true;" to switch on.`);
        return false; 
    }
}


function getCurrentTabUrl( callback ) {
    // Send a message to the background script to get the current tab's URL
    chrome.runtime.sendMessage({ action: 'getCurrentTabUrl' }, function(response) {
    // Do something with the URL
        console.log('Current tab URL:', response.url);
        callback( response.url )
        //return url;
    });
}