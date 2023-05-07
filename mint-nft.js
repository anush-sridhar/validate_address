const contractABI = require("./build/contracts/MyNFT.json").abi;
const contractAddress = "0xe8744cCC2ABf94db1697DF3962a2611959c1d620";
const privateKey = "fb408ee5c716d8396c3b9cf99123869c1a1a3503aecc99b6d655eba7f8dd32a0";
const accountAddress = "0x64055c5f8F94B59DC44B468120Fc501c2dBC0451";
const recipientAddress = "0xFC8a5Db024429E21430c6e84134b6d8fD5890788";
const ipfsHash = "QmPkK3Zo1knipr5wdw6DxLfZxF6M1VrzwNikNpkbZabW86";

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3("https://polygon-mumbai.g.alchemy.com/v2/ViC0IaXShve-MJDBlq5pijbeG1r3oz7Z");

const contract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = async function (config, done) {
  try {
    const nonce = await web3.eth.getTransactionCount(accountAddress, 'latest'); //get latest nonce

    //the transaction
    const tx = {
      'from': accountAddress,
      'to': contractAddress,
      'nonce': nonce,
      'gas': 500000,
      'data': contract.methods.mintNFT(recipientAddress, `https://ipfs.io/ipfs/${ipfsHash}`).encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

    web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, hash) {
      if (!err) {
        console.log("The hash of your transaction is: ", hash, "\n Check on polygonscan.com");
      } else {
        console.log("Something went wrong when submitting your transaction:", err);
      }
      done(); // Call the done callback when your script is finished
    });
  } catch (err) {
    console.log("Promise failed:", err);
    done(); // Call the done callback when your script is finished
  }
};

