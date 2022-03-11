const { getMatch, getSort, getSelect } = require("../utils/queryUtils")

const Event = require("../models/Event")


class EventController {

	async create(req, res, next) {
		try {
			let data = await Event.create(req.body)
			return res.json(data)
		} catch (error) {
			next(error)
		}
	}

	async find(req, res, next) {
		try {
			let {pageSize = 0, page = 0, sort, select, expand } = req.query
			let data = Event.find(
				{...getMatch(req)}, getSelect(select)
				).sort(getSort(sort))
				.limit(pageSize)
				.skip(pageSize * page);
			return res.json(expand ? await data.populate('posts') : await data)
		} catch (error) {
			next(error)
		}
	}

	async updateById(req, res, next) {
		try {
			let { name, date, subtitle } = req.body
			let data = await Event.findOne({_id: req.user.id});
			data.name = name
			data.date = date
			data.subtitle = subtitle

			await data.save()

			return res.json(data)
		} catch(error) {
			next(error)
		}
	}

	async count(req, res, next) {
		try {
			const count = await Event.count({...getMatch(req)})
			return res.json(count)
		} catch (error) {
			next(error)
		}
	}

	async countById(req, res, next) {
		try {
			const count = await Event.count({ users: { $in : req.params.id }})
			return res.json(count)
		} catch (error) {
			next(error)
		}
	}

}

module.exports = new EventController();
