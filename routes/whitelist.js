
var express = require('express');

var router = express.Router();

const keccak256 = require('keccak256')

const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')


var Web3 = require("web3");
const web3 = new Web3('http://localhost:7545');


var database = require('../databasew');

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
			response.render('whitelist', { title: 'Node.js MySQL CRUD Application', action: 'list', sampleData: data, rootie, proof, leafd, message: request.flash('success') });
		}

	});

});






router.get("/add", function (request, response, next) {

	response.render("whitelist", { action: 'add' });

});

router.post("/add_whitelist", function (request, response, next) {

	var address = request.body.address;


	// MyContract.methods.setWhitelistRoot(web3.utils.asciiToHex(address)).send({from:accountAddress, gas : 3000000})
	//   .then((txn) => {
	// 	  res.send(txn);
	//   })




	var query = `
	INSERT INTO whitelist 
	(address) 
	VALUES ("${address}")
	`;

	database.query(query, function (error, data) {

		if (error) {
			throw error;
		}
		else {
			request.flash('success', 'Address Inserted');
			response.redirect("/whitelist");
		}

	});

});

router.get('/edit/:id', function (request, response, next) {

	var id = request.params.id;

	var query = `SELECT * FROM whitelist WHERE id = "${id}"`;

	database.query(query, function (error, data) {

		response.render('whitelist', { title: 'Edit MySQL Table Data', action: 'edit', sampleData: data[0] });

	});

});

router.post('/edit/:id', function (request, response, next) {

	var id = request.params.id;

	var address = request.body.address;


	var query = `
	UPDATE whitelist 
	SET address = "${address}"
	
	`;

	database.query(query, function (error, data) {

		if (error) {
			throw error;
		}
		else {
			request.flash('success', 'Address Updated');
			response.redirect('/whitelist');
		}

	});

});

router.get('/delete/:id', function (request, response, next) {

	var id = request.params.id;

	var query = `
	DELETE FROM whitelist WHERE id = "${id}"
	`;

	database.query(query, function (error, data) {

		if (error) {
			throw error;
		}
		else {
			request.flash('success', 'Address Deleted');
			response.redirect("/whitelist");
		}

	});

});

module.exports = router;
