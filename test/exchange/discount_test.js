require('../utils/hooks');

const { logGas } = require('../utils');
const assert = require('assert');
const BitFinance = artifacts.require('./BitFinance.sol');
const BitFinanceToken = artifacts.require('./BitFinanceToken.sol');

contract('Discount', accounts => {
    let BitFinance, hot;

    before(async () => {
        BitFinance = await BitFinance.deployed();
        hot = await BitFinanceToken.deployed();
    });

    it('can get hot address', async () => {
        assert.equal(await BitFinance.getbitfinanceTokenAddress(), hot.address);
    });

    it('can change discount', async () => {
        let res = await BitFinance.updateDiscountConfig(
            '0x040a000027106400004e205a000075305000009c404600000000000000000000',
            { from: accounts[0] }
        );

        logGas(res, 'bitfinance.updateDiscountConfig');

        // hot contract is deployed by accounts 0, so this account has many tokens.
        const rate = await BitFinance.getDiscountedRate(accounts[0]);
        assert.equal('10', rate);
    });

    it('should have discount', async () => {
        let res = await BitFinance.getDiscountedRate(accounts[0]);
        assert.equal(res.toString(), '60');

        res = await BitFinance.getDiscountedRate(accounts[1]);
        assert.equal('100', res);
    });

    it('cannot change discount without permissions', async () => {
        await assert.rejects(
            BitFinance.updateDiscountConfig(
                '0x040a000027106400004e205a000075305000009c404600000000000000000000',
                { from: accounts[1] }
            ),
            /NOT_OWNER/
        );
    });
});
