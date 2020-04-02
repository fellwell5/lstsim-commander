const express = require('express');
const router = express.Router();
const createError = require('http-errors');

const yaml = require('js-yaml');
const fs = require('fs');

router.get('/widgets', function(req, res, next){
    try {
      var doc = yaml.safeLoad(fs.readFileSync('widgets.yml', 'utf8'));
      res.json(doc);
    } catch (e) {
      console.log(e);
      next(createError(500));
    }
});

router.get('/layout', function(req, res, next){
    try {
      var doc = yaml.safeLoad(fs.readFileSync('layout.yml', 'utf8'));
      res.json(doc);
    } catch (e) {
      console.log(e);
      next(createError(500));
    }
});

module.exports = router;