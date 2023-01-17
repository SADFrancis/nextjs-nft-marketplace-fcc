import styles from '../styles/Home.module.css'
import { Form, useNotification, Button } from 'web3uikit';
import {ethers} from "ethers";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/basicNft.json";
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from 'react';
import Head  from 'next/head';
import Image from 'next/image';


export default function Home() {
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "1337";
  const marketplaceAddress = networkMapping[chainString].NftMarketPlace[0];
  const dispatch = useNotification();
  const [proceeds, setProceeds] = useState("0")

  const { runContractFunction } = useWeb3Contract();




  async function approveAndList(data) {
    console.log("Approving...")
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    }

    await runContractFunction({
      params: approveOptions,
      onSuccess: (tx) => handleApproveSuccess(tx,nftAddress, tokenId, price),
      onError: (error) => {
        console.log(error)
      }
    });
  }

  async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
    console.log("Time to list");
    await tx.wait(1);
      const listOptions = {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "listItem",
        params: {
          nftAddress: nftAddress,
          tokenId: tokenId,
          price: price,
        },
      };

      await runContractFunction({
        params: listOptions,
        onSuccess: (tx) => handleListSuccess(tx),
        onError: (error) => console.log(error),
      });

  }

  async function handleListSuccess (tx) {
    await tx.wait(1);
    dispatch({
      type: "Success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    });
  }
  const handleWithdrawSuccess = async (tx) => {
    await tx.wait(1)
    dispatch({
        type: "success",
        message: "Withdrawing proceeds",
        position: "topR",
    })
}

async function setupUI() {
    const returnedProceeds = await runContractFunction({
        params: {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "getProceeds",
            params: {
                seller: account,
            },
        },
        onError: (error) => console.log(error),
    })
    if (returnedProceeds) {
        setProceeds(returnedProceeds.toString())
    }
}

useEffect(() => {
    if(isWeb3Enabled){
        setupUI()
    }
}, [proceeds, account, isWeb3Enabled, chainId])


  return (
    <>
      <div className={styles.container}>
        <Form
          onSubmit={approveAndList}
          data={[
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "25%",
            value: "",
            key:"nftAddress"
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId"
          },
          {
            name: "Price (in ETH)",
            type: "number",
            value: "",
            key: "price"
          }]}
          title="Sell your  NFT!"
          id="Main Form"

        />
          <div>ETH Proceeds to withdraw: {ethers.utils.formatUnits(proceeds, "ether")}</div>
            {proceeds != "0" ? (
                <Button
                    onClick={() => {
                        runContractFunction({
                            params: {
                                abi: nftMarketplaceAbi,
                                contractAddress: marketplaceAddress,
                                functionName: "withdrawProceeds",
                                params: {},
                            },
                            onError: (error) => console.log(error),
                            onSuccess: handleWithdrawSuccess,
                        })
                    }}
                    text="Withdraw"
                    type="button"
                />
            ) : (
                <div>No proceeds detected</div>
            )}          


    </div>
    </>
  )
}
