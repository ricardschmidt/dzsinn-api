class PurchasedPostError extends Error {
	constructor() {
		super(`This post has already been purchased`);
		this.status = 400
		this.name = this.constructor.name;
		this.userMessage = `Este post já foi comprado`
	}
}

module.exports = PurchasedPostError
