const hre = require("hardhat");

async function main() {
  const MentorRewards = await hre.ethers.getContractFactory("MentorRewards");
  const mentorRewards = await MentorRewards.deploy();

  await mentorRewards.waitForDeployment();

  const address = await mentorRewards.getAddress();
  console.log("MentorRewards deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
