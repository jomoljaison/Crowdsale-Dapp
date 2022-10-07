var express = require('express');
var router = express.Router();

var Web3 = require("web3");
const web3 = new Web3('http://localhost:7545');
var alert = require('alert');



router.post('/', function (req, res, next) {

    // function mint(
    //     uint256 id,
    //     uint256 count,
    //     bytes32[] calldata proof


    // data = req.body;
    id = req.body.id;
    console.log(id);

    count = req.body.count;
    console.log(count);

    proof = req.body.proof;
    console.log("proof", proof);

    // ads, amt
    ads = req.body.ads;
    console.log("address of user", ads);

    amt = req.body.amt;
    console.log(amt);

    var temp = proof.split(",");
    var temp_proof = [];
    for (var ttt of temp) {
        temp_proof.push(ttt)
    }
    var otherNumbers = temp_proof;

    // var passArray = contract.passArray(otherNumbers);

    var resp = MyContract.methods.mint(id, count, otherNumbers).send({ from: ads, gas: 6000000, value: Web3.utils.toWei(amt, 'ether') }).on('transactionHash', (hash) => {
        console.log("lets go", hash);
        res.send("Congratulations");
        console.log(resp)

    }).on('error', (error) => {
        console.log(error.message);
        alert("something wrong  🙅️");

    });






});



module.exports = router;









