var express = require('express');
var router = express.Router();

var Web3 = require("web3");
const web3 = new Web3('http://localhost:7545');

let alert = require('alert');


router.post('/', function (req, res, next) {

    // function mint(
    //     uint256 id,
    //     uint256 count,
    //     bytes32[] calldata proof


    // data = req.body;

    count = req.body.count;
    console.log(count);



    // ads, amt
    ads = req.body.ads;
    console.log("address of user", ads);

    amt = req.body.amt;
    console.log(amt);


    // var passArray = contract.passArray(otherNumbers);
    //count,ads,amt
    MyContract.methods.publicSaleMintWithEth(count).send({ from: ads, gas: 6000000, value: Web3.utils.toWei(amt, 'ether') }).on('transactionHash', (hash) => {

        console.log("Lets go", hash);
        res.send("Congratulations");
    }).on('error', (error) => {
        console.log(error.message);
        alert("Sale is not Active  🙅️");
    });






});



module.exports = router;

