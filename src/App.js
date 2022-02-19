import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
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
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
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
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
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
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
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
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                      <script type="module" src="https://cdn.nft-generator.art/js-sdk/v1.2.0/nft-art-generator-sdk/nft-art-generator-sdk.esm.js"></script>
                      <script nomodule src="https://cdn.nft-generator.art/js-sdk/v1.2.0/nft-art-generator-sdk/nft-art-generator-sdk.js"></script>
                      <meta name="nft-art-contract-abi" content="W3sidHlwZSI6ImNvbnN0cnVjdG9yIiwiaW5wdXRzIjpbeyJuYW1lIjoiX3VyaSIsInR5cGUiOiJzdHJpbmciLCJpbnRlcm5hbFR5cGUiOiJzdHJpbmcifSx7Im5hbWUiOiJfbmFtZSIsInR5cGUiOiJzdHJpbmciLCJpbnRlcm5hbFR5cGUiOiJzdHJpbmcifSx7Im5hbWUiOiJfc3ltYm9sIiwidHlwZSI6InN0cmluZyIsImludGVybmFsVHlwZSI6InN0cmluZyJ9LHsibmFtZSI6Il90b3RhbFN1cHBseSIsInR5cGUiOiJ1aW50MzIiLCJpbnRlcm5hbFR5cGUiOiJ1aW50MzIifSx7Im5hbWUiOiJfY29zdCIsInR5cGUiOiJ1aW50MjU2IiwiaW50ZXJuYWxUeXBlIjoidWludDI1NiJ9LHsibmFtZSI6Il9vcGVuIiwidHlwZSI6ImJvb2wiLCJpbnRlcm5hbFR5cGUiOiJib29sIn1dLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIn0seyJuYW1lIjoiQXBwcm92YWxGb3JBbGwiLCJ0eXBlIjoiZXZlbnQiLCJpbnB1dHMiOlt7Im5hbWUiOiJhY2NvdW50IiwidHlwZSI6ImFkZHJlc3MiLCJpbmRleGVkIjp0cnVlLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn0seyJuYW1lIjoib3BlcmF0b3IiLCJ0eXBlIjoiYWRkcmVzcyIsImluZGV4ZWQiOnRydWUsImludGVybmFsVHlwZSI6ImFkZHJlc3MifSx7Im5hbWUiOiJhcHByb3ZlZCIsInR5cGUiOiJib29sIiwiaW5kZXhlZCI6ZmFsc2UsImludGVybmFsVHlwZSI6ImJvb2wifV0sImFub255bW91cyI6ZmFsc2V9LHsibmFtZSI6Ik93bmVyc2hpcFRyYW5zZmVycmVkIiwidHlwZSI6ImV2ZW50IiwiaW5wdXRzIjpbeyJuYW1lIjoicHJldmlvdXNPd25lciIsInR5cGUiOiJhZGRyZXNzIiwiaW5kZXhlZCI6dHJ1ZSwiaW50ZXJuYWxUeXBlIjoiYWRkcmVzcyJ9LHsibmFtZSI6Im5ld093bmVyIiwidHlwZSI6ImFkZHJlc3MiLCJpbmRleGVkIjp0cnVlLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn1dLCJhbm9ueW1vdXMiOmZhbHNlfSx7Im5hbWUiOiJUcmFuc2ZlckJhdGNoIiwidHlwZSI6ImV2ZW50IiwiaW5wdXRzIjpbeyJuYW1lIjoib3BlcmF0b3IiLCJ0eXBlIjoiYWRkcmVzcyIsImluZGV4ZWQiOnRydWUsImludGVybmFsVHlwZSI6ImFkZHJlc3MifSx7Im5hbWUiOiJmcm9tIiwidHlwZSI6ImFkZHJlc3MiLCJpbmRleGVkIjp0cnVlLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn0seyJuYW1lIjoidG8iLCJ0eXBlIjoiYWRkcmVzcyIsImluZGV4ZWQiOnRydWUsImludGVybmFsVHlwZSI6ImFkZHJlc3MifSx7Im5hbWUiOiJpZHMiLCJ0eXBlIjoidWludDI1NltdIiwiaW5kZXhlZCI6ZmFsc2UsImludGVybmFsVHlwZSI6InVpbnQyNTZbXSJ9LHsibmFtZSI6InZhbHVlcyIsInR5cGUiOiJ1aW50MjU2W10iLCJpbmRleGVkIjpmYWxzZSwiaW50ZXJuYWxUeXBlIjoidWludDI1NltdIn1dLCJhbm9ueW1vdXMiOmZhbHNlfSx7Im5hbWUiOiJUcmFuc2ZlclNpbmdsZSIsInR5cGUiOiJldmVudCIsImlucHV0cyI6W3sibmFtZSI6Im9wZXJhdG9yIiwidHlwZSI6ImFkZHJlc3MiLCJpbmRleGVkIjp0cnVlLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn0seyJuYW1lIjoiZnJvbSIsInR5cGUiOiJhZGRyZXNzIiwiaW5kZXhlZCI6dHJ1ZSwiaW50ZXJuYWxUeXBlIjoiYWRkcmVzcyJ9LHsibmFtZSI6InRvIiwidHlwZSI6ImFkZHJlc3MiLCJpbmRleGVkIjp0cnVlLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn0seyJuYW1lIjoiaWQiLCJ0eXBlIjoidWludDI1NiIsImluZGV4ZWQiOmZhbHNlLCJpbnRlcm5hbFR5cGUiOiJ1aW50MjU2In0seyJuYW1lIjoidmFsdWUiLCJ0eXBlIjoidWludDI1NiIsImluZGV4ZWQiOmZhbHNlLCJpbnRlcm5hbFR5cGUiOiJ1aW50MjU2In1dLCJhbm9ueW1vdXMiOmZhbHNlfSx7Im5hbWUiOiJVUkkiLCJ0eXBlIjoiZXZlbnQiLCJpbnB1dHMiOlt7Im5hbWUiOiJ2YWx1ZSIsInR5cGUiOiJzdHJpbmciLCJpbmRleGVkIjpmYWxzZSwiaW50ZXJuYWxUeXBlIjoic3RyaW5nIn0seyJuYW1lIjoiaWQiLCJ0eXBlIjoidWludDI1NiIsImluZGV4ZWQiOnRydWUsImludGVybmFsVHlwZSI6InVpbnQyNTYifV0sImFub255bW91cyI6ZmFsc2V9LHsibmFtZSI6ImFpcmRyb3AiLCJ0eXBlIjoiZnVuY3Rpb24iLCJpbnB1dHMiOlt7Im5hbWUiOiJ0byIsInR5cGUiOiJhZGRyZXNzW10iLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzW10ifV0sIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIn0seyJuYW1lIjoiYmFsYW5jZU9mIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoiYWNjb3VudCIsInR5cGUiOiJhZGRyZXNzIiwiaW50ZXJuYWxUeXBlIjoiYWRkcmVzcyJ9LHsibmFtZSI6ImlkIiwidHlwZSI6InVpbnQyNTYiLCJpbnRlcm5hbFR5cGUiOiJ1aW50MjU2In1dLCJvdXRwdXRzIjpbeyJuYW1lIjoiIiwidHlwZSI6InVpbnQyNTYiLCJpbnRlcm5hbFR5cGUiOiJ1aW50MjU2In1dLCJzdGF0ZU11dGFiaWxpdHkiOiJ2aWV3In0seyJuYW1lIjoiYmFsYW5jZU9mIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoiYWNjb3VudCIsInR5cGUiOiJhZGRyZXNzIiwiaW50ZXJuYWxUeXBlIjoiYWRkcmVzcyJ9XSwib3V0cHV0cyI6W3sibmFtZSI6IiIsInR5cGUiOiJ1aW50MjU2IiwiaW50ZXJuYWxUeXBlIjoidWludDI1NiJ9XSwic3RhdGVNdXRhYmlsaXR5IjoidmlldyJ9LHsibmFtZSI6ImJhbGFuY2VPZkJhdGNoIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoiYWNjb3VudHMiLCJ0eXBlIjoiYWRkcmVzc1tdIiwiaW50ZXJuYWxUeXBlIjoiYWRkcmVzc1tdIn0seyJuYW1lIjoiaWRzIiwidHlwZSI6InVpbnQyNTZbXSIsImludGVybmFsVHlwZSI6InVpbnQyNTZbXSJ9XSwib3V0cHV0cyI6W3sibmFtZSI6IiIsInR5cGUiOiJ1aW50MjU2W10iLCJpbnRlcm5hbFR5cGUiOiJ1aW50MjU2W10ifV0sInN0YXRlTXV0YWJpbGl0eSI6InZpZXcifSx7Im5hbWUiOiJiYXNlVXJpIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbXSwib3V0cHV0cyI6W3sibmFtZSI6IiIsInR5cGUiOiJzdHJpbmciLCJpbnRlcm5hbFR5cGUiOiJzdHJpbmcifV0sInN0YXRlTXV0YWJpbGl0eSI6InZpZXcifSx7Im5hbWUiOiJjb3N0IiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbXSwib3V0cHV0cyI6W3sibmFtZSI6IiIsInR5cGUiOiJ1aW50MjU2IiwiaW50ZXJuYWxUeXBlIjoidWludDI1NiJ9XSwic3RhdGVNdXRhYmlsaXR5IjoidmlldyJ9LHsibmFtZSI6ImlzQXBwcm92ZWRGb3JBbGwiLCJ0eXBlIjoiZnVuY3Rpb24iLCJpbnB1dHMiOlt7Im5hbWUiOiJhY2NvdW50IiwidHlwZSI6ImFkZHJlc3MiLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn0seyJuYW1lIjoib3BlcmF0b3IiLCJ0eXBlIjoiYWRkcmVzcyIsImludGVybmFsVHlwZSI6ImFkZHJlc3MifV0sIm91dHB1dHMiOlt7Im5hbWUiOiIiLCJ0eXBlIjoiYm9vbCIsImludGVybmFsVHlwZSI6ImJvb2wifV0sInN0YXRlTXV0YWJpbGl0eSI6InZpZXcifSx7Im5hbWUiOiJtYXhQZXJNaW50IiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbXSwib3V0cHV0cyI6W3sibmFtZSI6IiIsInR5cGUiOiJ1aW50MzIiLCJpbnRlcm5hbFR5cGUiOiJ1aW50MzIifV0sInN0YXRlTXV0YWJpbGl0eSI6InZpZXcifSx7Im5hbWUiOiJtYXhQZXJXYWxsZXQiLCJ0eXBlIjoiZnVuY3Rpb24iLCJpbnB1dHMiOltdLCJvdXRwdXRzIjpbeyJuYW1lIjoiIiwidHlwZSI6InVpbnQzMiIsImludGVybmFsVHlwZSI6InVpbnQzMiJ9XSwic3RhdGVNdXRhYmlsaXR5IjoidmlldyJ9LHsibmFtZSI6Im1pbnQiLCJ0eXBlIjoiZnVuY3Rpb24iLCJpbnB1dHMiOlt7Im5hbWUiOiJjb3VudCIsInR5cGUiOiJ1aW50MzIiLCJpbnRlcm5hbFR5cGUiOiJ1aW50MzIifV0sIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJwYXlhYmxlIn0seyJuYW1lIjoibmFtZSIsInR5cGUiOiJmdW5jdGlvbiIsImlucHV0cyI6W10sIm91dHB1dHMiOlt7Im5hbWUiOiIiLCJ0eXBlIjoic3RyaW5nIiwiaW50ZXJuYWxUeXBlIjoic3RyaW5nIn1dLCJzdGF0ZU11dGFiaWxpdHkiOiJ2aWV3In0seyJuYW1lIjoib3BlbiIsInR5cGUiOiJmdW5jdGlvbiIsImlucHV0cyI6W10sIm91dHB1dHMiOlt7Im5hbWUiOiIiLCJ0eXBlIjoiYm9vbCIsImludGVybmFsVHlwZSI6ImJvb2wifV0sInN0YXRlTXV0YWJpbGl0eSI6InZpZXcifSx7Im5hbWUiOiJvd25lciIsInR5cGUiOiJmdW5jdGlvbiIsImlucHV0cyI6W10sIm91dHB1dHMiOlt7Im5hbWUiOiIiLCJ0eXBlIjoiYWRkcmVzcyIsImludGVybmFsVHlwZSI6ImFkZHJlc3MifV0sInN0YXRlTXV0YWJpbGl0eSI6InZpZXcifSx7Im5hbWUiOiJyZW5vdW5jZU93bmVyc2hpcCIsInR5cGUiOiJmdW5jdGlvbiIsImlucHV0cyI6W10sIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIn0seyJuYW1lIjoic2FmZUJhdGNoVHJhbnNmZXJGcm9tIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoiZnJvbSIsInR5cGUiOiJhZGRyZXNzIiwiaW50ZXJuYWxUeXBlIjoiYWRkcmVzcyJ9LHsibmFtZSI6InRvIiwidHlwZSI6ImFkZHJlc3MiLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn0seyJuYW1lIjoiaWRzIiwidHlwZSI6InVpbnQyNTZbXSIsImludGVybmFsVHlwZSI6InVpbnQyNTZbXSJ9LHsibmFtZSI6ImFtb3VudHMiLCJ0eXBlIjoidWludDI1NltdIiwiaW50ZXJuYWxUeXBlIjoidWludDI1NltdIn0seyJuYW1lIjoiZGF0YSIsInR5cGUiOiJieXRlcyIsImludGVybmFsVHlwZSI6ImJ5dGVzIn1dLCJvdXRwdXRzIjpbXSwic3RhdGVNdXRhYmlsaXR5Ijoibm9ucGF5YWJsZSJ9LHsibmFtZSI6InNhZmVUcmFuc2ZlckZyb20iLCJ0eXBlIjoiZnVuY3Rpb24iLCJpbnB1dHMiOlt7Im5hbWUiOiJmcm9tIiwidHlwZSI6ImFkZHJlc3MiLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn0seyJuYW1lIjoidG8iLCJ0eXBlIjoiYWRkcmVzcyIsImludGVybmFsVHlwZSI6ImFkZHJlc3MifSx7Im5hbWUiOiJpZCIsInR5cGUiOiJ1aW50MjU2IiwiaW50ZXJuYWxUeXBlIjoidWludDI1NiJ9LHsibmFtZSI6ImFtb3VudCIsInR5cGUiOiJ1aW50MjU2IiwiaW50ZXJuYWxUeXBlIjoidWludDI1NiJ9LHsibmFtZSI6ImRhdGEiLCJ0eXBlIjoiYnl0ZXMiLCJpbnRlcm5hbFR5cGUiOiJieXRlcyJ9XSwib3V0cHV0cyI6W10sInN0YXRlTXV0YWJpbGl0eSI6Im5vbnBheWFibGUifSx7Im5hbWUiOiJzZXRBcHByb3ZhbEZvckFsbCIsInR5cGUiOiJmdW5jdGlvbiIsImlucHV0cyI6W3sibmFtZSI6Im9wZXJhdG9yIiwidHlwZSI6ImFkZHJlc3MiLCJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIn0seyJuYW1lIjoiYXBwcm92ZWQiLCJ0eXBlIjoiYm9vbCIsImludGVybmFsVHlwZSI6ImJvb2wifV0sIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIn0seyJuYW1lIjoic2V0Q29zdCIsInR5cGUiOiJmdW5jdGlvbiIsImlucHV0cyI6W3sibmFtZSI6Il9jb3N0IiwidHlwZSI6InVpbnQyNTYiLCJpbnRlcm5hbFR5cGUiOiJ1aW50MjU2In1dLCJvdXRwdXRzIjpbXSwic3RhdGVNdXRhYmlsaXR5Ijoibm9ucGF5YWJsZSJ9LHsibmFtZSI6InNldE1heFBlck1pbnQiLCJ0eXBlIjoiZnVuY3Rpb24iLCJpbnB1dHMiOlt7Im5hbWUiOiJfbWF4IiwidHlwZSI6InVpbnQzMiIsImludGVybmFsVHlwZSI6InVpbnQzMiJ9XSwib3V0cHV0cyI6W10sInN0YXRlTXV0YWJpbGl0eSI6Im5vbnBheWFibGUifSx7Im5hbWUiOiJzZXRPcGVuIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoiX29wZW4iLCJ0eXBlIjoiYm9vbCIsImludGVybmFsVHlwZSI6ImJvb2wifV0sIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIn0seyJuYW1lIjoic2V0VVJJIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoiX3VyaSIsInR5cGUiOiJzdHJpbmciLCJpbnRlcm5hbFR5cGUiOiJzdHJpbmcifV0sIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIn0seyJuYW1lIjoic2V0bWF4UGVyV2FsbGV0IiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoiX21heCIsInR5cGUiOiJ1aW50MzIiLCJpbnRlcm5hbFR5cGUiOiJ1aW50MzIifV0sIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIn0seyJuYW1lIjoic3VwcGx5IiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbXSwib3V0cHV0cyI6W3sibmFtZSI6IiIsInR5cGUiOiJ1aW50MzIiLCJpbnRlcm5hbFR5cGUiOiJ1aW50MzIifV0sInN0YXRlTXV0YWJpbGl0eSI6InZpZXcifSx7Im5hbWUiOiJzdXBwb3J0c0ludGVyZmFjZSIsInR5cGUiOiJmdW5jdGlvbiIsImlucHV0cyI6W3sibmFtZSI6ImludGVyZmFjZUlkIiwidHlwZSI6ImJ5dGVzNCIsImludGVybmFsVHlwZSI6ImJ5dGVzNCJ9XSwib3V0cHV0cyI6W3sibmFtZSI6IiIsInR5cGUiOiJib29sIiwiaW50ZXJuYWxUeXBlIjoiYm9vbCJ9XSwic3RhdGVNdXRhYmlsaXR5IjoidmlldyJ9LHsibmFtZSI6InN5bWJvbCIsInR5cGUiOiJmdW5jdGlvbiIsImlucHV0cyI6W10sIm91dHB1dHMiOlt7Im5hbWUiOiIiLCJ0eXBlIjoic3RyaW5nIiwiaW50ZXJuYWxUeXBlIjoic3RyaW5nIn1dLCJzdGF0ZU11dGFiaWxpdHkiOiJ2aWV3In0seyJuYW1lIjoidG90YWxTdXBwbHkiLCJ0eXBlIjoiZnVuY3Rpb24iLCJpbnB1dHMiOltdLCJvdXRwdXRzIjpbeyJuYW1lIjoiIiwidHlwZSI6InVpbnQzMiIsImludGVybmFsVHlwZSI6InVpbnQzMiJ9XSwic3RhdGVNdXRhYmlsaXR5IjoidmlldyJ9LHsibmFtZSI6InRyYW5zZmVyT3duZXJzaGlwIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoibmV3T3duZXIiLCJ0eXBlIjoiYWRkcmVzcyIsImludGVybmFsVHlwZSI6ImFkZHJlc3MifV0sIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIn0seyJuYW1lIjoidXJpIiwidHlwZSI6ImZ1bmN0aW9uIiwiaW5wdXRzIjpbeyJuYW1lIjoiX3Rva2VuSWQiLCJ0eXBlIjoidWludDI1NiIsImludGVybmFsVHlwZSI6InVpbnQyNTYifV0sIm91dHB1dHMiOlt7Im5hbWUiOiIiLCJ0eXBlIjoic3RyaW5nIiwiaW50ZXJuYWxUeXBlIjoic3RyaW5nIn1dLCJzdGF0ZU11dGFiaWxpdHkiOiJ2aWV3In0seyJuYW1lIjoid2l0aGRyYXciLCJ0eXBlIjoiZnVuY3Rpb24iLCJpbnB1dHMiOltdLCJvdXRwdXRzIjpbXSwic3RhdGVNdXRhYmlsaXR5IjoicGF5YWJsZSJ9XQ=="></meta>
                      <meta name="nft-art-contract-presale" content="W10="></meta>
                      
                      <nftart-mint-button address="0x45A869895D1659E4d97462b892D19276c6FE57d4" chain-id="137" />

                    </StyledButton>
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
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
