
const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")

// List of 7 public Ethereum addresses
let addresses = [
    "0x...",
    // ...
]
// Hash addresses to get the leaves
let leaves = addresses.map(addr => keccak256(addr))

// Create tree
let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
// Get root
let rootHash = merkleTree.getRoot().toString('hex')

// Pretty-print tree
console.log(merkleTree.toString())

// -- This code is below the previous code since we use some of the other variables --

// 'Serverside' code
let address = addresses[0]
let hashedAddress = keccak256(address)
let proof = merkleTree.getHexProof(hashedAddress)
console.log(proof)

// Check proof
let v = merkleTree.verify(proof, hashedAddress, rootHash)
console.log(v) // returns true