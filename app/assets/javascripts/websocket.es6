'use strict';

(function (ns) {

	ns.Widgets = ns.Widgets || {};

	ns.WebSocketManager = function (channel) {
		let scheme = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
		const uri = `${scheme}${window.document.location.host}/cable`;
		const ws = new WebSocket(uri);

		const identifier = JSON.stringify({
			channel: 'EventChannel',
			event_id: channel
		});

		ws.onopen = function () {
			ws.send(JSON.stringify({
				command: 'subscribe',
				identifier: identifier
			}));
		};

		ws.onmessage = function (event) {
			const data = JSON.parse(event.data);

			if (data.type === 'ping' || data.type === 'welcome' || data.type === 'confirm_subscription') return;

			if (data.message) {
				const payload = data.message;
				if (payload.status == 'success') {
					Pard.Bus.trigger(payload.event, payload.model);
				}
			}
		};

		ws.onclose = function () {
			console.warn('Action Cable WebSocket closed. Attempting to reconnect...');
			setTimeout(function () {
				ns.WebSocketManager(channel);
			}, 5000);
		};
	}
	ns.EventSourceManager = function (channel) {

		const uri = `${window.location.protocol}//${window.document.location.host}?channel=${channel}&id=${Pard.Signature}`;
		const evtSource = new EventSource(uri);


		evtSource.onmessage = function (message) {
			const data = JSON.parse(message.data);
			console.log(data)
			if (data.status == 'success')
				Pard.Bus.trigger(data.event, data.model);
		}

	}

	ns.Widgets.GenerateUUID = function () {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	}

	ns.Signature = ns.Widgets.GenerateUUID();

}(Pard || {}));