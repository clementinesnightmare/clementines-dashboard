import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

export const StyledConnect = styled.button`
  width: 250px;
  height: 62px;
  cursor: pointer;
  background-color: transparent;
  background-repeat: no-repeat;
  border: none;
  outline: none;
  background-image:url('config/images/connect.png');
`;

export const StyledWallet = styled.button`
  width: 250px;
  height: 62px;
  cursor: pointer;
  background-color: transparent;
  background-repeat: no-repeat;
  border: none;
  outline: none;
  background-image:url('config/images/wallet.png');
  margin: 5px;
`;

export const StyledVault = styled.button`
  width: 250px;
  height: 62px;
  cursor: pointer;
  background-color: transparent;
  background-repeat: no-repeat;
  border: none;
  outline: none;
  background-image:url('config/images/vault.png');
  margin: 5px;
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 350px;
  max-width: 100%;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [feedback, setFeedback] = useState(``);
  const [currentView, setCurrentView] = useState(``)
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
    VAULT_ADDRESS: "",
    ULTRA_LEGENDS: [],
    LEGENDS: [],
    RARES: [],
    METADATA: [],
  });
  const [walletData, setWalletData] = useState([]);

  const loadWallet = () => {
    setCurrentView(`wallet`)
    setFeedback(`Loading your wallet...`);
    setWalletData(``);
    blockchain.smartContract.methods
      .walletOfOwner(blockchain.account)
      .call({
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `Welcome to the Neighborhood ` + blockchain.account + `!`
        );
        setWalletData(
          receipt.length > 0 ? prepWalletData(receipt) : (
            <p>You have no Clementine's Nightmare NFTs in this wallet.</p>
          )
        );
      });
  };

  const loadVault = () => {
    setCurrentView(`vault`)
    setFeedback(`Loading vault...`)
    setWalletData(``)

    blockchain.smartContract.methods
      .walletOfOwner(CONFIG.VAULT_ADDRESS)
      .call({
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `Welcome to the Clementine's Nightmare Community Vault!`
        );
        setWalletData(
          receipt.length > 0 ? prepWalletData(receipt) : (
            <p>There are no Clementine's Nightmare NFTs in the vault.</p>
          )
        );
      });
  };

  const prepWalletData = (receipt) => {
    let fullData = []

    for (let i = 0; i < receipt.length; i++) {
      let idx = parseInt(receipt[i], 10)
      let metadata = CONFIG.METADATA[idx]

      fullData.push({
        id: idx,
        url: metadata.image.replace("ipfs://", "https://clementinesnightmare.mypinata.cloud/ipfs/"),
        name: metadata.name,
        color: nftColor(idx),
      })
    }

    return fullData.map((item) =>
      <div key={item.id} style={{
        border: "3px solid var(--primary)",
        margin: "10px",
        backgroundColor: "var(--primary)",
        borderRadius: 15,
      }}>
        {item.url.includes(".png") ? (
          <img alt={item.name} src={item.url} width="250px" height="250px" style={{
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
          }} />) : (
          <video width="250" height="250" alt={item.name} style={{
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
          }} controls="true">
            <source src={item.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        <p style={{
          padding: "5px",
          color: item.color,
        }}>{item.name}</p>
      </div>
    );
  }

  const nftColor = (idx) => {
    let val = "var(--primary-text)"

    if (CONFIG.ULTRA_LEGENDS.includes(idx)) {
      return "var(--ultra-text)"
    }

    if (CONFIG.LEGENDS.includes(idx)) {
      return "var(--legend-text)"
    }

    if (CONFIG.RARES.includes(idx)) {
      return "var(--rare-text)"
    }

    return val
  }

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
      loadWallet();
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <ResponsiveWrapper flex={1}>
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
          >
            <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
            <>
              <s.SpacerSmall />
              {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                <s.Container ai={"center"} jc={"center"}>
                  <s.TextDescription
                    style={{
                      textAlign: "center",
                      color: "var(--accent-text)",
                    }}
                  >
                    Connect to {CONFIG.NETWORK.NAME}.
                  </s.TextDescription>
                  <s.SpacerSmall />
                  <StyledConnect
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(connect());
                      getData();
                    }}
                  > </StyledConnect>
                  {blockchain.errorMsg !== "" ? (
                    <>
                      <s.SpacerSmall />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {blockchain.errorMsg}
                      </s.TextDescription>
                    </>
                  ) : null}
                </s.Container>
              ) : (
                <>
                  <s.Container style={{
                    flexFlow: "row wrap",
                    maxWidth: "1200px",
                    textAlign: "center",
                    color: "var(--accent-text)",
                  }} ai={"center"} jc={"center"} fd={"row"}>
                    <StyledWallet
                      disabled={currentView == 'wallet' ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        loadWallet();
                      }}
                    />
                    <StyledVault
                      disabled={currentView == 'vault' ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        loadVault();
                      }}
                    />
                  </s.Container>
                  <s.SpacerSmall />
                  <s.TextDescription
                    style={{
                      textAlign: "center",
                      color: "var(--accent-text)",
                    }}
                  >
                    {feedback}
                  </s.TextDescription>
                  <s.SpacerSmall />
                  <s.Container style={{
                    flexFlow: "row wrap",
                    maxWidth: "1200px",
                    textAlign: "center",
                    color: "var(--accent-text)",
                  }} ai={"center"} jc={"center"} fd={"row"}>
                    {walletData}
                  </s.Container>
                </>
              )}
            </>
            <s.SpacerMedium />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.TextDescription
          style={{
            textAlign: "center",
            color: "var(--accent-text)",
            lineHeight: "1.2em",
          }}
        >
          COPYRIGHT &copy; 2021/2022.<br />
          ALL RIGHTS RESERVED BY PIXELATED INK
        </s.TextDescription>
      </s.Container>
    </s.Screen>
  );
}

export default App;
