import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { collectionData, docData } from "rxfire/firestore";
import { tap } from "rxjs/operators";
import { store } from "../";
import { notification$, totaltransaction$ } from "../redux/action";
import { db } from "./firebase";

import { useContext, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { LoaderSmall } from "../components/loader";
import { SocketContext } from "../context/socket";

export const CurrencyFormat = ({ amount, prefix, seperator }) => {
  return (
    <NumericFormat
      thousandSeparator={seperator}
      displayType={"text"}
      prefix={prefix}
      value={amount}
      decimalScale={2}
      fixedDecimalScale
    />
  );
};
export function CryptoFormater({ amount, suffix }) {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  // const socket = useRef();
  const socket = useContext(SocketContext);
  const socketId = Math.floor(Math.random() * 90000) + 10000;

  useEffect(() => {
    if (amount > 0) {
      setLoading(true);
      socket.emit("convert", {
        from: "USDT",
        to: suffix,
        amount: amount,
        socketid: socketId,
      });
    }

    function onConvrtEvent(data) {
      setValue(data);
      setLoading(false);
    }

    socket.on(`${socketId}`, onConvrtEvent);

    return () => {
      socket.off(`${socketId}`, onConvrtEvent);
    };
  }, []);

  return (
    <>
      {loading ? (
        <LoaderSmall />
      ) : (
        <NumericFormat
          thousandSeparator={false}
          displayType={"text"}
          suffix={` ${suffix}`}
          value={value}
          decimalScale={5}
          fixedDecimalScale
        />
      )}
    </>
  );
}
export const CryptoCurrencyFormat = ({ amount, suffix }) => {
  return (
    <NumericFormat
      thousandSeparator={false}
      displayType={"text"}
      suffix={suffix}
      value={amount}
      decimalScale={5}
      fixedDecimalScale
    />
  );
};

export const addUsers = async (docid, userdatas) => {
  const querydoc = doc(db, `users/${docid}`);
  await setDoc(querydoc, userdatas, { merge: true });
};

export const creditWallet = async (userid, wallet, data) => {
  const querydoc = doc(db, "users", `${userid}`, "wallet", wallet);
  await setDoc(querydoc, data, { merge: true });
};

export const getUserInfo = (userid) => {
  const querydoc = doc(db, `users/${userid}`);
  return docData(querydoc);
};

export const getUser = async (userid) => {
  const querydoc = doc(db, `users/${userid}`);
  const data = await getDoc(querydoc);
  return data.data();
};

export const getTransactions = (userid) => {
  const transactionref = query(
    collection(db, "users", `${userid}`, "transactions"),
    where("main", "==", true)
  );
  return collectionData(transactionref, { idField: "uid" })
    .pipe(
      tap((transactions) => console.log("This is all transaction observable!"))
    )
    .subscribe((trans) => {
      console.log(trans.length);
      store.dispatch(totaltransaction$(trans.length));
    });
};

export const getTransactionsType = async (userid, coinType) => {
  const transactionref = query(
    collection(db, "users", `${userid}`, "transactions"),
    where("cointitle", "==", coinType),
    orderBy("timestamp", "desc")
  );
  const querySnapshot = await getDocs(transactionref);
  return querySnapshot;
};

export const addTransfer = async (userid, data) => {
  const docRef = doc(collection(db, "users", userid, "transactions"));

  return await setDoc(docRef, { ...data, timestamp: serverTimestamp() });
};

export const addTransactionWallet = async (userid, data) => {
  const docRef = doc(collection(db, "transactionswallet"));

  return await setDoc(docRef, { ...data, timestamp: serverTimestamp() });
};

export const updateUserBalance = (userid, cointype, balance) => {
  const querydoc = doc(db, `users/${userid}`);
  console.log(balance);
  return setDoc(querydoc, { [cointype]: Number(balance) }, { merge: true });
};

export const getallusers = () => {
  const collectionRef = collection(db, "users");
  const q = query(collectionRef, orderBy("timestamp", "desc"));
  return collectionData(q, { idField: "uid" });
};

export const getallWalletTransaction = () => {
  const collectionRef = collection(db, "transactionswallet");
  const q = query(collectionRef, orderBy("timestamp", "desc"));
  return collectionData(q, { idField: "uid" });
};

export const getuserDataAdmin = (id) => {
  const davidDocRef = doc(db, `users/${id}`);
  return docData(davidDocRef, { idField: "uid" });
};

export const getuserDataBalanceAdmin = (id, type) => {
  const DocRef = doc(db, "users", `${id}`, "account", type);
  return docData(DocRef, { idField: "uid" });
};

export const updateuserDataBalanceAdmin = (id, type, balance) => {
  const DocRef = doc(db, "users", `${id}`, "account", type);
  setDoc(DocRef, { balance: parseInt(balance) }, { merge: true });
  alert("User info has been updated successfully");
};

export const activateAccount = async (uid, current) => {
  const DocRef = doc(db, "users", `${uid}`);
  await setDoc(
    DocRef,
    { activated: current, Verificationstatus: current },
    { merge: true }
  );
};

export const addNotification = async (id, title, message) => {
  const DocRef = doc(collection(db, "users", `${id}`, "notification"));
  await setDoc(DocRef, { title: title, message: message });
};

export const getNotification = (id) => {
  const notificationRef = query(
    collection(db, "users", `${id}`, "notification")
  );
  return collectionData(notificationRef, { idField: "uid" }).subscribe(
    (data) => {
      store.dispatch(notification$(data));
    }
  );
};

export const deletedocument = async (id) => {
  await deleteDoc(doc(db, "users", id));
};

export const sendMessage = (message, subject, email, name) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({
    message: message,
    to: `anthonyerics84@gmail.com, ${email}`,
    subject: subject,
    name: name,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return fetch(
    "https://expresspages-chi.vercel.app/block2bit",
    requestOptions
  ).then((response) => response.text());
};

export const getWhatsapp = async () => {
  const querydoc = doc(db, `whatsapp/number`);
  const data = await getDoc(querydoc);
  return data.data();
};
