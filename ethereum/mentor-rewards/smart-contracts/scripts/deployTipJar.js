// scripts/deployTipJar.js

const hre = require("hardhat");

async function main() {
  // Get the contract factory for MentorTipJar
  const TipJar = await hre.ethers.getContractFactory("MentorTipJar");

  // Deploy the contract
  const tipJar = await TipJar.deploy();

  // Wait until the deployment is complete
  await tipJar.deployed();

  // Log the deployed contract address
  console.log("MentorTipJar deployed to:", tipJar.address);
}

// Execute the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
