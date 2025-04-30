const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // ✅ Get the contract factory
  const PokemonCardFactory = await hre.ethers.getContractFactory("PokemonCard");

  // ✅ Deploy the contract and wait for deployment
  const pokemonCard = await PokemonCardFactory.deploy();
  await pokemonCard.waitForDeployment(); // ✅ Use this instead of .deployed()
  console.log("PokemonCard deployed to:", await pokemonCard.getAddress());

  const TradingFactory = await hre.ethers.getContractFactory("Trading");
  const trading = await TradingFactory.deploy(
    deployer.address,
    deployer.address
  );
  await trading.waitForDeployment();
  console.log("Trading deployed to:", await trading.getAddress());

  const fs = require("fs");
  const addresses = {
    pokemonCard: await pokemonCard.getAddress(),
    trading: await trading.getAddress(),
  };
  fs.writeFileSync(
    "contract-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Contract addresses saved to contract-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
