const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

router.get("/", (req, res) => {
  Tag.findAll({ include: [{ model: Product }] })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: "Server error",
        err: err,
      });
    });
});

router.get("/:id", (req, res) => {
  Tag.findByPk(req.params.id, {
    include: [{ model: Product }],
  })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({
        msg: "Server error",
        error: error,
      });
    });
});

router.post("/", (req, res) => {
  Tag.create({
    tag_name: req.body.tag_name,
  })
    .then((data) => {
      res.status(201).json(data);
    })
    .catch((error) => {
      res.json({
        msg: "Server error",
        error: error,
      });
    });
});

router.put("/:id", (req, res) => {
  Tag.update(
    {
      tag_name: req.body.tag_name,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).json({
        msg: "Server error",
        error: error,
      });
    });
});

router.delete("/:id", (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((data) => {
      if (data) {
        return res.json(data);
      } else {
        return res.status(404).json({ msg: "Record does not exist" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: "Server error",
        err: err,
      });
    });
});

module.exports = router;
