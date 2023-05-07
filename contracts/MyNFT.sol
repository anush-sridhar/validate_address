// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@opensea/ledger-reusable/contracts/interfaces/IOwnableEnumerable.sol";

contract MyNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string private _baseURI;

    constructor(string memory baseURI) ERC721("MyNFT", "MNFT") {
        _baseURI = baseURI;
    }

    function setBaseURI(string memory baseURI) public {
        _baseURI = baseURI;
    }

    function mintNFT(address recipient, uint256 tokenId) public returns (uint256) {
        _mint(recipient, tokenId);
        IOwnableEnumerable(0x58807baD0B376efc12F6C13Af6eF2A3fA6Bc38C3).transferOwnership(msg.sender, tokenId);
        return tokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURI;
    }
}
