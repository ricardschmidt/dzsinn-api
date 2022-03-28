const routes = require("express").Router();
const multer = require('multer');
const multerConfig = require('./config/multer');
const authMiddleware = require('./app/middlewares/auth')

const EventController = require("./app/controllers/EventController")
const PostController = require("./app/controllers/PostController")
const UserController = require("./app/controllers/UserController")
const AuthController = require("./app/controllers/AuthController")

/* Endpoint sem autenticação */
routes.get("/users", UserController.find);
routes.get("/users/:id", UserController.findById);

routes.get("/posts", PostController.find);
routes.get("/posts/:username", PostController.findByUsername);
routes.get("/users/:id/posts", PostController.findByUserId);

routes.get("/events", EventController.find);
routes.get("/events/count/:id", EventController.countById);

/* Endpoints de Autenticação */
routes.post('/signup', AuthController.signup);
routes.post('/signin', AuthController.signin);

/* Endpoints com Autenticação */
routes.post('/auth-check', AuthController.authenticationCheck);

routes.post("/users", authMiddleware, UserController.create);
routes.post("/users/many", authMiddleware, UserController.createMany);
routes.put("/users", authMiddleware, UserController.updateById);
routes.put("/users/image", authMiddleware, multer(multerConfig).single('file'), UserController.updateImage);
routes.put("/users/password", authMiddleware, UserController.updatePassword);

routes.post("/posts", authMiddleware, multer(multerConfig).single('file'), PostController.create);
routes.put("/posts/:id", authMiddleware, multer(multerConfig).single('file'), PostController.updateById);
routes.put("/posts/buy/:id", authMiddleware, multer(multerConfig).single('file'), PostController.updateBought);
routes.delete("/posts/:id", authMiddleware, PostController.remove);

routes.use(function(req, res) {
	res.status(404).json({
		error: {
			type: "Route not found",
			message: "404 You're beyond the borders.",
			userMessage: "Ops... Essa rota não existe.",
			url: req.url,
		}
	})
})

module.exports = routes;
