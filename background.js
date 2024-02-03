


// Helper function to concatenate multiple ArrayBuffers
function concatenateArrayBuffers(buffers) {
    console.log(buffers);
    let totalLength = buffers.reduce((acc, buffer) => {
        console.log({acc, buffer});
        if (typeof buffer?.byteLength === 'number') {
            return acc + buffer.byteLength
        }
        else {console.log('not  a number', {buffer}); return acc;}
    }, 0);
    let concatenatedBuffer = new Uint8Array(totalLength);
    let offset = 0;
  
    buffers.forEach(buffer => {
      concatenatedBuffer.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    });
  
    return concatenatedBuffer.buffer;
}

// Helper function to convert ArrayBuffer to string
function arrayBufferToString(buffer) {
    return new TextDecoder().decode(new Uint8Array(buffer));
}

/**
 * 
 * @param {Element} elem 
 */
function doubleClick(elem) {
    elem.dispatchEvent(new Event("dblclick", {bubbles: true}));
}

let filter;

let inventoryResponse;

const timer = setInterval(() =>{
    if (inventoryResponse && inventoryResponse?.success) {
         console.log(inventoryResponse)
        clearInterval(timer)
     }
    
    }, 2000)


function logURL(details) {
    console.log({details})
    if (!details.url.includes('/inventory/json/')) return;
    document.body.style.border = "5px solid red";
    requestId = details.requestId;
    console.log({requestId});
    filter = browser.webRequest.filterResponseData(details.requestId)
    console.log({filter})
    let chunks = [];
    filter.onstart = (event) => {
        console.log("started", {event});
      };
    filter.ondata = (event) => { 
        if (!event.data) return;
        chunks.push(event.data);
        filter.write(event.data);
      };
    filter.onstop = (event) => {
        filter.close();
        console.log('stopped', {event});   
        const buffer = concatenateArrayBuffers(chunks);
        const string = arrayBufferToString(buffer);
        try {
            inventoryResponse = JSON.parse(string)
            browser.webRequest.onBeforeRequest.removeListener(logURL);
        }
        catch (error) {
            console.error('failed to turn inventory response to string', {error, string: buffer, chunks})
        }
      };
}

/**
 * @returns {{userId: string; appId: string; contextid: string}}
 */
function getUserDataFromHTML(){
    /**
     * @type {NodeListOf<HTMLDivElement>}
     */
    const inventories = document.querySelectorAll('.inventory_ctn');
    console.log({inventories});
    const activeInventory = [...inventories].find(a =>a.style.display !== 'none');
    console.log({activeInventory});

    const [, userId, appId, contextid] = activeInventory.id.split('_');
    
    return {userId, appId, contextid}
}

async function getItems(userId, appId, contextId) {
    
}


browser.webRequest.onBeforeSendHeaders.addListener(logURL, {
    urls: ["https://steamcommunity.com/*"],
    types: ["xmlhttprequest"]
  }, ["blocking"]);


