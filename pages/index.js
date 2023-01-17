import Head from 'next/head'
import styles from '../styles/Home.module.css'
import NFTBox from '../components/NftBox'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from '../constants/subgraphQueries';
import { useQuery } from '@apollo/client'

export default function Home() {
  const { chainId ,isWeb3Enabled } = useMoralis();
  // how do we show the recently listed NFTs?
  // Index the events off-chain and then read from our database
  // setup a server to listen for thos events to be fired, and add them to a database to query
  
  const chainString = chainId ? parseInt(chainId).toString() : "";
  const marketplaceAddress = chainId ? networkMapping[chainString].NftMarketPlace[0] : "";

  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <>
      <div className="container mx-auto"> 
        <h1 className="py-4 px-4 font-bold text-2xl"> Recently Listed</h1>
        <div className="flex flex-wrap">
          {isWeb3Enabled  && chainId ? ( // 1) Is Web3 enabled and we have a defined chain Id?
            loading || !listedNfts ? ( // 1A) Are we still loading the NFT list?
              <div>Loading...</div> // 1A Yes? loading
            ) : ( // 1A No? let's list the NfTs 
              listedNfts.activeItems.map((nft) => {
                const { price, nftAddress, tokenId, seller } = nft;
                return marketplaceAddress ? ( //1AA is the Market place contract on the connected network? Yes? -> NFT box
                  <div className="px-2 py-2"> 
                  <NFTBox
                    price={price}
                    nftAddress={nftAddress}
                    tokenId={tokenId}
                    marketPlaceAddress={marketplaceAddress}
                    seller={seller}
                    key={`${nftAddress}${tokenId}`}
                    />
                    </div>
                ) : ( // 1AA) No? Inform we need to switch to the proper network
                    <div>Network error, please switch to a supported network.</div>
                )
              }) // Conclude map array of NFTs
            ) // Conclude 1A) of listing NFTs on page
          ) : ( // 1) No? We need to enable Web3 and get on a network
            <div> Web3 Wallet Not Enabled</div>
          )} {/*Completed JS block of logic to list NFTs */ }
        </div>
      </div>
    </>
  )
}
