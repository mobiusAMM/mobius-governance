import hre from "hardhat"
import { GovernorBravoDelegate__factory } from "../types"
import { parseEther } from "@ethersproject/units"

async function main() {
  const namedAccounts = await hre.getNamedAccounts();
  const { deployer } = namedAccounts;
  if (!deployer) {
    throw new Error("Deployer not found");
  }
  const signer = await hre.ethers.getSigner(deployer);
  if (!signer) {
    throw new Error("Deployer signer not found");
  }

  const { address: governanceAddress } = await hre.deployments.get("GovernorBravoDelegator");
  const governance = GovernorBravoDelegate__factory.connect(governanceAddress, signer);

  const description: string = `# Set voting delay to 15 sec
  ## TLDR: Uniswap should add a 1bps fee tier with 1 tick spacing. This change is straightforward from a technical perspective and would help Uniswap compete in stablecoin <> stablecoin pairs, where the majority of the market share is taken by Curve and DODO.
  ## Background on pool fees Uniswap v3 allows for the creation of new pools via calls to the [factory contract](https://etherscan.io/address/0x1F98431c8aD98523631AE4a59f267346ea31F984). In order to keep liquidity for pairs consolidated, only a few fee options are allowed–currently, 5, 30, and 100 basis points are supported (10, 60, 200 tick spacing).
  Governance should add a 1 basis point fee option for the following reasons: * Curve’s stablecoin markets have 3-4 bps fees. * Dodo’s stablecoin markets have a 1 bps fee. * FTX’s fees for retail are 2/7bps fees and for whales 0/4bps.
  However, we recognize there are some potential counterarguments to adding this fee tier: * Adding too many fee tiers can fragment liquidity. * Liquidity providers may earn less in fees.
  ### We discuss each of these points in greater detail below This will allow for the creation of much more competitive stablecoin<>stablecoin pools.
  Offering low slippage on stablecoin<>stablecoin pairs in AMMs is generally easier than other pairs due to their relatively low price volatility.
  As such, the determining factor in driving volume is trading fees. Pouring more capital into a 5 bps fee pool won’t necessarily make Uniswap v3’s pricing more attractive, as lower cost pools exist such as [Curve’s 3pool](https://curve.fi/3pool) (3 bps fees) and [DODO’s USDC-USDT](https://app.dodoex.io/liquidity?network=mainnet) pool (1 bps fees). Indeed, [most USDC-USDT volume from 1inch is routed to DODO](https://dune.xyz/queries/135498). Very little of it is routed to Uniswap v3.
  [In the DEX market as a whole](https://dune.xyz/queries/150801) (not just 1inch), DODO and Curve still take the majority of the market share (60-70%) in USDC-USDT trading. Uniswap v3’s concentrated liquidity helped increase market share, but lower fees can help it grab more.
  The data tells a similar story for DAI-USDC (see [1inch exported volume](https://dune.xyz/queries/152001) and [overall market share](https://dune.xyz/queries/151999)), though in the case of DAI-USDC, DODO is less active. While the case is compelling just from competition in the DEX space, Uniswap also competes with centralized exchanges.
  Many centralized exchanges offer lower than 5 basis point taker fees for high volume traders ([Binance](https://www.binance.com/en/fee/schedule) offers < 5 basis point fees above 40K BTC in 30-day volume, [FTX](https://help.ftx.com/hc/en-us/articles/360024479432-Fees) above $25M in 30-day volume, etc.). Lower fees could increase the DEX volume pie by comparing favorably to spot markets on centralized exchanges and drawing volume from large players. ### The change is a very light touch. The change requires just one function call–[\`enableFeeAmount(100)\`](https://github.com/Uniswap/v3-core/blob/b2c5555d696428c40c4b…3528b2317f3c1/contracts/interfaces/IUniswapV3Factory.sol#L77)–on the factory contract. Governance controls this contract, so a simple proposal could make this change.
  The enableFeeAmount function takes as parameters
  
  1. Fee: the fee amount denominated in 100ths of a basis point. 
  2. \`tickSpacing\`: the granularity one may specify a liquidity range (see the Uniswap v3 Core [whitepaper](https://uniswap.org/whitepaper-v3.pdf) for more details)
  To add a 1 basis point fee option, fee would be 100.
  \`tickSpacing\` requires some consideration. On the one hand, too high of a value restricts LPs’ ability to set granular prices, since initializable price ticks would be roughly [\`tickSpacing\`] basis points apart. On the other hand, too low of a value could entail liquidity being too low in each tick, meaning that larger orders may need to cross multiple ticks to fill, entailing extra gas cost for each additional tick.
  We suggest that a value of 1 for \`tickSpacing\` would be reasonable for 1 basis point fee pools, allowing LPs to set prices with precision in positions that span ~1 basis point between initializable ticks.
  For a stablecoin market like USDC-USDT, we expect most of the liquidity to reside in 6 ticks. Orders <$1m will like only require 1 tick and larger orders may require a second or third tick. For each tick used it adds about 15k-20k gas costs.
  ### Too many fee tiers can fragment liquidity
  The downside of adding too many fee tier possibilities is that liquidity is then fragmented across pools. However, we believe that LPs will naturally settle over time into the fee tier that is most appropriate for the volatility of the pair.
  Pairs with particularly low volatility, like stablecoin<>stablecoin pairs, will likely have a liquidity migration to the 1 bps tier, as the required return to capital should be low in equilibrium given the low risk of impermanent loss.
  ### LPs may earn less in fees
  Assuming overall volume stays stable (although it’s worth mentioning more competitive fees should grow the pie), total fees paid will go down (volume would have to 5X for fees paid to LPs to stay the same).
  However, LPs are not the only constituency to take into consideration–takers will be paying lower fees in aggregate. Growing Uniswap’s market share and being the best place to trade across many pairs is important. These pools could become more enticing to large traders looking to swap stablecoins, for instance.
  ## Concluding Thoughts
  We believe this simple change could boost Uniswap’s competitiveness in low volatility pairs, and the change presents minimal risk for Uniswap.`

  const target = "0xA878C6787490c9f0d2406bcd161b61f128Ab2708"
  const value = 0
  const signature = "_setVotingDelay(uint256)"
  const abi = new hre.ethers.utils.AbiCoder();
  const data = abi.encode(['uint256'], [15]);

  const tx = await governance.propose(
    [target],
    [value],
    [signature],
    [data],
    description,
    {
      gasLimit: 8_500_000, 
      gasPrice: 0.5 * 10 ** 9
    });
    await tx.wait()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
