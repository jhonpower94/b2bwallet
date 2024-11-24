import { Button, Option, Select, Snackbar } from "@mui/joy";
import { Typography } from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { DebounceInput } from "react-debounce-input";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderBackButtonCoin from "../components/HeaderBackButtonCoin";
import { MaxButton } from "../components/StyledButtons";
import { LoaderSmall } from "../components/loader";
import { db } from "../config/firebase";
import { CurrencyFormat, updateUserBalance } from "../config/services";
import styles from "./Send.module.css";
import { SocketContext } from "../context/socket";

const Send = () => {
  const navigate = useNavigate();
  let { state } = useLocation();
  const socket = useContext(SocketContext);
  const userInfos = useSelector((state) => state.useInfos);
  const { tron_balance, eth_balance, id } = userInfos;
  const [loading, setLoading] = useState(false);
  const [loadingConvert, setLoadingConvert] = useState(false);
  const [loadingMax, setLoadingMax] = useState(false);
  const [value, setValue] = useState({
    amount: 0,
    coin: "",
    address: "",
    network: "Tron",
    alerMessage: "",
    severity: "warning",
  });

  const { image, coinname, code, symbol, cointype, balance } = state.coin;

  useEffect(() => {
    function onDisconnect() {
      console.log("socket disconnected ");
    }

    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("disconnect", onDisconnect);
    };
  }, [value]);

  const switchWalletBalance = (key) => {
    switch (key) {
      case "Tron":
        return tron_balance;
      default:
        return eth_balance;
    }
  };

  const switchNetwork = (key) => {
    switch (key) {
      case "Tron":
        return { name: "Tron", type: "tron_balance" };
      default:
        return { name: "Ethereum", type: "eth_balance" };
    }
  };

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    setOpenSnackbar(false);
  };

  const handleChange = (event) => {
    setValue({
      ...value,
      [event.target.name]: event.target.value,
    });
    console.log({ name: event.target.name, value: event.target.value });
  };

  const setCurrency = (event, amount) => {
    setValue({
      ...value,
      [event.target.name]: event.target.value,
      amount: amount,
    });
  };

  const setMaxCoin = () => {
    if (balance > 0) {
      setLoadingMax(true);
      socket.emit("maxcoin", {
        from: "USDT",
        to: code,
        amount: balance,
      });
      socket.on("maxcoin", (value) => {
        setValue({ ...value, coin: value, amount: balance });
        setLoadingMax(false);
      });
    }
  };

  const submitform = (event) => {
    event.preventDefault();
    setLoading(true);

    const selectedNetworkBalance = switchWalletBalance(value.network);
    const selectedNetwork = switchNetwork(value.network).name;
    const selectedNetworkType = switchNetwork(value.network).type;

    if (balance < value.amount || balance == 0) {
      setValue({
        ...value,
        severity: "warning",
        alerMessage: `
        Insufficient ${coinname} balance`,
      });
      setOpenSnackbar(true);
      setLoading(false);
    } else if (selectedNetworkBalance < 350) {
      setTimeout(() => {
        setValue({
          ...value,
          severity: "warning",
          alerMessage: `
          You do not have enough ${selectedNetwork} to cover your network fee.`,
        });
        setOpenSnackbar(true);
        setLoading(false);
      }, 8000);
    } else {
      const newbalance = balance - value.amount;
      // add newbalance
      updateUserBalance(id, cointype, newbalance).then(() => {
        const newNetworkBalance = selectedNetworkBalance - 350;
        // add new network balance
        updateUserBalance(id, selectedNetworkType, newNetworkBalance).then(
          () => {
            // add transactions
            const data = {
              fullname: `${userInfos.firstName} ${userInfos.lastName}`,
              email: userInfos.email,
              userid: userInfos.id,
              cointitle: code,
              cointype: cointype,
              selectednetwordtype: selectedNetworkType,
              amount: value.amount,
              coin: value.coin,
              recipient: value.address,
              transaction_type: "Debit",
              confirmation: 0,
              pending: true,
              timestamp: serverTimestamp(),
            };
            const trxRef = doc(collection(db, "users", id, "transactions"));
            setDoc(trxRef, { ...data }).then(() => {
              // add general transaction
              const trxwalletRef = collection(db, "transactionswallet");
              addDoc(trxwalletRef, {
                ...data,
                transactionid: trxRef.id,
              }).then(() => {
                console.log("Sent");
                setValue({
                  ...value,
                  severity: "success",
                  alerMessage: `You have successfully sent $${value.amount} - ${value.coin} ${code}`,
                });
                setOpenSnackbar(true);
                setLoading(false);
                setTimeout(() => {
                  navigate("/");
                }, 5000);
              });
            });
          }
        );
      });
    }
  };

  return (
    <>
      <form onSubmit={submitform}>
        <div className={styles.send}>
          <HeaderBackButtonCoin coinImage={image} title={`Send ${code}`} />
          <div className={styles.btcAvailableWrapper}>
            <div className={styles.btcAvailable}>
              <Typography variant="body1">
                <CurrencyFormat
                  amount={balance}
                  prefix={"$"}
                  seperator={true}
                />
                {" available "}
                {code}
              </Typography>
            </div>
          </div>

          <div className={styles.frame1}>
            <div className={styles.amount}>Enter amount in {code} value</div>
            <div className={styles.frameGroup}>
              <DebounceInput
                minLength={0}
                debounceTimeout={1000}
                className={styles.frame2}
                type="number"
                name="coin"
                placeholder="0.0000"
                value={value.coin}
                onChange={(event) => {
                  if (event.target.value > 0) {
                    setLoadingConvert(true);
                    console.log(event.target.value);
                    const socketId = Math.floor(Math.random() * 90000) + 10000;
                    socket.emit("convertSend", {
                      from: symbol,
                      to: "USDT",
                      amount: Number(event.target.value),
                      socketid: socketId,
                    });
                    socket.on(`${socketId}`, (amount) => {
                      setCurrency(event, amount);
                      setLoadingConvert(false);
                    });
                  }
                }}
              />
              <MaxButton
                loading={loadingMax}
                text={"Max"}
                className={styles.frame3}
                handleClick={setMaxCoin}
              />
            </div>
            <div className={styles.amount}>
              You will receive{" "}
              {loadingConvert ? (
                <LoaderSmall />
              ) : (
                <CurrencyFormat
                  amount={value.amount}
                  prefix={"$"}
                  seperator={true}
                />
              )}
            </div>
          </div>

          <div className={styles.frame4}>
            <div className={styles.amount}>Receivers {code} address</div>
            <input
              className={styles.frame5}
              type="text"
              name="address"
              value={value.address}
              onChange={handleChange}
            />
          </div>

          <div className={styles.addressParent}>
            <Select
              placeholder="Select network"
              name="network"
              required
              size="lg"
              defaultValue={value.network}
              onChange={(event) => {
                setValue({
                  ...value,
                  network: event.target.value,
                });
              }}
              sx={{ width: "100%" }}
            >
              <Option value="Tron">Tron</Option>
              <Option value="Ethereum">Ethereum</Option>
            </Select>
          </div>

          <div className={styles.frameWrapper}>
            <Button
              type="submit"
              size="lg"
              loading={loading || loadingConvert}
              fullWidth
            >
              Continue
            </Button>
          </div>
        </div>
        <Snackbar
          color={value.severity}
          size="lg"
          variant="soft"
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={openSnackbar}
          onClose={handleCloseSnackbar}
        >
          {value.alerMessage}
        </Snackbar>
      </form>
    </>
  );
};

export default Send;
