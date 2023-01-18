const express = require("express");
const productRoutes = express.Router();
const dbo = require("../db/conn");

const ObjectId = require("mongodb").ObjectId;

productRoutes.route("/products").get(async function (req, res) {
  try {
    let db_connect = dbo.getDb("storage");
    db_connect.collection("products").find({}).toArray(function (err, result) {
      res.json(result);
    });
  } catch (err) {throw err;}
});

productRoutes.route("/products").post(async function (req, res) {
  let db_connect = dbo.getDb("storage");
  let newProduct = {
    nazwa: req.body.nazwa,
    cena: req.body.cena,
    opis: req.body.opis,
    ilosc: req.body.ilosc,
  };
  try {
    db_connect.collection("products").insertOne(newProduct, function (err, res1) {
      res.json(res1);
    });
  } catch (err) {throw err;}
});

productRoutes.route("/products/:id").put(async function (req, res) {
  let db_connect = dbo.getDb("storage");
  let newProduct = {
    $set: {
      nazwa: req.body.nazwa,
      cena: req.body.cena,
      opis: req.body.opis,
      ilosc: req.body.ilosc,
    },
  };

  try {
    db_connect.collection("products").updateOne({ _id: ObjectId(req.params.id) }, newProduct, function (err, res1) {
        res.json(res1);
      });
  } catch (err) {throw err;}
});

productRoutes.route("/products/:id").delete(async function (req, res) {
  let db_connect = dbo.getDb("storage");
  try {
    db_connect.collection("products").deleteOne({ _id: ObjectId(req.params.id) }, function (err, obj) {
      if (obj.deletedCount == 1) {
        res.json("1 document deleted");
      } else {
        try {
          if (obj.acknowledged == false || obj.deletedCount == 0) throw "Usunięcie nieudane";
        } catch (err) {res.json(err);}
      }
    });
  } catch (err) {throw err;}
});

productRoutes.route("/products/sort").get(async function (req, res) {
  let db_connect = dbo.getDb("storage");
  if (req.body.nazwa === "true") {
    try {
      db_connect.collection("products").find({}).sort({ nazwa: 1 }).toArray(function (err, result) {
          res.json(result);
        });
    } catch (err) {throw err;}
  }
  if (req.body.cena === "true") {
    try {
      db_connect.collection("products").find({}).sort({ cena: 1 }).toArray(function (err, result) {
          res.json(result);
        });
    } catch (err) {throw err;}
  }
  if (req.body.ilosc === "true") {
    try {
      db_connect.collection("products").find({}).sort({ ilosc: 1 }).toArray(function (err, result) {
          res.json(result);
        });
    } catch (err) {throw err;}
  }
  if (req.body.nazwa != "true" && req.body.cena != "true" && req.body.ilosc != "true") {
    res.json("Nie podano sortowania!");
  }
});

productRoutes.route("/products/raport").get(async function (req, res) {
  let db_connect = dbo.getDb("storage");
  if (req.body.ilosc === "true") {
    try {
      db_connect.collection("products")
        .aggregate([{ $group: { _id: "$nazwa", ilosc: { $sum: "$ilosc" } } }]).toArray(function (err, result) {
          res.send(result);
        });
    } catch (err) {throw err;}
  }

  if (req.body.wartosc === "true") {
    try {
      db_connect.collection("products")
        .aggregate([{$group: {_id: 0,totalAmount: { $sum: { $multiply: ["$ilosc", "$cena"] } },},},]).toArray(function (err, result) {
          res.send(result);
        });
    } catch (err) {throw err;}
  }
  if (req.body.wartosc != "true" &&  req.body.ilosc != "true") {
    res.json("Nie podano zmiennej!");
  }
});

module.exports = productRoutes;
