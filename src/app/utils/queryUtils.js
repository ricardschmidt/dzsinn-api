module.exports = {
	getMatch: (req) => {
		return Object.entries(req.query).reduce((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {});
	},

	getSort: (sort) => {
		let sortQuery = {}
		if(sort) sortQuery[sort.startsWith("-") ? sort.substring(1) : sort] = sort.startsWith("-") ? -1 : 1
		return sortQuery
	},

	getSelect: (select) => {
		let selectQuery = {}
		if(select){
			let data = select.split(',')
			for(var i = 0; i < data.length; i++) {
				selectQuery[data[i]] = 1
			}
		}
		return selectQuery
	}
}
