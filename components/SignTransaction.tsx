import { useCallback, useEffect, useState } from 'react'

import { ethos, TransactionBlock} from 'ethos-connect';
import { ErrorMessage, SuccessMessage } from '.';
import { ETHOS_EXAMPLE_CONTRACT } from '../lib/constants';
import { verifyTransactionBlock } from '@mysten/sui.js/verify';
import { fromB64 } from '@mysten/sui.js/utils';

const SignTransaction = () => {
    const { wallet } = ethos.useWallet();

    const [signSuccess, setSignSuccess] = useState(false);
    const [signError, setSignError] = useState(false);


    const signTransaction = useCallback(async () => {

        const tx = new TransactionBlock()
        const coin = tx.splitCoins(tx.gas, [tx.pure(1000)])
        tx.setGasBudget(BigInt(2000000000))
        tx.transferObjects([coin], tx.pure("0x5bc852f1ca0b36b22ccaab5a859bcb26afa5527aef5638088c2bd841201d2310"))

        // const response = await wallet?.signAndExecuteTransactionBlock({ transactionBlock: tx })

        const response = await wallet?.signTransactionBlock({ transactionBlock: tx });
        console.log("0----->", JSON.stringify(response));
        if (!response) {
            setSignError(true);
        } else {
            console.log("Sign result: ", response)

            const { transactionBlockBytes, signature } = response;

            try {
                // use verifyTransactionBlock() for transaction blocks
                const publicKey = await verifyTransactionBlock(fromB64(transactionBlockBytes), signature);
                console.log("Signing public key: ", publicKey)
                console.log("Signing address: ", publicKey.toSuiAddress());
                console.log("Verified message: ", wallet?.address === publicKey.toSuiAddress())
                console.log("Visit https://github.com/EthosWallet/ethos-example-app/blob/main/components/SignTransaction.tsx#L30 for more details.") 

                setSignSuccess(true);
            } catch (e) {
                console.error(e);
                setSignError(true);
            }

            setSignSuccess(true);
        }
        
    }, [wallet]);

    const reset = useCallback(() => {
        setSignSuccess(false);
        setSignError(false);
    }, [])

    useEffect(() => {
        reset();
    }, [reset])

    return (
        <div className='flex flex-col gap-6'>
            {signSuccess && (
                <SuccessMessage reset={reset}>
                    Check the developer console to see the result.
                </SuccessMessage>
            )}
            {signError && (
                <ErrorMessage reset={reset}>
                    Signing did not work. See the developer console for additional information.
                </ErrorMessage>
            )}
            <button
                className="mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={signTransaction}
            >
                Sign transaction
            </button>
        </div>
    )
}

export default SignTransaction;