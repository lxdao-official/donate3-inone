const { AxelarAssetTransfer, AxelarQueryAPI, CHAINS, Environment } = require('@axelar-network/axelarjs-sdk');

/**
 * Get chains config for testnet.
 * @param {*} chains - The list of chains to get the chain objects for. If this is empty, the default chains will be used.
 * @returns {Chain[]} - The chain objects.
 */
function getTestnetChains(chains: any = []) {
    let testnet = [];

    // If the chains are specified, but the testnet config file does not have the specified chains, use testnet.json from axelar-cgp-solidity.
    testnet = require('@axelar-network/axelar-cgp-solidity/info/testnet.json').filter((chain: { name: any; }) => chains.includes(chain.name));
    // temporary fix for gas service contract address

    return testnet.map((chain: any) => ({
        ...chain,
        AxelarGasService: {
            address: '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6',
        },
    }));
}

/**
 * Calculate the gas amount for a transaction using axelarjs-sdk.
 * @param {*} source - The source chain object.
 * @param {*} destination - The destination chain object.
 * @param {*} options - The options to pass to the estimateGasFee function. Available options are gas token symbol, gasLimit and gasMultiplier.
 * @returns {number} - The gas amount.
 */
function calculateBridgeFee(source: any, destination: any, options: any = {}) {
    const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
    const { gasLimit, gasMultiplier, symbol } = options;

    return api.estimateGasFee(
        CHAINS.TESTNET[source.name.toUpperCase()],
        CHAINS.TESTNET[destination.name.toUpperCase()],
        symbol || source.tokenSymbol,
        gasLimit,
        gasMultiplier,
    );
}