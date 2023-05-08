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

async function isTokenMinted(tokenId) {
  try {
    const owner = await nftContract.methods.ownerOf(tokenId).call();
    return true;
  } catch (error) {
    return false;
  }
}

async function mintNFT(recipient, tokenId) {
  const privateKey = process.env.MINTER_PRIVATE_KEY;
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  const tokenURI = `https://ipfs.io/ipfs/${folderCID}/metadata-${tokenId}.json`;

  const txData = nftContract.methods.mintNFT(recipient, tokenId).encodeABI();
  console.log(`got txData: ${txData}`);
  const gasEstimate = await nftContract.methods.mintNFT(recipient, tokenId).estimateGas();
  const transaction = { to: contractAddress, data: txData, gas: gasEstimate };
  const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
  const txReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

  return txReceipt;
}

async function getData(url) {
  try {
    const response = await fetch(url);
    if (!response || !response.ok) {
      console.error(`Error fetching data: ${response}`);
      return;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in getData: ${error}`);
    return;
  }
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
    } while (mintedTokens.has(nextTokenId) || await isTokenMinted(nextTokenId));
    mintedTokens.add(nextTokenId);

    console.log("Minting NFT with token ID:", nextTokenId);
    const txReceipt = await mintNFT(recipient, nextTokenId);
    console.log(`Minting successful, retrieving metadata for txReceipt: ${txReceipt}`);
    const metadataURL = `https://ipfs.io/ipfs/${folderCID}/metadata-${nextTokenId}.json`;
    console.log("Metadata URL:", metadataURL);

    const nftMetadata = await getData(metadataURL);

    if (!nftMetadata) {
      console.log("Metadata not available");
      res.status(500).send("Metadata not available");
      return;
    }

    console.log("NFT metadata:", nftMetadata);

    res.status(200).send({ tokenId: nextTokenId, metadata: nftMetadata, txReceipt });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send(`got /mint error: ${error}`);
  }
});

app.post('/getRes', async (req, res) =>{
  try {
    const url = req.body.url;
    const res = await axios.getData(url);
    const data = res.json();
    console.log(`got res: ${data}`);
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send(`got /getRes error: ${error}`);
  }
});



module.exports = app;