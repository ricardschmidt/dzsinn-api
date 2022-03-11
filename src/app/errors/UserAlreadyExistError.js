
class UserAlreadyExistError extends Error {
	constructor(message, userMessage) {
		super('User already exisit.');
		this.status = 409
		this.name = this.constructor.name;
		this.userMessage = 'Usuário já existe.'
	}
}

module.exports = UserAlreadyExistError
