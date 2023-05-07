const axios = require("axios");

const metadataCIDs = [
  "QmXdQU3TinPpbyj2hgVBYRJiXAp9K2TkvfrmwWaLayydc5",
  "QmdCoBjuewcNn3wSbBQWNM5idBwzZYpqVonWqGxVHQiLoz",
  // ...
  // Add all the metadata CIDs in the array
  // ...
  "QmUibAMBR3Grch5H4GnSfC2pYMdopi1wEkqZr3e6gYFVUN",
  "QmXwjRhfo3auE6ZAVw8cModYeDY39kHW2crwgo3hqCGJsf",
];

async function mintAllNFTs(recipientAddress) {
  for (let tokenId = 1; tokenId <= metadataCIDs.length; tokenId++) {
    try {
      const response = await axios.post("http://localhost:3000/mint", {
        recipient: recipientAddress, // Use the recipient address passed to the function
        tokenId: tokenId,
      });

      console.log(`Minted NFT with token ID: ${response.data.tokenId}`);
    } catch (error) {
      console.error(`Error minting NFT for token ID ${tokenId}:`, error.message);
    }
  }
}

// Example usage of the function:
const validatedAddress = "0x123..."; // Replace this with the actual address collected from the participant
mintAllNFTs(validatedAddress);

