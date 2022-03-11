const mongoose = require("mongoose")
const aws = require('aws-sdk');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const s3 = new aws.S3();
const ObjectId = mongoose.Schema.ObjectId;

const PostSchema = new mongoose.Schema(
	{
		user: {
			type: ObjectId,
			required: true,
			ref: "User"
		},
		event: {
			type: ObjectId,
			ref: "Event"
		},
		title: {
			type: String,
			required: true,
		},
		bought: {
			type: ObjectId,
			ref: "User"
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		subtitle: String,
		link: String,
		url: String,
		originalname: String,
		size: Number,
		key: String,
	},
	{
		timestamps: true
	}
)

PostSchema.pre('save', function() {
	if (!this.url) {
	  this.url = `${process.env.APP_URL}/files/${this.key}`;
	}
})

PostSchema.pre('remove', function() {
	if(process.env.STORAGE_TYPE === 's3') {
		return s3.deleteObject({
			Bucket: process.env.S3_BUCKET,
			Key: this.key,
		}).promise();
	} else {
		return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', '..', 'tmp', 'uploads', this.key));
	}
})

module.exports = mongoose.model("Post", PostSchema)
