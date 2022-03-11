
class UserNotFoundError extends Error {
	constructor() {
		super('User not found.');
		this.status = 401
		this.name = this.constructor.name;
		this.userMessage = 'Usuário não encontrado.'
	}
}

module.exports = UserNotFoundError
