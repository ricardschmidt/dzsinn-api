const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')

module.exports = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if(!authHeader)
		return res.status(401).json({error: {
			message: 'No token provided',
			userMessage: "Por favor faça seu login."
		}});

	const parts = authHeader.split(' ');
	if(parts.length !== 2)
		return res.status(401).json({error: {
			message: 'Token error',
			userMessage: "Token inválido, faça o login novamente"
		}});

	const [scheme, token] = parts;
	if(!/Bearer$/i.test(scheme))
		return res.status(401).json({error: {
			message: 'Token malformatted',
			userMessage: "Token inválido, faça o login novamente"
		}});

	jwt.verify(token, authConfig.secret, (err, decoded) => {
		if(err) return res.status(401).json({error: {
			message: 'Token invalid',
			userMessage: "Token inválido, faça o login novamente"
		}});

		let { id, roles } = decoded
		req.user = { id, roles }
		return next();
	})


}
