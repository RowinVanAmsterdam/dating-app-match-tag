const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const mongo = require("mongodb");

require("dotenv").config();

let db = null;
let url = process.env.MONGODB_URI;

mongo.MongoClient.connect(url, {
    useNewUrlParser: true
}, function (err, client) {
    if (err) throw err;
    db = client.db("DatingApp");
});

const upload = multer({
    dest: "static/upload/"
});

router
    .use(express.static("static"))
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .get("/droppedTags", get)
    .post("/droppedTags", upload.single("cover"), add)
    .get("/add", form)
    .get("/:id", finduser)
    .delete("/:id", remove);


function finduser(req, res, next) {
    let id = req.params.id;
    db.collection("pretparken").findOne({
        _id: mongo.ObjectID(id)
    }, done);

    function done(err, data) {
        if (err) {
            next(err);

        } else {
            res.render("detail.ejs", {
                data: data,
                user: req.session.user
            });
        }
    }
}

function get(req, res, next) {
    if (req.session.user) {
        db.collection("pretparken").find().toArray(done);

        function done(err, data) {
            if (err) {
                next(err);
            } else {
                res.render("droppedTags.ejs", {
                    data: data,
                    user: req.session.user
                });
            }
        }} else {
        res.status(404).render("credsrequired.ejs");
    }
}

function add(req, res, next) {
    db.collection("pretparken").insertOne({
        name: req.body.name,
        cover: req.file ? req.file.filename : null,
        age: req.body.age,
        pickupline: req.body.pickupline,
        description: req.body.description
    }, done);

    function done(err, data) {
        if (err) {
            next(err);
        } else {
            res.redirect("/" + data.insertedId);
        }
    }
}

function remove(req, res, next) {
    let id = req.params.id;
    db.collection("pretparken").deleteOne({
        _id: mongo.ObjectID(id)
    }, done);

    function done(err) {
        if (err) {
            next(err);
        } else {
            res.json({
                status: "ok"
            });
        }
    }
}

function form(req, res, next) {
    if (req.session.user) {
        let user = req.session.user;
        db.collection("members").findOne(user, done);

        function done(err, data) {
            if (err) {
                next(err);

            } else {
                res.render("add.ejs", {
                    data: data,
                    user: req.session.user
                });
            }
        }
    } else {
        res.status(401).render("credsrequired.ejs");
    }
}

module.exports = router;