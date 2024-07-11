import { Close } from "@mui/icons-material";
import {
    Avatar,
    IconButton,
    ListDivider,
    ListItemDecorator,
    Option,
    Select,
    Snackbar,
} from "@mui/joy";
import { doc, setDoc } from "firebase/firestore";
import { Fragment, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HeaderBackButton from "../components/HeaderBackButton";
import CustomizedButtons from "../components/StyledButtons";
import { db } from "../config/firebase";
import {
    CryptoCurrencyFormat,
    CurrencyFormat,
    sendMessage,
} from "../config/services";
import styles from "./Swap.module.css";
import { CryptoFormater } from "../config/services";
import { CustomCirleLoader, LoaderSmall } from "../components/loader";
import { DebounceInput } from "react-debounce-input";
import { SocketContext } from "../context/socket";
import { Backdrop } from "@mui/material";

const options = [
  {
    value: "btc",
    label: "BTC",
    src: "./images/coins/btc.png",
    cointype: "btc_balance",
  },
  {
    value: "bnb",
    label: "BNB",
    src: "./images/coins/bnb.png",
    cointype: "bnb_balance",
  },

  {
    value: "usdt-trc",
    label: "USDT",
    src: "./images/coins/usdt.png",
    cointype: "usdt_balance",
  },
];

function renderValue(option) {
  if (!option) {
    return null;
  }

  return (
    <>
      <ListItemDecorator>
        <Avatar
          sx={{ width: 25, height: 25 }}
          src={options.find((o) => o.value === option.value)?.src}
        />
      </ListItemDecorator>
      {option.label}
    </>
  );
}

const Swap = () => {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [loadingConvert, setLoadingConvert] = useState(false);
  const userInfos = useSelector((state) => state.useInfos);
  const {
    btc_balance,
    bnb_balance,
    tron_balance,
    eth_balance,
    usdt_balance,
    usdterc20_balance,
    id,
  } = userInfos;

  const [values, setValues] = useState({
    from: "btc",
    to: "usdt-trc",
    fromlabel: "BTC",
    fromtype: "btc_balance",
    fromamount: 0.0,
    fromamountUsd: 0,
    frombalance: btc_balance,
    tolabel: "USDT",
    totype: "usdt_balance",
    toamount: 0.0,
    toamountUsd: 0.0,
    tobalance: tron_balance,
    quoterate: 0,
    alerMessage: "",
    severity: "warning",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    setOpenSnackbar(false);
  };

  const switchWalletBalance = (key) => {
    switch (key) {
      case "btc":
        return btc_balance;
      case "bnb":
        return bnb_balance;
      case "usdt-erc":
        return usdterc20_balance;
      default:
        return usdt_balance;
    }
  };

  const gassfee = 50;

  useEffect(() => {
    return () => {
      socket.off("convertfrom");
      socket.off("convertTo");
      socket.off("quoterate");
    };
  }, [values]);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      values.frombalance < values.fromamountUsd ||
      values.fromamountUsd == 0
    ) {
      setValues({
        ...values,
        severity: "warning",
        alerMessage: `
        Insufficient ${values.fromlabel} balance`,
      });
      setOpenSnackbar(true);
      setLoading(false);
    } else if (eth_balance < gassfee) {
      setTimeout(() => {
        setValues({
          ...values,
          severity: "warning",
          alerMessage: `
          You do not have enough ethereum to cover your network fees`,
        });
        setOpenSnackbar(true);
        setLoading(false);
      }, 4000);
    } else {
      const newbalanceFrom = values.frombalance - values.fromamountUsd;
      const newbalanceTo = values.toamountUsd + values.tobalance;
      const newEthBalance = eth_balance - gassfee;
      const querydoc = doc(db, `users/${userInfos.id}`);
      setDoc(
        querydoc,
        {
          eth_balance: newEthBalance,
        },
        { merge: true }
      ).then(() => {
        // add transactions
        console.log("Swaped");
        sendMessage(
          `Swap Request from details below: <br/><br/>
            useremail: ${userInfos.email}<br/>
            userID: ${userInfos.id}<br/>
            from: ${values.fromlabel}<br/>
            to: ${values.tolabel}<br/>
            amount: ${values.fromamountUsd}`,
          "Swap Request",
          "blockbitwallet@gmail.com",
          "Admin"
        ).then(() => {
          setValues({
            ...values,
            severity: "success",
            alerMessage: `You have successfully sent $${values.fromamountUsd} - ${values.fromamount} ${values.fromlabel}`,
          });
          setOpenSnackbar(true);
          setLoading(false);

          setTimeout(() => {
            window.location = window.location.origin;
          }, 6000);
        });
      });
    }
  };

  return (
    <form onSubmit={submit} style={{ width: "100%" }}>
      <div className={styles.swap}>
        <HeaderBackButton userImageUrl="Swap" />

        <div className={styles.frameParent}>
          <div className={styles.frame}>
            <div className={styles.frameGroup}>
              <Select
                defaultValue={values.from}
                variant="soft"
                name="from"
                slotProps={{
                  listbox: {
                    sx: {
                      "--ListItemDecorator-size": "44px",
                    },
                  },
                }}
                sx={{
                  "--ListItemDecorator-size": "44px",
                  minWidth: 10,
                }}
                renderValue={renderValue}
                required
              >
                {options.map((option, index) => (
                  <Fragment key={option.value}>
                    {index !== 0 ? (
                      <ListDivider role="none" inset="startContent" />
                    ) : null}
                    <Option
                      value={option.value}
                      label={option.label}
                      onClick={() => {
                        setValues({
                          ...values,
                          from: option.value,
                          fromlabel: option.label,
                          fromtype: option.cointype,
                          frombalance: switchWalletBalance(option.value),
                        });
                      }}
                    >
                      <ListItemDecorator>
                        <Avatar
                          sx={{ width: 25, height: 25 }}
                          src={option.src}
                        />
                      </ListItemDecorator>
                      {option.label}
                    </Option>
                  </Fragment>
                ))}
              </Select>

              <DebounceInput
                minLength={0}
                debounceTimeout={1000}
                className={styles.input}
                placeholder="0.00"
                step=".00001"
                type="number"
                value={values.fromamount}
                autoFocus
                name="fromamount"
                onChange={(event) => {
                  if (event.target.value > 0) {
                    setLoadingConvert(true);
                    console.log(event.target.value);

                    socket.emit("convertfrom", {
                      from: values.fromlabel,
                      to: "USDT",
                      amount: Number(event.target.value),
                    });

                    socket.on("convertfrom", (datafrom) => {
                      socket.emit("convertTo", {
                        from: "USDT",
                        to: values.tolabel,
                        amount: datafrom,
                      });
                      socket.on("convertTo", (datato) => {
                        // quoterate
                        socket.emit("quoterate", {
                          from: values.fromlabel,
                          to: "USDT",
                          amount: 1,
                        });
                        socket.on("quoterate", (quoterate) => {
                          console.log(datato);
                          setValues({
                            ...values,
                            [event.target.name]: event.target.value,
                            fromamountUsd: datafrom,
                            toamount: datato,
                            toamountUsd: datafrom,
                            quoterate: quoterate,
                          });
                          setLoadingConvert(false);
                        });
                      });
                    });
                  }
                }}
              />
            </div>
            <div className={styles.frame2}>
              <div className={styles.balance0}>
                Balance: <CurrencyFormat amount={values.frombalance} />{" "}
              </div>
              <div className={styles.div1}>
                <CurrencyFormat
                  amount={values.fromamountUsd}
                  prefix={"$"}
                  seperator={true}
                />
              </div>
            </div>
            <div className={styles.notEnoughEth}>
              {values.fromamountUsd > values.frombalance ? (
                "Not enough ETH"
              ) : (
                <div style={{ height: 20 }} />
              )}
            </div>
          </div>
          <div className={styles.frame3}>
            <div className={styles.frameGroup}>
              <Select
                defaultValue={values.to}
                variant="soft"
                name="to"
                slotProps={{
                  listbox: {
                    sx: {
                      "--ListItemDecorator-size": "44px",
                    },
                  },
                }}
                sx={{
                  "--ListItemDecorator-size": "44px",
                  minWidth: 10,
                }}
                renderValue={renderValue}
              >
                {options.map((option, index) => (
                  <Fragment key={option.value}>
                    {index !== 0 ? (
                      <ListDivider role="none" inset="startContent" />
                    ) : null}
                    <Option
                      value={option.value}
                      label={option.label}
                      onClick={() => {
                        setValues({
                          ...values,
                          to: option.value,
                          totype: option.cointype,
                          tolabel: option.label,
                          tobalance: switchWalletBalance(option.value),
                        });
                      }}
                    >
                      <ListItemDecorator>
                        <Avatar
                          sx={{ width: 25, height: 25 }}
                          src={option.src}
                        />
                      </ListItemDecorator>
                      {option.label}
                    </Option>
                  </Fragment>
                ))}
              </Select>
              <div className={styles.wrapper}>
                <div className={styles.div}>
                  {loadingConvert ? (
                    <LoaderSmall />
                  ) : (
                    <CryptoCurrencyFormat
                      amount={values.toamount}
                      suffix={""}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className={styles.frame2}>
              <div className={styles.balance0}>
                Balance:{" "}
                <CurrencyFormat
                  amount={values.tobalance}
                  prefix={"$"}
                  seperator={true}
                />
              </div>
              <div className={styles.div1}>
                <CurrencyFormat
                  amount={values.toamountUsd}
                  prefix={"$"}
                  seperator={true}
                />
              </div>
            </div>
          </div>
          <div className={styles.frame6}>
            <img className={styles.southIcon} alt="" src="/south@2x.png" />
          </div>
        </div>
        <div className={styles.frameDiv}>
          <div className={styles.frameParent1}>
            <div className={styles.frame7}>
              <div className={styles.quoteRate}>Quote rate</div>
              <div className={styles.frame8}>
                <div className={styles.div4}>1</div>
                <div className={styles.eth2}>{values.fromlabel}</div>
                <div className={styles.div4}>=</div>
                <div className={styles.div6}>
                  <CryptoCurrencyFormat amount={values.quoterate} suffix={""} />
                </div>
                <div className={styles.dai}>{values.tolabel}</div>
              </div>
            </div>
            <div className={styles.frame9}>
              <div className={styles.frame10}>
                <div className={styles.div}>Estimated gas fee</div>
                <img
                  className={styles.vectorIcon}
                  alt=""
                  src="/vector5@2x.png"
                />
              </div>
              <div className={styles.frame11}>
                <div className={styles.ethWrapper}>
                  <div className={styles.eth3}>
                    <CryptoFormater amount={gassfee} suffix={"ETH"} />
                  </div>
                </div>
                <div className={styles.div7}>
                  <CurrencyFormat
                    amount={gassfee}
                    prefix={"$"}
                    seperator={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.frame12}>
            <div className={styles.maxFee}>Max fee:</div>
            <div className={styles.div8}>
              <CurrencyFormat amount={gassfee} prefix={"$"} seperator={true} />
            </div>
          </div>
        </div>
        <div className={styles.frame13}>
          <div className={styles.maxFee}>Includes a 0.875% MetaMask fee –</div>
          <div className={styles.viewAllQuotes}>view all quotes</div>
        </div>
        <div className={styles.frameWrapper}>
          <CustomizedButtons
            loading={loading || loadingConvert}
            text={"Swap"}
          />
        </div>
      </div>
      <Snackbar
        color={values.severity}
        size="lg"
        variant="soft"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        autoHideDuration={5000}
        endDecorator={
          <IconButton onClick={handleCloseSnackbar} variant="plain">
            <Close />
          </IconButton>
        }
      >
        {values.alerMessage}
      </Snackbar>
      <Backdrop
        sx={{ backgroundColor: "rgb(255 255 255 / 50%)" }}
        open={loadingConvert}
      >
        <CustomCirleLoader />
      </Backdrop>
    </form>
  );
};

export default Swap;

/*
 convertFrom(event, values.from).then((data) => {
                    convertTo(data, values.to).then((vl) => {
                      if (vl > 0) {
                        convertToUsd(values.to, vl).then((toUSD) => {
                          handleQuoteRateFrom(values.from).then((retamount) => {
                            // console.log(retamount.toFixed(0));
                            handleQuoteRateTo(
                              values.to,
                              retamount.toFixed(0)
                            ).then((quoterate) => {
                              //  console.log(quoterate.toFixed(5));
                              setValues({
                                ...values,
                                [event.target.name]: event.target.value,
                                fromamountUsd: data,
                                toamount: vl,
                                toamountUsd: toUSD,
                                quoterate: quoterate.toFixed(5),
                              });
                            });
                          });
                        });
                      } else {
                        setValues({
                          ...values,
                          toamount: 0,
                        });
                      }
                    });
                  });

                  */
