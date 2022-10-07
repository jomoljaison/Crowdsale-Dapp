var express = require('express');
var router = express.Router();

var Web3 = require("web3");
const web3 = new Web3('http://localhost:7545');
let alert = require('alert');

router.post('/', async function (req, res, next) {
    data = req.body;
    console.log("inside the setLand", data);

    MyContract.methods.setWhitelistRoot(data.setWhitelistRoot)
        .send({ from: accountAddress })
        .then((txn) => {
            res.send(txn);
            console.log(txn)
        }).catch(err => {
            res.json({ error: err });
        })

});

module.exports = router;

