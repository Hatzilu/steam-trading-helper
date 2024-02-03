import {arrayBufferToString, concatenateArrayBuffers } from './lib/buffer.js'
/**
 * 
 * @param {Element} elem 
 */
function doubleClick(elem) {
    elem.dispatchEvent(new Event("dblclick", {bubbles: true}));
}

let inventoryResponse;

const timer = setInterval(() =>{
    if (inventoryResponse && inventoryResponse?.success) {
        clearInterval(timer)

     }
    
    }, 2000)


function logURL(details) {
    console.log({details})
    if (!details.url.includes('/inventory/json/')) return;
    document.body.style.border = "5px solid red";

    let filter = browser.webRequest.filterResponseData(details.requestId)
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


