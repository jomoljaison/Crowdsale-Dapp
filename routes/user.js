var express = require('express');
var router = express.Router();
const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')
var Web3 = require("web3");
const web3 = new Web3('http://localhost:7545');
var database = require('../databasew');

/* GET home page. */
// router.get('/', function (req, res, next) {
//   res.render('user', { title: 'Express' });
// });

router.get("/", function (request, response, next) {

  var query = "SELECT * FROM whitelist ORDER BY id DESC";

  database.query(query, function (error, data) {

    if (error) {
      throw error;
    }
    else {
      let addressess = [];
      for (let singleAdd of data) {
        addressess.push(singleAdd.address)
      }
      const leaves = addressess.map(x => keccak256(x))
      console.log(leaves)



      const tree = new MerkleTree(leaves, keccak256, {
        sortPairs: true
      })
      const buf2hex = x => '0x' + x.toString("hex")

      const rootie = buf2hex(tree.getRoot())
      console.log("root-------------------", buf2hex(tree.getRoot()))


      const leaf = buf2hex(keccak256(addressess));
      console.log("leaf---------------------", leaf)



      let address = addressess[0]

      let hashedAddress = keccak256(address)
      let proof = tree.getHexProof(hashedAddress)
      console.log(proof)


      const leafd = buf2hex(keccak256(address))
      console.log("leaf---------------,", leafd)
      response.render('user', { proof });
    }

  });

});


module.exports = router;
