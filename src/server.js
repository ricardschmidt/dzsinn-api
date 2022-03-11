require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const morgan = require("morgan")
const cors = require("cors")
const path = require('path');

class App {
	constructor() {
		this.express = express();
		this.database();
		this.middlewares();
		this.routes();

		this.express.listen(process.env.PORT || 3000)
	}

	database() {
		mongoose.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
	}

	middlewares() {
		this.express.use(cors())
		this.express.use(express.json())
		this.express.use(express.urlencoded({ extended: true }))
		this.express.use(morgan('dev'))
		this.express.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')));
	}

	errorHandler(err, req, res, next) {
		if(err.message.includes('E11000 duplicate key error collection')) {
			err.status = 409
			err.userMessage = `Erro de duplicidade, por favor alterar o campo ${JSON.stringify(err.keyValue)}`
		} else if(err.message.includes('Invalid file type.')) {
			err.status = 400
			err.userMessage = `Por favor inserir arquivo .jpeg, .pjpeg, .png ou .gif!`
		} else if(err.code === "LIMIT_FILE_SIZE") {
			err.status = 400
			err.userMessage = `Por favor inserir arquivo com menos de 5MB`
		}

		res.status(err.status ? err.status : 500).json({
			error: {
				name: err.name,
				message: err.message,
				userMessage: err.userMessage ? err.userMessage : "Erro inesperado tente novamente mais tarde",
				url: req.url,
				stack: err.stack
			}
		});
	}

	routes() {
		this.express.use(require("./routes"))
		this.express.use(this.errorHandler);
	}
}

module.exports = new App().express
