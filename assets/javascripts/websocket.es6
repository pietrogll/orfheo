'use strict';

(function (ns) {

	ns.Widgets = ns.Widgets || {};

	// Action Cable migration: use the global consumer exposed by webpack
	if (window.ActionCableConsumer) {
		// The 'channel' arg from legacy calls (e.g. 'event', 'program') needs to map to
		// the actual Action Cable channel class name (e.g. 'EventChannel')
		const channelName = channel.charAt(0).toUpperCase() + channel.slice(1) + 'Channel';
		const channelParams = {
			channel: channelName,
			// Map 'id' param based on channel type
			[channel + '_id']: Pard.Signature
		};

		// For event channel, existing code passes actual event ID as arg to WebSocketManager
		// but creates a uuid signature. Let's look at how it was called:
		// Pard.WebSocketManager(the_event.id);
		// And legacy code: url?channel={channel}&id={Pard.Signature}
		//
		// Wait, the legacy code was:
		// ns.WebSocketManager = function(channel){ ... url?channel={channel}&id={Pard.Signature} ... }
		// BUT call site was: Pard.WebSocketManager(the_event.id);
		// This means 'channel' arg was actually the EVENT ID in the old code?
		//
		// Let's re-read the legacy code carefully:
		// const uri = `${scheme}${window.document.location.host}?channel=${channel}&id=${Pard.Signature}`;
		//
		// It seems the old code used 'channel' variable to hold the event ID?
		// Let's check e-manager.js: Pard.WebSocketManager(the_event.id);
		// Yes. So 'channel' was actually the event ID.
		// And the server 'channel' param was the event ID.
		//
		// In Action Cable:
		// EventChannel streams from "event:#{params[:event_id]}"
		// So we need to pass { channel: 'EventChannel', event_id: channel }

		window.ActionCableConsumer.subscriptions.create(
			{ channel: 'EventChannel', event_id: channel },
			{
				received(data) {
					console.log(data);
					if (data.status === 'success') {
						Pard.Bus.trigger(data.event, data.model);
					}
				}
			}
		);
	} else {
		console.error("ActionCableConsumer not found. Make sure cable.js is loaded.");
	}

	// Remove EventSourceManager as it was unused/fallback
	ns.EventSourceManager = function (channel) {
		console.log("EventSourceManager is deprecated and removed in favor of Action Cable.");
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