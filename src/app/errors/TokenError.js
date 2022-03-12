class TokenError extends Error {
	constructor(message, userMessage) {
		super(message);
		this.status = 401
		this.name = this.constructor.name;
		this.userMessage = userMessage
	}
}

module.exports = TokenError
