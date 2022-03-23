const { getMatch, getSort, getSelect } = require("../utils/queryUtils")
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const UnauthorizedError = require("../errors/UnauthorizedError")
const PurchasedPostError = require("../errors/PurchasedPostError");

const Post = require("../models/Post")
const User = require("../models/User")
const Event = require("../models/Event");


class PostController {

	async create(req, res, next) {
		try {
			let { title, subtitle, link, eventId } = req.body;
			let {originalname, size, key, location: url = ''} = req.file;

			let event = await Event.findById(eventId)
			let user = await User.findById(req.user.id)

			let data = await Post.create( {
				title,
				subtitle,
				link,
				originalname,
				size,
				key,
				url,
				user: user._id,
				event: event
			})

			if(event) {
				event.posts.push(data)
				event.save()
			}

			user.posts.push(data)
			await user.save()

			return res.json(data)
		} catch (error) {
			console.log(error)
			next(error)
		}
	}

	async find(req, res, next) {
		try {
			let {pageSize = 0, page = 0, sort, select, expand, random } = req.query
			if(random) {
				Post.findRandom(
					{ bought: { $eq: null }},
					{},
					{limit: pageSize, populate: expand ? "user" : ""},
					function(err, results) {
						if (!err) {
						return res.json(results)
					}
				})
			} else {
				let data = Post.find(
					{...getMatch(req)}, getSelect(select)
					).sort(getSort(sort))
					.limit(pageSize)
					.skip(pageSize * page);
				return res.json(expand ? await data.populate('user') : await data)
			}
		} catch (error) {
			next(error)
		}
	}

	async findByUserId(req, res, next) {
		try {
			let data = await Post.find({user: req.params.id});
			return res.json(data)
		} catch(error) {
			next(error)
		}
	}

	async updateById(req, res, next) {
		try {
			let { title, subtitle, link, eventId } = req.body

			let event = await Event.findById(eventId)

			let data = await Post.findOne({_id: req.params.id});

			if(data.user.toString() !== req.user.id)
			throw new UnauthorizedError()

			if(title)
			data.title = title
			if(subtitle)
			data.subtitle = subtitle
			if(link)
			data.link = link
			if(event)
			data.evnet = event

			if(req.file) {
				if(data.key) {
					if(process.env.STORAGE_TYPE === 's3') {
						s3.deleteObject({
							Bucket: process.env.S3_BUCKET,
							Key: data.key,
						}).promise();
					} else {
						promisify(fs.unlink)(path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads', data.key));
					}
				}
				let {originalname, size, key, location: url = ''} = req.file;
				data.originalname = originalname
				data.size = size
				data.key = key
				data.url = url
			}

			if(event) {
				event.posts.push(data)
				event.save()
			}

			await data.save()

			return res.json(data)
		} catch(error) {
			next(error)
		}
	}

	async updateBought(req, res, next) {
		try {
			let post = await Post.findById(req.params.id)

			if(post.bought)
			throw new PurchasedPostError()

			post.bought = req.user.id
			await post.save()
			res.json(post)

		} catch (error) {
			next(error)
		}
	}

	async count(req, res, next) {
		try {
			const count = await Post.count({...getMatch(req)})
			return res.json(count)
		} catch (error) {
			next(error)
		}
	}

	async remove(req, res, next) {
		try {
			let user = await User.findById(req.user.id);
			const post = await Post.findById(req.params.id);

			user.posts.splice(user.posts.indexOf(post), 1);

			await user.save()
			await post.remove();

			return res.sendStatus(200);
		} catch (error) {
			next(error)
		}
	}

}

module.exports = new PostController();
