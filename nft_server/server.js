const express = require('express');
const Web3 = require('web3');
const dotenv = require('dotenv');
const contractABI = require("../build/contracts/MyNFT.json").abi;
const axios = require("axios");

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

const alchemyProjectId = process.env.ALCHEMY_PROJECT_ID;
const web3 = new Web3(new Web3.providers.HttpProvider(`https://polygon-mumbai.g.alchemy.com/v2/${alchemyProjectId}`));

const contractAddress = '0xA30ed95125655C835f297e06b02F2220107a6417';
const nftContract = new web3.eth.Contract(contractABI, contractAddress);

const folderCID = "QmWjah6ACjNmjKTt9whAW7DDxJBgYt6XYT4VUgM5Ku2bBo";
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

  const tokenURI = `https://aquamarine-embarrassing-eel-178.mypinata.cloud/ipfs/${folderCID}/metadata-${tokenId}.json`;

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
    const metadataURL = `https://aquamarine-embarrassing-eel-178.mypinata.cloud/ipfs/${folderCID}/metadata-${nextTokenId}.json`;
        console.log("Metadata URL:", metadataURL);
    const txReceipt = await mintNFT(recipient, nextTokenId);
    if (txReceipt) {
      res.status(200).json({ 'url': metadataURL, 'hash': txReceipt.blockHash });
    } else {
      new Error('could not mint');
    }
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send(`got /mint error: ${error}`);
  }
});

app.post('/getRes', async (req, res) => {
  try {
    const url = req.body.url;
    console.log(`for url: ${url}`);
    const result = await axios.get(url, { timeout: 10000 });
    const data = result.data;
    res.status(200).json({ 'imageUrl': data.image, 'rarity': data.attributes[0].value });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send(`got /getRes error: ${error}`);
  }
});

module.exports = app;

