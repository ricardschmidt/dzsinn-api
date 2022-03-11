require("dotenv").config()
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const { getMatch, getSort, getSelect } = require("../utils/queryUtils")
const { SUPER_USER } = require('../constants/Roles')

const PasswordError = require("../errors/PasswordError");
const UnauthorizedError = require("../errors/UnauthorizedError");

const s3 = new aws.S3();

const User = require("../models/User")
const bcrypt = require('bcryptjs');


class UserController {

	async create(req, res, next) {
		try {
			if(req.user.role !== SUPER_USER)
			throw new UnauthorizedError(SUPER_USER)

			let data = await User.create(req.body)
			return res.json(data)
		} catch (error) {
			next(error)
		}
	}

	async createMany(req, res, next) {
		try {
			if(req.user.role !== "ROLE_SUPER_USER")
			throw new UnauthorizedError()

			let data = await User.createMany(req.body)
			return res.json(data)
		} catch (error) {
			next(error)
		}
	}

	async find(req, res, next) {
		try {
			let {pageSize = 0, page = 0, sort, select, expand } = req.query
			let data = User.find(
				{...getMatch(req)}, getSelect(select)
				).sort(getSort(sort))
				.limit(pageSize)
				.skip(pageSize * page);
			return res.json(expand ? await data.populate('posts') : await data)
		} catch (error) {
			next(error)
		}
	}

	async findById(req, res, next) {
		try {
			let data = await User.findOne({_id: req.params.id}).populate('posts');
			return res.json(data)
		} catch(error) {
			next(error)
		}
	}

	async updateById(req, res, next) {
		try {
			let { name, username } = req.body
			let data = await User.findOne({_id: req.user.id});

			if(name)
			data.name = name
			if(username)
			data.username = username

			await data.save()

			return res.json(data)
		} catch(error) {
			next(error)
		}
	}

	async updatePassword(req, res, next) {
		const { password, currentPassword } = req.body
		try {
			let data = await User.findOne({_id : req.user.id}).select('+password')
			if(!await bcrypt.compare(currentPassword, data.password))
			throw new PasswordError('Invalid Password.', 'Senha incorreta.')

			data.password = password
			await data.save()

			return res.sendStatus(200)
		} catch (error) {
			next(error)
		}
	}

	async updateImage(req, res, next) {
		try {
			let { key, location: url = '' } = req.file
			let data = await User.findOne({_id : req.user.id}).populate("posts")

			if(data.image.key) {
				if(process.env.STORAGE_TYPE === 's3') {
					s3.deleteObject({
						Bucket: process.env.S3_BUCKET,
						Key: data.image.key,
					}).promise();
				} else {
					promisify(fs.unlink)(path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads', data.image.key));
				}
			}

			data.image = {
				url,
				key
			}

			await data.save()

			return res.json(data)
		} catch (error) {
			next(error)
		}
	}

	async count(req, res, next) {
		try {
			const count = await User.count({...getMatch(req)})
			return res.json(count)
		} catch (error) {
			next(error)
		}
	}

}

module.exports = new UserController();
