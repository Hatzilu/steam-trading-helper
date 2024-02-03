// setTimeout(() => window.g_ActiveInventory.rgItemElements,2500)
// console.log(window)
// console.log({inventory: window.g_ActiveInventory})

// for (var name in window) {
//     if (name.startsWith('g')) {
//         console.log('window.',name);
//     }
// }
// const timer = setInterval(() =>{
//     if (inventoryResponse && inventoryResponse?.success) {
//         clearInterval(timer)
//         console.log({inventoryResponse});
//      }

//     }, 2000)
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log({ request, sender });
	if (request.action === 'getSharedData') {
		// Send the shared data to the content script
		//   sendResponse({ data: sharedData });
	}
});
