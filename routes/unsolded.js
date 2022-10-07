var express = require('express');
var router = express.Router();
let alert = require('alert');


router.post('/', async function (req, res, next) {


    const unsolded = await MyContract.methods.unsolded().call({ from: accountAddress, gas: 1500000 })
    alert(unsolded)



});

module.exports = router;


