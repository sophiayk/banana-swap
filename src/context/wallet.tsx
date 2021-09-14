import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Wallet from "@project-serum/sol-wallet-adapter";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "antd";
import {
  WalletAdapter,
  LedgerWalletAdapter,
  SolongWalletAdapter,
  PhantomWalletAdapter,
  MathWalletAdapter,
} from "../wallet-adapters";
import { Coin98WalletAdapter } from "@solana/wallet-adapter-coin98";
import { SlopeWalletAdapter } from "@solana/wallet-adapter-slope";
import { useConnectionConfig } from "../utils/connection";
import { useLocalStorageState } from "../utils/utils";
import { notify } from "../utils/notifications";

export const WALLET_PROVIDERS = [
  // {
  //   name: "sollet.io",
  //   url: "https://www.sollet.io",
  //   icon: require("../assets/img/wallet/Sollet.png"),
  // },
  {
    name: "Solflare",
    url: "https://solflare.com/access-wallet",
    icon: require("../assets/img/wallet/Solflare.png"),
  },
  // {
  //   name: 'Sollet Extension',
  //   url: 'https://www.sollet.io/extension',
  //   icon: require("../assets/img/wallet/Sollet.png"),
  //   adapter: SolletExtensionAdapter as any,
  // },
  // {
  //   name: "Ledger",
  //   url: "https://www.ledger.com",
  //   icon: require("../assets/img/wallet/Ledger.png"),
  //   adapter: LedgerWalletAdapter,
  // },
  // {
  //   name: "Solong",
  //   url: "https://www.solong.com",
  //   icon: require("../assets/img/wallet/Solong.png"),
  //   adapter: SolongWalletAdapter,
  // },
  // {
  //   name: "MathWallet",
  //   url: "https://www.mathwallet.org",
  //   icon: require("../assets/img/wallet/MathWallet.png"),
  //   adapter: MathWalletAdapter,
  // },
  // {
  //   name: "Phantom",
  //   url: "https://www.phantom.app",
  //   icon: require("../assets/img/wallet/Phantom.png"),
  //   adapter: PhantomWalletAdapter,
  // },
  {
    name: "C98",
    url: "https://wallet.coin98.com/",
    icon: require("../assets/img/wallet/c98.png"),
    adapter: Coin98WalletAdapter,
  },
  {
    name: "slope",
    url: "https://chrome.google.com/webstore/detail/slope-finance-wallet/pocmplpaccanhmnllbbkpgfliimjljgo",
    icon: require("../assets/img/wallet/slope.png"),
    adapter: SlopeWalletAdapter,
  },
];

const WalletContext = React.createContext<any>(null);

export function WalletProvider({ children = null as any }) {
  const { t } = useTranslation();
  const { endpoint } = useConnectionConfig();

  const [autoConnect, setAutoConnect] = useState(false);
  const [providerUrl, setProviderUrl] = useLocalStorageState("walletProvider");

  const provider = useMemo(
    () => WALLET_PROVIDERS.find(({ url }) => url === providerUrl),
    [providerUrl]
  );

  const wallet = useMemo(
    function () {
      if (provider) {
        // @ts-ignore
        return new (provider.adapter || Wallet)(
          providerUrl,
          endpoint
        ) as WalletAdapter;
      }
    },
    [provider, providerUrl, endpoint]
  );

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (wallet) {
      wallet.on("connect", () => {
        if (wallet.publicKey) {
          console.log("connected");
          localStorage.removeItem("feeDiscountKey");
          setConnected(true);
          const walletPublicKey = wallet.publicKey.toBase58();
          const keyToDisplay =
            walletPublicKey.length > 20
              ? `${walletPublicKey.substring(
                  0,
                  7
                )}.....${walletPublicKey.substring(
                  walletPublicKey.length - 7,
                  walletPublicKey.length
                )}`
              : walletPublicKey;

          notify({
            message: "Wallet update",
            description: "Connected to wallet " + keyToDisplay,
          });
        }
      });

      wallet.on("disconnect", () => {
        setConnected(false);
        notify({
          message: "Wallet update",
          description: "Disconnected from wallet",
        });
        localStorage.removeItem("feeDiscountKey");
      });
    }

    return () => {
      setConnected(false);
      if (wallet) {
        wallet.disconnect();
        setConnected(false);
      }
    };
  }, [wallet]);

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect();
      setAutoConnect(false);
    }

    return () => {};
  }, [wallet, autoConnect]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const select = useCallback(() => setIsModalVisible(true), []);
  const close = useCallback(() => setIsModalVisible(false), []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connected,
        select,
        providerUrl,
        setProviderUrl,
        providerName:
          WALLET_PROVIDERS.find(({ url }) => url === providerUrl)?.name ??
          providerUrl,
      }}
    >
      {children}
      <Modal
        title={t("SelectWallet")}
        okText="Connect"
        visible={isModalVisible}
        okButtonProps={{ style: { display: "none" } }}
        cancelText={t("Cancel")}
        onCancel={close}
        width={400}
      >
        {WALLET_PROVIDERS.map((provider) => {
          const onClick = function () {
            setProviderUrl(provider.url);
            setAutoConnect(true);
            close();
          };

          return (
            <Button
              size="large"
              type={providerUrl === provider.url ? "primary" : "ghost"}
              onClick={onClick}
              className="walletBtn"
              // disabled={provider.name !== "Solflare" ? true : false}
              icon={
                <img
                  alt={`${provider.name}`}
                  width={20}
                  height={20}
                  src={provider.icon}
                  style={{ marginRight: 8 }}
                />
              }
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                marginBottom: 8,
              }}
            >
              {provider.name}
            </Button>
          );
        })}
      </Modal>
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("Missing wallet context");
  }

  const wallet = context.wallet;
  return {
    connected: context.connected,
    wallet: wallet,
    providerUrl: context.providerUrl,
    setProvider: context.setProviderUrl,
    providerName: context.providerName,
    select: context.select,
    connect() {
      wallet ? wallet.connect() : context.select();
    },
    disconnect() {
      wallet?.disconnect();
    },
  };
}
