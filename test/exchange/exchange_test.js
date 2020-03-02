require('../utils/hooks');
const { logGas } = require('../utils');
const assert = require('assert');
const { generateOrderData, getOrderHash } = require('../../sdk/sdk');
const BitFinance = artifacts.require('./BitFinance.sol');

contract('CancelOrder', accounts => {
    let BitFinance;

    before(async () => {
        BitFinance = await BitFinance.deployed();
    });

    it('should cancel order', async () => {
        const order = {
            trader: accounts[0],
            relayer: '0x0000000000000000000000000000000000000000',
            baseAsset: '0x0000000000000000000000000000000000000000',
            quoteAsset: '0x0000000000000000000000000000000000000000',
            baseAssetAmount: 1,
            quoteAssetAmount: 1,
            data: generateOrderData(1, true, false, 0, 1, 1, 0, 1, false),
            gasTokenAmount: 0
        };

        const hash = getOrderHash(order);
        let cancelled = await BitFinance.isOrderCancelled(hash);
        assert.equal(cancelled, false);

        const res = await BitFinance.cancelOrder(order, { from: order.trader });
        logGas(res, 'bitfinance.cancelOrder');

        cancelled = await BitFinance.isOrderCancelled(hash);
        assert.equal(cancelled, true);
    });

    it("should abort when another try to cancel other's order", async () => {
        const order = {
            trader: accounts[0],
            relayer: '0x0000000000000000000000000000000000000000',
            baseAsset: '0x0000000000000000000000000000000000000000',
            quoteAsset: '0x0000000000000000000000000000000000000000',
            baseAssetAmount: 1,
            quoteAssetAmount: 1,
            data: generateOrderData(1, true, false, 0, 1, 1, 0, 1123123, false),
            gasTokenAmount: 0
        };

        const hash = getOrderHash(order);
        let cancelled = await BitFinance.isOrderCancelled(hash);
        assert.equal(cancelled, false);

        await assert.rejects(bitfinance.cancelOrder(order, { from: accounts[1] }), /revert/);
    });
});
