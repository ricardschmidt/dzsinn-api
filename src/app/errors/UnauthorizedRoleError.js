class UnauthorizedError extends Error {
	constructor(role) {
		super(`${role} authentication is necessary!`);
		this.status = 401
		this.name = this.constructor.name;
		this.userMessage = `É necessária autenticação ${role ? `de ${role}!` : '!'}`
	}
}

module.exports = UnauthorizedError
