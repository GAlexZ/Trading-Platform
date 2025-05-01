// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PokemonCard
 * @dev ERC721 token representing Pokemon cards with IPFS metadata
 * Includes enumeration for easier token listing
 */
contract PokemonCard is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    
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
    
    // Array to store all token IDs (for easier enumeration)
    uint256[] private _allTokens;
    
    // Event emitted when a new Pokemon card is minted
    event PokemonMinted(address indexed to, uint256 indexed tokenId, string name, string pokemonType);
    
    // Event emitted when a Pokemon card is burned
    event PokemonBurned(address indexed burner, uint256 indexed tokenId, string name);
    
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
     * @param rarity Pokemon rarity level (1-5)
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
        require(rarity > 0 && rarity <= 5, "Rarity must be between 1 and 5");
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
     * @dev Burn a Pokemon card
     * @param tokenId Token ID to burn
     */
    function burnPokemon(uint256 tokenId) public {
        // Check that the contract owner
        address owner = ownerOf(tokenId);
        require(
            owner == _msgSender(),
            "PokemonCard: caller is not owner or admin"
        );
        
        // Store the name before burning
        string memory name = pokemonData[tokenId].name;
        
        // Delete the Pokemon data
        delete pokemonData[tokenId];
        
        // Burn the token
        _burn(tokenId);
        
        // Emit event
        emit PokemonBurned(_msgSender(), tokenId, name);
    }
    
    /**
     * @dev Get details about a Pokemon card
     * @param tokenId Token ID to query
     */
    function getPokemonDetails(uint256 tokenId) public view returns (Pokemon memory) {
        require(_exists(tokenId), "Pokemon: query for nonexistent token");
        return pokemonData[tokenId];
    }
    
    /**
     * @dev Get all Pokemon cards owned by an address with details
     * @param owner Address to query
     * @return Array of token IDs and their associated Pokemon details
     */
    function getAllPokemonByOwner(address owner) external view returns (uint256[] memory, Pokemon[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        Pokemon[] memory pokemons = new Pokemon[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            tokenIds[i] = tokenId;
            pokemons[i] = pokemonData[tokenId];
        }
        
        return (tokenIds, pokemons);
    }
    
    /**
     * @dev Get a batch of Pokemon details for multiple token IDs
     * @param tokenIds Array of token IDs to query
     * @return Array of Pokemon details
     */
    function batchGetPokemonDetails(uint256[] calldata tokenIds) external view returns (Pokemon[] memory) {
        Pokemon[] memory result = new Pokemon[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_exists(tokenIds[i]), "Pokemon: query for nonexistent token");
            result[i] = pokemonData[tokenIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Get the total number of tokens minted
     */
    function getTotalMinted() external view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Get a page of Pokemon cards (for frontend pagination)
     * @param offset Starting index
     * @param limit Maximum number of items to return
     * @return tokenIds Array of token IDs
     * @return owners Array of owner addresses
     * @return details Array of Pokemon details
     */
    function getPokemonPage(uint256 offset, uint256 limit) external view returns (
        uint256[] memory tokenIds,
        address[] memory owners,
        Pokemon[] memory details
    ) {
        uint256 totalSupply = totalSupply();
        
        // Adjust limit if offset + limit exceeds total supply
        if (offset >= totalSupply) {
            return (new uint256[](0), new address[](0), new Pokemon[](0));
        }
        
        uint256 pageSize = offset + limit > totalSupply ? totalSupply - offset : limit;
        
        tokenIds = new uint256[](pageSize);
        owners = new address[](pageSize);
        details = new Pokemon[](pageSize);
        
        for (uint256 i = 0; i < pageSize; i++) {
            uint256 tokenId = tokenByIndex(offset + i);
            tokenIds[i] = tokenId;
            owners[i] = ownerOf(tokenId);
            details[i] = pokemonData[tokenId];
        }
        
        return (tokenIds, owners, details);
    }
    
    // Required overrides for multiple inheritance
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Check if a token exists
     * @param tokenId Token ID to check
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId < _nextTokenId && _ownerOf(tokenId) != address(0);
    }
}