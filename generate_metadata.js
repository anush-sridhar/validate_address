const fs = require('fs');
const path = require('path');

const metadataDir = path.join(__dirname, 'metadata');

for (let i = 1; i <= 500; i++) {
  const metadata = {
    name: `My Awesome NFT ${i}`,
    description: `This is NFT number ${i}`,
    image: `https://ipfs.io/ipfs/QmYneB3tPpbn246uh62MaedEqHPbakqKH14hckyzPcVCAU/nft-image-${i}.png`,
    attributes: [
      {
        trait_type: 'rarity',
        value: Math.floor(Math.random() * 101),
      },
    ],
  };

  fs.writeFileSync(path.join(metadataDir, `metadata-${i}.json`), JSON.stringify(metadata, null, 2));
}

console.log('Metadata files generated successfully!');
