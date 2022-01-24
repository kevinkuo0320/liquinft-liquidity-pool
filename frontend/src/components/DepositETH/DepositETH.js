import { parseEther } from "ethers/lib/utils";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  callContractMethod,
  handleContractInteractionResponse,
} from "../../utils";
import "./styles.css";

const DepositETH = ({ spaceCoin }) => {
  const [amount, setAmount] = useState("");

  const handleAmountChange = (e) => {
    const limit = e.target.value.includes(".") ? 6 : 5;
    if (e.target.value.length < limit) {
      setAmount(e.target.value.replace(/[^\d.]/g, ""));
    }
  };

  const contribute = async () => {
    if (amount <= 0) {
      return toast.error("You can't donate zero!");
    }

    const { result, error } = await callContractMethod(() =>
      spaceCoin.contribute({ value: parseEther(amount) })
    );

    handleContractInteractionResponse(result, error, toast);
    setAmount("");
  };

  return (
    <div className="deposit-eth-container">
      <h3>Deposit ETH to become LiquidNFT Provider !</h3>
      <p> Initial NFT Minting Price: 0.5 ETH / NFT </p>
      <p> NFT-ETH Ratio: 50%-50% </p>
      <div className="contribute-container">
        <input
          className="contribute-amount"
          placeholder="Amount to contribute..."
          type="text"
          value={amount}
          onChange={handleAmountChange}
        />{" "}
        <span className="eth">ETH</span>
      </div>
      {amount && (
        <>
          <div className="estimated-sc">
            You are minting: {amount * 0.25} <strong>NFT</strong> (worth{" "}
            {amount * 0.5} ETH) into Liquidity Pool
          </div>
          <div className="estimated-sc">
            You are staking: {amount * 0.5} <strong>ETH</strong> into Liquidity
            Pool
          </div>
          <button className="cool-button" onClick={contribute}>
            Add Liquidity
          </button>
        </>
      )}
    </div>
  );
};

export default DepositETH;
