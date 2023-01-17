import '../styles/globals.css'
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Head from 'next/head'
import { NotificationProvider } from 'web3uikit'; /*needed for Notification in UpdateListingModal.js*/
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Image from 'next/image';


const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/40526/nft-marketplace/v0.0.3",
});

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head> {/*Moved from index.js to _app.js so this stays on all pages */ }
    <title>NFT Marketplace</title>
    <meta name="description" content="Site to sell and buy NFTs" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />
    </Head>
      {/*wrapping the app in Moralis provider to begin in Header.js*/}
      <MoralisProvider initializeOnMount={false}> 
        <ApolloProvider client={client}> {/* Apollo queries Graph node */ }
        <NotificationProvider> {/*wrapping header component for UpdateListingModal */}
      <Header/>
          <Component {...pageProps} />
          </NotificationProvider>
          </ApolloProvider>
    </MoralisProvider>
  </div>)
  
}

