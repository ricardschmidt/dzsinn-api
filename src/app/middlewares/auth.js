const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')

const TokenError = require('../errors/TokenError')

module.exports = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if(!authHeader)
	throw new TokenError("No token provided", "Por favor faça seu login.")

	const parts = authHeader.split(' ');
	if(parts.length !== 2)
	throw new TokenError("Token error", "Erro com o token.")

	const [scheme, token] = parts;
	if(!/Bearer$/i.test(scheme))
	throw new TokenError("Token malformatted", "Token mal formatado.")

	jwt.verify(token, authConfig.secret, (err, decoded) => {
		if(err)
		throw new TokenError("Token inválido", "Este token não é mais válido")

		let { id, roles } = decoded
		req.user = { id, roles }
		return next();
	})


}
