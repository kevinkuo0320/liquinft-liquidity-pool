import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { bigNumberToDecimal, callContractMethod } from "../../utils";
import "./styles.css";

const PHASE = {
  0: { name: "SEED", limit: 15000 },
  1: { name: "GENERAL", limit: 30000 },
  2: { name: "OPEN", limit: 30000 },
};

const PhaseInfo = ({ spaceCoin, account }) => {
  const [phase, setPhase] = useState();
  const [totalContributed, setTotalContributed] = useState();
  const [isTaxOn, setIsTaxOn] = useState();
  const [isPaused, setIsPaused] = useState();

  const getPhase = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.currentPhase()
    );

    if (error) {
      return toast.error(error);
    }

    setPhase(PHASE[result]);
  }, [spaceCoin]);

  const getTotalContributed = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.totalContributed()
    );

    if (error) {
      return toast.error(error);
    }

    const totalContributedDecimal = bigNumberToDecimal(result);
    setTotalContributed(totalContributedDecimal);
  }, [spaceCoin]);

  const getTaxOnOrOff = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.isTaxOn()
    );

    if (error) {
      return toast.error(error);
    }

    setIsTaxOn(result);
  }, [spaceCoin]);

  const getPausedOrNot = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.isContractPaused()
    );

    if (error) {
      return toast.error(error);
    }

    setIsPaused(result);
  }, [spaceCoin]);

  const getPhaseInfo = useCallback(() => {
    getPhase();
    getTotalContributed();
    getTaxOnOrOff();
    getPausedOrNot();
  }, [getPhase, getTotalContributed, getTaxOnOrOff, getPausedOrNot]);

  useEffect(() => {
    getPhaseInfo();
  }, [getPhaseInfo]);

  useEffect(() => {
    spaceCoin.on("TokensBought", getPhaseInfo);
    spaceCoin.on("OwnerAction", getPhaseInfo);
  }, [spaceCoin, getPhaseInfo]);

  return phase && totalContributed >= 0 ? (
    <div className="phase-info-container">
      <div className="info-row">
        <span className="key">Current Liquidity Pool Status:</span>
        <span className="value">{phase.name}</span>
      </div>
      <div className="info-row">
        <span className="key">Max NFT Supply:</span>
        <span className="value">1000</span>
      </div>
      <div className="info-row">
        <span className="key">Total NFT Minted:</span>
        <span className="value">120</span>
      </div>
      <div className="info-row">
        <span className="key">Remaining NFT to be minted:</span>
        <span className="value">880</span>
      </div>
    </div>
  ) : (
    "Getting extra info..."
  );
};

export default PhaseInfo;
