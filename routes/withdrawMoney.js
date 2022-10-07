var express = require('express');
var router = express.Router();
let alert = require('alert');


router.post('/', function (req, res, next) {


  MyContract.methods.withdrawMoney().send({ from: accountAddress, gas: 1500000 }).on('transactionHash', (hash) => {

    res.send("ETH is successfully credited in Owner account");

  }).on('error', (error) => {
    console.log(error.message);
    alert("Sorry you dont not have  💰️");

  });

});

module.exports = router;


