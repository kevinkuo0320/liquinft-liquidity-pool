import "./App.css";
import SpaceCoinInfo from "./pages/SpaceCoinInfo/SpaceCoinInfo";
import "react-toastify/dist/ReactToastify.css";
import "react-tabs/style/react-tabs.css";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { ToastContainer } from "react-toastify";

import useContract from "./utils/hooks/useContract";
import { SPACE_COIN } from "./utils/contractNamesConstants";
import ManageLiquidity from "./pages/ManageLiquidity/ManageLiquidity";
import Trading from "./pages/Trading/Trading";

const App = () => {
  const spaceCoin = useContract(SPACE_COIN);

  return (
    <div className="App">
      <h1>LiquidNFT </h1> <h5> by Team GlassGive</h5>{" "}
      <p> only showing one NFT liquidity pool for demo purpose </p>
      {spaceCoin ? (
        <>
          <Tabs>
            <TabList>
              <Tab>Liquidity Pool</Tab>

              <Tab>Swaping</Tab>
            </TabList>

            <TabPanel>
              <SpaceCoinInfo />
            </TabPanel>

            <TabPanel>
              <Trading />
            </TabPanel>
          </Tabs>
          <ToastContainer />
        </>
      ) : (
        "Please connect your wallet to use the dapp!"
      )}
    </div>
  );
};

export default App;
