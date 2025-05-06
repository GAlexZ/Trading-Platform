const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const PokemonCardFactory = await hre.ethers.getContractFactory("PokemonCard");

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
  const path = require("path");

  const addresses = {
    pokemonCard: await pokemonCard.getAddress(),
    trading: await trading.getAddress(),
  };

  const outPath = path.resolve(
    __dirname,
    "..",
    "frontend",
    "src",
    "contract-addresses.json"
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2), "utf-8");
  console.log("Contract addresses saved to contract-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
