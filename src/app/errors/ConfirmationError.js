class ConfrimationError extends Error {
	constructor() {
		super(`Must be registered for current season`);
		this.status = 401
		this.name = this.constructor.name;
		this.userMessage = `É necessário estar inscrito na temporada atual para
		confirmar esta corrida.`
	}
}

module.exports = ConfrimationError
