const express = require('express');
const Web3 = require('web3');
const dotenv = require('dotenv');
const contractABI = require("../build/contracts/MyNFT.json").abi;
const axios = require("axios");
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*'
}));

const alchemyProjectId = process.env.ALCHEMY_PROJECT_ID;
const web3 = new Web3(new Web3.providers.HttpProvider(`https://polygon-mumbai.g.alchemy.com/v2/${alchemyProjectId}`));

const contractAddress = '0xA30ed95125655C835f297e06b02F2220107a6417';
const nftContract = new web3.eth.Contract(contractABI, contractAddress);

const folderCID = "Qmb5dU98fjdLbTZYMJEctZKSufq8895yFiZkms7VgEbyCf";
const numberOfNFTs = 500;

let mintedTokens = new Set();

async function mintNFT(recipient, tokenId) {
  const privateKey = process.env.MINTER_PRIVATE_KEY;
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  const tokenURI = `https://ipfs.io/ipfs/${folderCID}/metadata-${tokenId}.json`;

  const txData = nftContract.methods.mintNFT(recipient, tokenId).encodeABI();
  const gasEstimate = await nftContract.methods.mintNFT(recipient, tokenId).estimateGas();
  const transaction = { to: contractAddress, data: txData, gas: gasEstimate };
  const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
  const txReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

  return txReceipt;
}

app.post("/mint", async (req, res) => {
  try {
    const recipient = req.body.recipient;

    if (!recipient) {
      res.status(400).send("Please provide a recipient address.");
      return;
    }

    let nextTokenId;
    do {
      nextTokenId = Math.floor(Math.random() * numberOfNFTs) + 1;
    } while (mintedTokens.has(nextTokenId));
    mintedTokens.add(nextTokenId);

    console.log("Minting NFT with token ID:", nextTokenId);
    const txReceipt = await mintNFT(recipient, nextTokenId);
    console.log("Minting successful, retrieving metadata...");
    const metadataURL = `https://ipfs.io/ipfs/${folderCID}/metadata-${nextTokenId}.json`;
    console.log("Metadata URL:", metadataURL);

    const metadataResponse = await axios.get(metadataURL, { timeout: 10000 });

    if (!metadataResponse.data) {
      console.log("Metadata not available:", metadataResponse.statusText);
      res.status(500).send("Metadata not available");
      return;
    }

    const nftMetadata = metadataResponse.data;
    console.log("NFT metadata:", nftMetadata);

    res.status(200).send({ tokenId: nextTokenId, metadata: nftMetadata, txReceipt });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send(error.message);
  }
});

module.exports = app;