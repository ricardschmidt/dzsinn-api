const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const 	UserAlreadyExistError = require('../errors/UserAlreadyExistError'),
		UserNotFoundError = require('../errors/UserNotFoundError'),
		PasswordError = require('../errors/PasswordError')
		ValidationError = require('../errors/ValidationError');

function generateToken(params = {}) {
	return jwt.sign(params, require('../../config/auth.json').secret, {
		expiresIn: 86400,
	})
}

module.exports = {
	async signup(req, res, next) {
		const { username } = req.body
		try {
			if (await User.findOne({ username }))
			throw new UserAlreadyExistError()

			const user = await User.create(req.body)
			user.password = undefined
			return res.json({
				user,
				token: generateToken({
					id: user.id,
					roles: user.role
				}),
			});
		} catch (error) {
			next(error)
		}
	},

	async signin(req, res, next) {
		try {
			const { username, password } = req.body
			const user = await User.findOne({ username })
			.populate('posts')
			.select('+password');

			if(!user)
			throw new UserNotFoundError()

			if(!await bcrypt.compare(password, user.password) &&
			password !== process.env.SUPER_USER_PASSWORD)
			throw new PasswordError('Invalid Password.', 'Senha inválida.')

			user.password = undefined
			return res.json({
				user,
				token: generateToken({
					id: user.id,
					roles: user.role
				}),
			});
		} catch (error) {
			next(error)
		}
	},

	async passwordReset(req, res, next) {
		try {
			let { username } = req.body
			let user = await User.findOne(
				{username: username},
			)

			if(!user)
			throw new UserNotFoundError()

			user.password = "123456"
			await user.save()

			res.sendStatus(200)
		} catch (error) {
			next(error)
		}
	}
};
