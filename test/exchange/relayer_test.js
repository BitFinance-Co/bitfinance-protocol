require('../utils/hooks');
const { logGas } = require('../utils');
const assert = require('assert');
const BitFinance = artifacts.require('./BitFinance.sol');

contract('Relayer', accounts => {
    let BitFinance;
    before(async () => {
        BitFinance = await BitFinance.deployed();
    });

    it("relayer can't match other's orders without approve", async () => {
        const res = await BitFinance.canMatchOrdersFrom(accounts[1], { from: accounts[0] });
        assert.equal(res, false);
    });

    it("relayer can match other's orders with approve", async () => {
        const res = await BitFinance.approveDelegate(accounts[0], { from: accounts[1] });
        logGas(res, `bitfinance.approveDelegate`);

        const canMatch = await BitFinance.canMatchOrdersFrom(accounts[1], { from: accounts[0] });
        assert.equal(canMatch, true);

        await BitFinance.revokeDelegate(accounts[0], { from: accounts[1] });
        const canMatch2 = await BitFinance.canMatchOrdersFrom(accounts[1], { from: accounts[0] });
        assert.equal(canMatch2, false);
    });

    it('default participant', async () => {
        let isParticipant = await BitFinance.isParticipant(accounts[1], { from: accounts[1] });
        assert.equal(isParticipant, true);

        // exit
        let res = await BitFinance.exitIncentiveSystem({ from: accounts[1] });
        logGas(res, `bitfinance.exitIncentiveSystem`);

        isParticipant = await BitFinance.isParticipant(accounts[1], { from: accounts[1] });
        assert.equal(isParticipant, false);

        // join
        res = await BitFinance.joinIncentiveSystem({ from: accounts[1] });
        logGas(res, `bitfinance.joinIncentiveSystem`);

        isParticipant = await BitFinance.isParticipant(accounts[1], { from: accounts[1] });
        assert.equal(isParticipant, true);
    });
});
