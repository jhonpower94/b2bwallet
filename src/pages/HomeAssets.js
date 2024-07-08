import {
  Add,
  ArrowDownward,
  ArrowUpward,
  ExpandMoreRounded,
  Notifications,
  Settings,
  SwapHoriz,
} from "@mui/icons-material";
import { Avatar, Badge, CssVarsProvider, Dropdown, IconButton, Menu, MenuButton, MenuItem, Stack } from "@mui/joy";
import { Typography } from "@mui/material";
import { useFirestoreQuery } from "@react-query-firebase/firestore";
import { signOut } from "firebase/auth";
import { collection, orderBy, query } from "firebase/firestore";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import AssetItem from "../components/AssetItem";
import HistoryItem from "../components/HistoryItem";
import CustomizedTabs from "../components/tabs";
import { auth, db } from "../config/firebase";
import { CurrencyFormat } from "../config/services";
import styles from "./HomeAssets.module.css";
import { joyTheme } from "./dashboard";

const HomeAssets = () => {
  const navigate = useNavigate();
  const userinfo = useSelector((state) => state.useInfos);
  const allNotifications = useSelector((state) => state.notification);
  const [value, setValue] = useState("/");

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(newValue);
    console.log(newValue);
  };

  const logOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Signed out");
        navigate("/auth");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    
      <div className={styles.homeAssets}>
        <div className={styles.header}>
          <div className={styles.frameParent}>
            <div className={styles.frameWrapper}>
              <Dropdown>
                <MenuButton
                  variant="plain"
                  // color="primary"
                  startDecorator={
                    <Avatar alt="Kryptovault" src="./logo.png" size="sm" />
                  }
                  endDecorator={<ExpandMoreRounded />}
                >
                  {/*<div className={styles.jhonpower94c}>{userinfo.username}</div>*/}
                  Account
                </MenuButton>
                <Menu size="lg">
                  <MenuItem onClick={() => navigate("profile")}>
                    My profile
                  </MenuItem>
                  <MenuItem onClick={logOut}>Sign out</MenuItem>
                </Menu>
              </Dropdown>
            </div>
            <Stack direction="row" spacing={2}>
              <IconButton
                onClick={() => navigate("settings")}
                color="primary"
                variant="soft"
              >
                <Settings />
              </IconButton>
              <Badge
                badgeContent={allNotifications.length}
                color="warning"
                variant="solid"
              >
                <IconButton
                  onClick={() => navigate("notifications")}
                  color="primary"
                  variant="soft"
                >
                  <Notifications />
                </IconButton>
              </Badge>
            </Stack>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.div}>
            <CurrencyFormat
              amount={userinfo.totalBalance}
              prefix={"$"}
              seperator={true}
            />
          </div>
        </div>
        <CssVarsProvider theme={joyTheme}>
        <div className={styles.circlebuttonGroups}>
          {[
            { title: "Send", path: "allcoin", icon: <ArrowUpward /> },
            { title: "Receive", path: "receive", icon: <ArrowDownward /> },
            { title: "Swap", path: "swap", icon: <SwapHoriz /> },
            //  { title: "Buy", path: "buy", icon: <Add /> },
          ].map((btn, index) => (
            <Stack
              key={index}
              direction="column"
              spacing={1}
              justifyContent="center"
              alignItems="center"
            >
              <IconButton
                sx={{
                  "--IconButton-size": "50px",
                  width: "fit-content",
                }}
                variant="soft"
                color="primary"
                size="lg"
                onClick={() => navigate(`/${btn.path}`)}
              >
                {btn.icon}
              </IconButton>
              <div className={styles.buy1}>{btn.title}</div>
            </Stack>
          ))}
          <Stack
            direction="column"
            spacing={1}
            justifyContent="center"
            alignItems="center"
          >
            <Dropdown>
              <MenuButton
                slots={{ root: IconButton }}
                slotProps={{
                  root: {
                    variant: "soft",
                    color: "primary",
                    sx: {
                      "--IconButton-size": "50px",
                      width: "fit-content",
                    },
                  },
                }}
                size="lg"
              >
                <Add />
              </MenuButton>
              <Menu size="lg">
                {[
                  { title: "Transak", link: "https://global.transak.com/" },
                  { title: "AlchemyPay", link: "https://ramp.alchemypay.org" },
                  { title: "Simplex", link: "https://buy.simplex.com/" },
                ].map((pay, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => window.open(pay.link, "_blank")}
                  >
                    {pay.title}
                  </MenuItem>
                ))}
              </Menu>
            </Dropdown>
            <div className={styles.buy1}>Buy</div>
          </Stack>
        </div>

        <CustomizedTabs value={value} handleChange={handleChange} />
        </CssVarsProvider>
        <Outlet />
      </div>
    
  );
};

export default HomeAssets;

// Assetstab
export const Assets = () => {
  const walletData = useSelector((state) => state.walletsData);

  return (
    <>
      <div className={styles.coinlist}>
        {walletData.map((coin, index) => (
          <AssetItem
            coin={coin}
            key={index}
            frameImageUrl="/frame-80"
            frameIconUrl={coin.image}
            propCursor="pointer"
            propBackgroundImage={`url(${coin.image})`}
          />
        ))}
      </div>
    </>
  );
};

// NFTs tab
export const Nfts = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.lightbuttonWrapper}>
        <button
          className={styles.lightbutton}
          onClick={() => navigate("/receive")}
        >
          <div className={styles.getFreeTestnet}>Import NFTs</div>
        </button>
      </div>
    </>
  );
};

// Activity tab
export const Activity = () => {
  let { userid } = useParams();

  const ref = query(
    collection(db, "users", userid, "transactions"),
    orderBy("timestamp", "desc")
  );
  const querY = useFirestoreQuery(["transactions"], ref);

  if (querY.isLoading) {
    return <Typography>Loading...</Typography>;
  }

  const snapshot = querY.data;

  return snapshot.docs.map((docSnapshot, index) => {
    const data = docSnapshot.data();
    const { transaction_type, cointitle } = data;

    const isCredit = transaction_type === "Credit";

    const switchImage = (key) => {
      switch (key) {
        case "BTC":
          return "../images/coins/btc.png";
        case "ETH":
          return "../images/coins/eth.png";
        case "BNB":
          return "../images/coins/eth.png";
        case "TRX":
          return "../images/coins/tron.png";
        case "USDT":
          return "../images/coins/usdt.png";
        default:
          return "../images/coins/usdt.png";
      }
    };

    return (
      <HistoryItem
        key={index}
        data={data}
        itemCode={isCredit ? "/call-received@2x.png" : "/call-made@2x.png"}
        imageCode={switchImage(cointitle)}
        frameBorder={isCredit ? "1px solid blue" : "1px solid #8a919e"}
      />
    );
  });
};
