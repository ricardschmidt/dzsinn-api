const mongoose = require("mongoose")

const ObjectId = mongoose.Schema.ObjectId;

const EventSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		users: [{
			type: ObjectId,
			ref: "User"
		}],
		posts: [{
			type: ObjectId,
			ref: "Post"
		}],
		isActive: {
			type: Boolean,
			default: true,
		},
		subtitle: String,
	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model("Event", EventSchema)
