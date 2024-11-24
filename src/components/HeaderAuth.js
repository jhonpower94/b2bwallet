import { useMemo } from "react";
import styles from "./HeaderAuth.module.css";

const HeaderAuth = ({
  buttonText,
  rectangleIconWidth,
  rectangleIconAlignSelf,
  rectangleIconHeight,
}) => {
  const frameDivStyle = useMemo(() => {
    return {
      width: rectangleIconWidth,
      alignSelf: rectangleIconAlignSelf,
      height: rectangleIconHeight,
    };
  }, [rectangleIconWidth, rectangleIconAlignSelf, rectangleIconHeight]);

  return (
    <div className={styles.rectangleParent} style={frameDivStyle}>
      <img className={styles.frameChild} alt="" src="/logo.png" />
      <div className={styles.coinnameWalletParent}>
        <div className={styles.coinnameWallet}>Block2bit wallet</div>
        <div className={styles.resetEmail}>{buttonText}</div>
      </div>
    </div>
  );
};

export default HeaderAuth;
