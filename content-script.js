browser.runtime.onMessage.addListener((request, sender) => {
	console.log('registered onMessage', { request, sender });

	// Check the action property in the request object
	if (request.action === 'requestData') {
		console.log('Received shared data:', request);
	}
});

function init() {
	console.log('init index.js');
}

init();
