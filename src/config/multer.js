const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const ValidationError = require("../app/errors/ValidationError")

const storegeTypes = {
	local: multer.diskStorage({
		destination: (req, file, next) => {
			next(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
		},
		filename: (req, file, next) => {
		crypto.randomBytes(16, (err, hash) => {
			if(err) next(err);
			file.key = `${hash.toString('hex')}-${file.originalname}`;
			next(null, file.key)
		})
		},
	}),
	s3: multerS3({
		s3: new aws.S3(),
		bucket: process.env.S3_BUCKET,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: 'public-read',
		key: (req, file, cb) => {
			crypto.randomBytes(16, (err, hash) => {
				if(err) cb(err);
				file.key = `dzsinn/posts/${hash.toString('hex')}-${file.originalname}`;
				cb(null, file.key)
			})
		}
	})
}


module.exports = {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: storegeTypes[process.env.STORAGE_TYPE] ,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, next) => {
    const allowedMimes = [
		'image/jpeg',
		'image/pjpeg',
		'image/png',
		'image/gif',
		'image/webp',
    ];

    if(allowedMimes.includes(file.mimetype)) {
		next(null, true);
    } else {
		next(new ValidationError('Invalid file type.'))
    }
  }
};
