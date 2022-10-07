var express = require('express');
var router = express.Router();
let alert = require('alert');


router.post('/', async function (req, res, next) {


    const preSaleStart = await MyContract.methods.preSaleStart().call({ from: accountAddress, gas: 1500000 })
    alert(preSaleStart)



});

module.exports = router;


