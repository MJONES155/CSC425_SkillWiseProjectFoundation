// Security events emitter for reactive hooks (e.g., alerting, metrics)
const { EventEmitter } = require('events');

const securityEvents = new EventEmitter();

// Event documentation:
// 'invalid-login' payload: { email, reason, timestamp, attempts }
// 'account-lockout' payload: { email, reason, timestamp }

module.exports = securityEvents;
