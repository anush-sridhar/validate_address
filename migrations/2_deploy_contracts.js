const MyNFT = artifacts.require("MyNFT");

module.exports = function (deployer) {
  // Replace "FOLDER_CID" with the CID of the folder containing all metadata files
  deployer.deploy(MyNFT, "https://ipfs.io/ipfs/Qmb5dU98fjdLbTZYMJEctZKSufq8895yFiZkms7VgEbyCf/");
};
