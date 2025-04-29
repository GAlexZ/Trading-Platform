// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PokemonCard
 * @dev ERC721 token representing Pokemon cards with IPFS metadata
 */
contract PokemonCard is ERC721, ERC721URIStorage, Ownable {
    
    // Token ID counter for sequential IDs
    uint256 private _nextTokenId;
    
    // Pokemon card struct to store on-chain data
    struct Pokemon {
        string name;        
        uint8 generation;   
        string pokemonType; 
        uint16 power;       
        uint8 rarity;
        bool isShiny; 
    }
    
    // Mapping from token ID to Pokemon data
    mapping(uint256 => Pokemon) public pokemonData;
    
    // Event emitted when a new Pokemon card is minted
    event PokemonMinted(address indexed to, uint256 indexed tokenId, string name, string pokemonType);
    
    /**
     * @dev Constructor initializes the ERC721 token with name and symbol
     */
    constructor() ERC721("PokemonCard", "PKMN") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new Pokemon card (admin only)
     * @param to Address to mint the token to
     * @param name Pokemon name
     * @param generation Pokemon generation (1-9)
     * @param pokemonType Pokemon type (Fire, Water, etc.)
     * @param power Pokemon power level
     * @param isShiny Whether the Pokemon is shiny or not
     * @param ipfsMetadataURI IPFS URI for the token's metadata (image, attributes, etc.)
     */
    function mintPokemon(
        address to,
        string memory name,
        uint8 generation,
        string memory pokemonType,
        uint16 power,
        uint8 rarity,
        bool isShiny,
        string memory ipfsMetadataURI
    ) public onlyOwner returns (uint256) {
        // Input validation
        require(bytes(name).length > 0, "Pokemon name cannot be empty");
        require(generation > 0 && generation <= 9, "Invalid generation");
        require(bytes(pokemonType).length > 0, "Pokemon type cannot be empty");
        require(bytes(ipfsMetadataURI).length > 0, "IPFS URI cannot be empty");
        
        // Get current token ID and increment for next mint
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        // Store Pokemon data on-chain
        pokemonData[tokenId] = Pokemon({
            name: name,
            generation: generation,
            pokemonType: pokemonType,
            power: power,
            rarity: rarity,
            isShiny: isShiny
        });
        
        // Mint the token
        _safeMint(to, tokenId);
        
        // Set token URI (IPFS link)
        _setTokenURI(tokenId, ipfsMetadataURI);
        
        // Emit event
        emit PokemonMinted(to, tokenId, name, pokemonType);
        
        return tokenId;
    }
    
    /**
     * @dev Get details about a Pokemon card
     * @param tokenId Token ID to query
     */
    function getPokemonDetails(uint256 tokenId) public view returns (Pokemon memory) {
         require(ownerOf(tokenId) != address(0), "Pokemon: query for nonexistent token");
        return pokemonData[tokenId];
    }
    
    // Required overrides for ERC721URIStorage
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}