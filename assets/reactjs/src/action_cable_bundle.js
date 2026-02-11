import { createConsumer } from '@rails/actioncable';

const consumer = createConsumer('/cable');

// Expose globally for legacy JS
window.ActionCableConsumer = consumer;

export default consumer;
