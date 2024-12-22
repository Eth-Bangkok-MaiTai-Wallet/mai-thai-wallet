import { BlockchainTypes, CrossmintEVMWalletAdapter } from "@crossmint/connect";
import React, { useState } from "react";
import { config } from "dotenv";
config()

export default function EVMConnectButton() {
    const [address, setAddress] = useState<string | undefined>(undefined);

    const crossmintConnect = new CrossmintEVMWalletAdapter({
        chain: BlockchainTypes.ETHEREUM, // BlockchainTypes.ETHEREUM || BlockchainTypes.POLYGON || BlockchainTypes.BSC. For solana use BlockchainTypes.SOLANA
    });

    async function handleClick() {
        // prompt user to trust your app
        const _address = await crossmintConnect.connect();

        // store the result in react state
        setAddress(_address);
    }

    const connected = address != null;

    // If connected, displays their address, else displays "Connect"
    return (
        <button onClick={handleClick} disabled={connected}>
            {connected ? `${address.slice(0, 6)}...` : "Connect"}
        </button>
    );
}
