const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

router.get("/", (req, res) => {
  Product.findAll({
    include: [{ model: Category }, { model: Tag, through: ProductTag }],
  })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: "an error occurred",
        err: err,
      });
    });
});

router.get("/:id", (req, res) => {
  Product.findByPk(req.params.id, {
    include: [{ model: Category }, { model: Tag, through: ProductTag }],
  })
    .then((data) => {
      if (data) {
        return res.json(data);
      } else {
        res.status(404).json({
          msg: "no such record",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        msg: "an error occurred",
        err: err,
      });
    });
});

router.post("/", (req, res) => {
  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put("/:id", (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete("/:id", (req, res) => {
  Product.destroy({
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
