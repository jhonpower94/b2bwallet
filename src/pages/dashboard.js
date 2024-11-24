import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { coinData$, userinfo$, walletData$ } from "../redux/action";
import axios from "axios";
import { SocketContext } from "../context/socket";
import axiosRetry from "axios-retry";
import { getNotification } from "../config/services";
import { Backdrop } from "@mui/material";
import { CustomCirleLoader } from "../components/loader";
import { Helmet } from "react-helmet";

export function DashboardIndex() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const socket = useContext(SocketContext);
  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const id = user.uid;

        socket.connect();

        function onConnect() {
          console.log("connected to server");
          const docRef = doc(db, "users", id);
          getDoc(docRef)
            .then((doc) => {
              const userData = doc.data();
              console.log(userData);
              const {
                btc_balance,
                bnb_balance,
                tron_balance,
                eth_balance,
                usdt_balance,
                usdterc20_balance,
                email,
              } = userData;

              //totalbalance
              const totalbalance = [
                btc_balance,
                bnb_balance,
                tron_balance,
                eth_balance,
                usdt_balance,
                usdterc20_balance,
              ].reduce((prv, cur) => {
                return prv + cur;
              }, 0);

              const username = email.split("@")[0];
              dispatch(
                userinfo$({
                  ...userData,
                  username: username,
                  id: id,
                  totalBalance: totalbalance,
                })
              );

              axios
                .get(
                  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Cbinancecoin%2Ctron%2Ctether%2Csora%2Csakura%2Cconvergence%2Cbarnbridge%2Ckira%2Cbakerytoken&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true"
                )
                .then((res) => {
                  console.log(res.data);
                  const dataArray = [
                    {
                      title: "ethereum",
                      symbol: "eth",
                      image: "./images/coins/eth.png",
                      price: res.data.ethereum.usd,
                      usd_market_cap: res.data.ethereum.usd_market_cap,
                      usd_24h_vol: res.data.ethereum.usd_24h_vol,
                      usd_24h_change: res.data.ethereum.usd_24h_change,
                    },
                    {
                      title: "binancecoin",
                      symbol: "bnb",
                      image: "./images/coins/bnb.png",
                      price: res.data.binancecoin.usd,
                      usd_market_cap: res.data.binancecoin.usd_market_cap,
                      usd_24h_vol: res.data.binancecoin.usd_24h_vol,
                      usd_24h_change: res.data.binancecoin.usd_24h_change,
                    },
                    {
                      title: "bitcoin",
                      symbol: "btc",
                      image: "./images/coins/btc.png",
                      price: res.data.bitcoin.usd,
                      usd_market_cap: res.data.bitcoin.usd_market_cap,
                      usd_24h_vol: res.data.bitcoin.usd_24h_vol,
                      usd_24h_change: res.data.bitcoin.usd_24h_change,
                    },
                    {
                      title: "tether",
                      image: "./images/coins/usdt.png",
                      price: res.data.tether.usd,
                      usd_market_cap: res.data.tether.usd_market_cap,
                      usd_24h_vol: res.data.tether.usd_24h_vol,
                      usd_24h_change: res.data.tether.usd_24h_change,
                    },
                    {
                      title: "tron",
                      price: res.data.tron.usd,
                      image: "./images/coins/tron.png",
                      usd_market_cap: res.data.tron.usd_market_cap,
                      usd_24h_vol: res.data.tron.usd_24h_vol,
                      usd_24h_change: res.data.tron.usd_24h_change,
                    },
                    {
                      title: "bakerytoken",
                      symbol: "bake",
                      image: "./images/coins/bakerytoken.png",
                      price: res.data.bakerytoken.usd,
                      usd_market_cap: res.data.bakerytoken.usd_market_cap,
                      usd_24h_vol: res.data.bakerytoken.usd_24h_vol,
                      usd_24h_change: res.data.bakerytoken.usd_24h_change,
                    },
                    {
                      title: "barnbridge",
                      symbol: "bond",
                      image: "./images/coins/barnbrigde.png",
                      price: res.data.barnbridge.usd,
                      usd_market_cap: res.data.barnbridge.usd_market_cap,
                      usd_24h_vol: res.data.barnbridge.usd_24h_vol,
                      usd_24h_change: res.data.barnbridge.usd_24h_change,
                    },
                    {
                      title: "convergence",
                      symbol: "conv",
                      image: "./images/coins/convergence.png",
                      price: res.data.convergence.usd,
                      usd_market_cap: res.data.convergence.usd_market_cap,
                      usd_24h_vol: res.data.convergence.usd_24h_vol,
                      usd_24h_change: res.data.convergence.usd_24h_change,
                    },

                    {
                      title: "kira",
                      symbol: "kira",
                      image: "./images/coins/kex.png",
                      price: res.data.kira.usd,
                      usd_market_cap: res.data.kira.usd_market_cap,
                      usd_24h_vol: res.data.kira.usd_24h_vol,
                      usd_24h_change: res.data.kira.usd_24h_change,
                    },
                    {
                      title: "sakura",
                      image: "./images/coins/sakura.png",
                      price: res.data.sakura.usd,
                      usd_market_cap: res.data.sakura.usd_market_cap,
                      usd_24h_vol: res.data.sakura.usd_24h_vol,
                      usd_24h_change: res.data.sakura.usd_24h_change,
                    },
                    {
                      title: "sora",
                      image: "./images/coins/xor.png",
                      price: res.data.sora.usd,
                      usd_market_cap: res.data.sora.usd_market_cap,
                      usd_24h_vol: res.data.sora.usd_24h_vol,
                      usd_24h_change: res.data.sora.usd_24h_change,
                    },
                  ];
                  dispatch(coinData$(dataArray));
                  dispatch(
                    walletData$([
                      {
                        coinname: "BITCOIN",
                        cointype: "btc_balance",
                        price: res.data.bitcoin.usd,
                        difference: res.data.bitcoin.usd_24h_change,
                        balance: btc_balance,
                        balancecoin: btc_balance,
                        code: "BTC",
                        symbol: "BTC",
                        image: "./images/coins/btc.png",
                        thumbimage: "./images/coins/btc.png",
                        address: "bc1qeq9w46mm04f65sff0dugnewj08ws6hvjt5p69k",
                        volume: res.data.bitcoin.usd_24h_vol,
                        marketcap: res.data.bitcoin.usd_market_cap,
                        discription:
                          "Bitcoin is the first successful internet money based on peer-to-peer technology; whereby no central bank or authority is involved in the transaction and production of the Bitcoin currency. It was created by an anonymous individual/group under the name, Satoshi Nakamoto.  It is a decentralized peer-to-peer internet currency making mobile payment easy, very low transaction fees, protects your identity, and it works anywhere all the time with no central authority and banks.",
                      },
                      {
                        coinname: "ETHEREUM",
                        cointype: "eth_balance",
                        price: res.data.ethereum.usd,
                        difference: res.data.ethereum.usd_24h_change,
                        volume: res.data.ethereum.usd_24h_vol,
                        marketcap: res.data.ethereum.usd_market_cap,
                        balance: eth_balance,
                        balancecoin: eth_balance,
                        code: "ETH",
                        symbol: "ETH",
                        image: "./images/coins/eth.png",
                        thumbimage: "./images/coins/eth.png",
                        address: "0x2855560f342943893b31E666B87e7C9F739a6B80",
                        discription:
                          "Ethereum is a global, open-source platform for decentralized applications. In other words, the vision is to create a world computer that anyone can build applications in a decentralized manner; while all states and data are distributed and publicly accessible. Ethereum supports smart contracts in which developers can write code in order to program digital value.",
                      },
                      {
                        coinname: "BNB SMART",
                        cointype: "bnb_balance",
                        price: res.data.binancecoin.usd,
                        difference: res.data.binancecoin.usd_24h_change,
                        volume: res.data.binancecoin.usd_24h_vol,
                        marketcap: res.data.binancecoin.usd_market_cap,
                        balance: bnb_balance,
                        balancecoin: bnb_balance,
                        code: "BNB",
                        symbol: "BNB",
                        image: "./images/coins/bnb.png",
                        thumbimage: "./images/coins/bnb.png",
                        address: "bnb18vaccqjkynza4zn60qa92a4jwx56cezl8g2nyw",
                        discription:
                          "Binance Coin is the cryptocurrency of the Binance platform. It is a trading platform exclusively for cryptocurrencies. The name Binance is a combination of binary and finance. Thus, the startup name shows that only cryptocurrencies can be traded against each other. The platform achieved an enormous success within a very short time and is focused on worldwide market with Malta headquarters.",
                      },
                      {
                        coinname: "TRON",
                        cointype: "tron_balance",
                        price: res.data.tron.usd,
                        difference: res.data.tron.usd_24h_change,
                        volume: res.data.tron.usd_24h_vol,
                        marketcap: res.data.tron.usd_market_cap,
                        balance: tron_balance,
                        balancecoin: tron_balance,
                        code: "TRX",
                        symbol: "TRX",
                        image: "./images/coins/tron.png",
                        thumbimage: "./images/coins/tron.png",
                        address: "TLqU79xYtkabvU1ejWefdxGVzR91ZnP619",
                        discription:
                          "Tron's mission is to build a truly decentralized internet and aims to be the largest blockchain-based operating system in the world, known as the TRON protocol. The TRON protocol will offer high scalability, high availability, and high throughput computing to serve decentralized applications via smart contracts. Ethereum EVM-based smart contracts will be compatible and deployable on the TRON network as such Solidity developers do not have to rewrite their applications.",
                      },
                      {
                        coinname: "USDT-TRC20",
                        cointype: "usdt_balance",
                        price: res.data.tether.usd,
                        difference: res.data.tether.usd_24h_change,
                        volume: res.data.tether.usd_24h_vol,
                        marketcap: res.data.tether.usd_market_cap,
                        balance: usdt_balance,
                        balancecoin: usdt_balance,
                        code: "USDT TRC20",
                        symbol: "USDT",
                        image: "./images/coins/usdt.png",
                        thumbimage: "./images/coins/tron.png",
                        address: "TLqU79xYtkabvU1ejWefdxGVzR91ZnP619",
                        discription:
                          "Tether (USDT) is a cryptocurrency with a value meant to mirror the value of the U.S. dollar. The idea was to create a stable cryptocurrency that can be used like digital dollars. Coins that serve this purpose of being a stable dollar substitute are called “stable coins.” Tether is the most popular stable coin and even acts as a dollar replacement on many popular exchanges! According to their site, Tether converts cash into digital currency, to anchor or “tether” the value of the coin to the price of national currencies like the US dollar, the Euro, and the Yen.",
                      },
                      {
                        coinname: "USDT-ERC20",
                        cointype: "usdterc20_balance",
                        price: res.data.tether.usd,
                        difference: res.data.tether.usd_24h_change,
                        volume: res.data.tether.usd_24h_vol,
                        marketcap: res.data.tether.usd_market_cap,
                        balance: usdterc20_balance,
                        balancecoin: usdterc20_balance,
                        symbol: "USDT",
                        code: "USDT ERC20",
                        image: "./images/coins/usdt.png",
                        thumbimage: "./images/coins/eth.png",
                        address: "0x2855560f342943893b31E666B87e7C9F739a6B80",
                        discription:
                          "Tether (USDT) is a cryptocurrency with a value meant to mirror the value of the U.S. dollar. The idea was to create a stable cryptocurrency that can be used like digital dollars. Coins that serve this purpose of being a stable dollar substitute are called “stable coins.” Tether is the most popular stable coin and even acts as a dollar replacement on many popular exchanges! According to their site, Tether converts cash into digital currency, to anchor or “tether” the value of the coin to the price of national currencies like the US dollar, the Euro, and the Yen.",
                      },
                    ])
                  );
                })
                .then(() => {
                  setLoading(false);
                })
                .catch((error) => console.log(error));

              axiosRetry(axios, {
                retries: 4,
                // retryDelay: axiosRetry.exponentialDelay,
              });
            })
            .catch((err) => {
              console.log(err);
            });
        }

        socket.on("connect", onConnect);

        getNotification(user.uid);
      } else {
        navigate("/auth");
      }
    });
  }, [socket]);

  return (
    <>
      <Helmet>
        <script src="//code.jivosite.com/widget/tcYCPabedY" async></script>
      </Helmet>
      <Outlet />

      <Backdrop
        sx={{ backgroundColor: "rgb(255 255 255 / 50%)" }}
        open={loading}
      >
        <CustomCirleLoader />
      </Backdrop>
    </>
  );
}
