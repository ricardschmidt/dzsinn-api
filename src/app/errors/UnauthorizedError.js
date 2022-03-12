class UnauthorizedError extends Error {
	constructor() {
		super(`Owner authentication is necessary!`);
		this.status = 401
		this.name = this.constructor.name;
		this.userMessage = `É necessária autenticação do proprietário!`
	}
}

module.exports = UnauthorizedError
