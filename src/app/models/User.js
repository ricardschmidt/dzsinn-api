const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

const { USER } = require('../constants/Roles')

const ObjectId = mongoose.Schema.ObjectId;

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		name: {
			type: String,
			required: true,
		},
		posts: [{
			type: ObjectId,
			ref: "Post",
			default: [],
		}],
		role: {
			type: String,
			default: USER
		},
		image: {
			url: String,
			key: String,
		}
	},
	{
		timestamps: true
	}
)

UserSchema.pre('save', async function (next) {
	if (!this.url) {
		this.image.url = `${process.env.APP_URL}/files/${this.image.key}`;
	}
	if (this.password) {
		const hash = await bcrypt.hash(this.password, 10);
		this.password = hash;
	}
	next();
})

module.exports = mongoose.model("User", UserSchema)
