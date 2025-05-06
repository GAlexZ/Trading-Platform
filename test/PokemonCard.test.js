const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PokemonCard", function () {
  // Variables used throughout the tests
  let PokemonCard;
  let pokemonCard;
  let owner;
  let addr1;
  let addr2;

  // Deploy the contract before each test
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy PokemonCard contract
    PokemonCard = await ethers.getContractFactory("PokemonCard");
    pokemonCard = await PokemonCard.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await pokemonCard.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await pokemonCard.name()).to.equal("PokemonCard");
      expect(await pokemonCard.symbol()).to.equal("PKMN");
    });
  });

  describe("Minting", function () {
    it("Should mint a Pokemon card correctly", async function () {
      const mintTx = await pokemonCard.mintPokemon(
        addr1.address,
        "Pikachu",
        1, // Generation
        "Electric",
        100, // Power
        3, // Rarity
        true, // isShiny
        "ipfs://bafybeigz5x3655zd4qll7lcdbxoyjyoqj4tizvzjajtfm7f2aau2svdlsa"
      );

      // Wait for transaction to be mined
      await mintTx.wait();

      // Check token ownership
      expect(await pokemonCard.balanceOf(addr1.address)).to.equal(1);
      expect(await pokemonCard.ownerOf(0)).to.equal(addr1.address);

      // Check Pokemon data
      const pokemon = await pokemonCard.getPokemonDetails(0);
      expect(pokemon.name).to.equal("Pikachu");
      expect(pokemon.generation).to.equal(1);
      expect(pokemon.pokemonType).to.equal("Electric");
      expect(pokemon.power).to.equal(100);
      expect(pokemon.rarity).to.equal(3);
      expect(pokemon.isShiny).to.equal(true);

      // Check token URI
      expect(await pokemonCard.tokenURI(0)).to.equal(
        "ipfs://bafybeigz5x3655zd4qll7lcdbxoyjyoqj4tizvzjajtfm7f2aau2svdlsa"
      );
    });

    it("Should fail to mint with invalid parameters", async function () {
      // Empty name
      await expect(
        pokemonCard.mintPokemon(
          addr1.address,
          "",
          1,
          "Electric",
          100,
          3,
          true,
          "ipfs://QmHash"
        )
      ).to.be.revertedWith("Pokemon name cannot be empty");

      // Invalid generation
      await expect(
        pokemonCard.mintPokemon(
          addr1.address,
          "Pikachu",
          10, // Invalid generation (> 9)
          "Electric",
          100,
          3,
          true,
          "ipfs://QmHash"
        )
      ).to.be.revertedWith("Invalid generation");

      // Invalid rarity
      await expect(
        pokemonCard.mintPokemon(
          addr1.address,
          "Pikachu",
          1,
          "Electric",
          100,
          6, // Invalid rarity (> 5)
          true,
          "ipfs://QmHash"
        )
      ).to.be.revertedWith("Rarity must be between 1 and 5");
    });

    it("Should only allow the owner to mint", async function () {
      // Try to mint from non-owner account
      await expect(
        pokemonCard
          .connect(addr1)
          .mintPokemon(
            addr1.address,
            "Pikachu",
            1,
            "Electric",
            100,
            3,
            true,
            "ipfs://QmHash"
          )
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    it("Should burn a token correctly", async function () {
      // First mint a token
      await pokemonCard.mintPokemon(
        addr1.address,
        "Pikachu",
        1,
        "Electric",
        100,
        3,
        true,
        "ipfs://QmHash"
      );

      // Burn the token
      await pokemonCard.connect(addr1).burnPokemon(0);

      // Check token is burned
      await expect(pokemonCard.ownerOf(0)).to.be.reverted;
      expect(await pokemonCard.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should only allow token owner to burn", async function () {
      // Mint a token to addr1
      await pokemonCard.mintPokemon(
        addr1.address,
        "Pikachu",
        1,
        "Electric",
        100,
        3,
        true,
        "ipfs://QmHash"
      );

      // Try to burn from addr2
      await expect(
        pokemonCard.connect(addr2).burnPokemon(0)
      ).to.be.revertedWith("PokemonCard: caller is not owner or admin");
    });
  });

  describe("Enumeration and Data Access", function () {
    beforeEach(async function () {
      // Mint a few Pokemon cards for testing
      await pokemonCard.mintPokemon(
        addr1.address,
        "Pikachu",
        1,
        "Electric",
        100,
        3,
        true,
        "ipfs://QmPikachu"
      );

      await pokemonCard.mintPokemon(
        addr1.address,
        "Charizard",
        1,
        "Fire",
        150,
        5,
        false,
        "ipfs://QmCharizard"
      );

      await pokemonCard.mintPokemon(
        addr2.address,
        "Squirtle",
        1,
        "Water",
        90,
        2,
        false,
        "ipfs://QmSquirtle"
      );
    });

    it("Should get all Pokemon by owner", async function () {
      const [tokenIds, pokemons] = await pokemonCard.getAllPokemonByOwner(
        addr1.address
      );

      expect(tokenIds.length).to.equal(2);
      expect(pokemons.length).to.equal(2);

      expect(tokenIds[0]).to.equal(0);
      expect(pokemons[0].name).to.equal("Pikachu");

      expect(tokenIds[1]).to.equal(1);
      expect(pokemons[1].name).to.equal("Charizard");
    });

    it("Should batch get Pokemon details", async function () {
      const details = await pokemonCard.batchGetPokemonDetails([0, 2]);

      expect(details.length).to.equal(2);
      expect(details[0].name).to.equal("Pikachu");
      expect(details[1].name).to.equal("Squirtle");
    });

    it("Should get Pokemon page for pagination", async function () {
      const [tokenIds, owners, details] = await pokemonCard.getPokemonPage(
        0,
        2
      );

      expect(tokenIds.length).to.equal(2);
      expect(owners.length).to.equal(2);
      expect(details.length).to.equal(2);

      expect(tokenIds[0]).to.equal(0);
      expect(owners[0]).to.equal(addr1.address);
      expect(details[0].name).to.equal("Pikachu");

      expect(tokenIds[1]).to.equal(1);
      expect(owners[1]).to.equal(addr1.address);
      expect(details[1].name).to.equal("Charizard");
    });
  });
});
