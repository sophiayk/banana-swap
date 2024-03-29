import { Identicon } from "./../identicon";
import React, { useState } from "react";
import { getTokenIcon } from "../../utils/utils";
import { useConnectionConfig } from "../../utils/connection";

export const TokenIcon = (props: {
  mintAddress: string;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const { tokenMap } = useConnectionConfig();
  const [failed, setFailed] = useState(false);
  const icon = getTokenIcon(tokenMap, props.mintAddress);

  if (icon && !failed) {
    return (
      <img
        alt="Token icon"
        className={props.className}
        key={props.mintAddress}
        onError={() => setFailed(true)}
        width="20"
        height="20"
        src={icon}
        style={{
          marginRight: "0.12rem",
          // marginTop: "0.11rem",
          borderRadius: "1rem",
          backgroundColor: "white",
          backgroundClip: "padding-box",
          ...props.style,
        }}
      />
    );
  }

  return (
    <Identicon
      address={props.mintAddress}
      style={{
        marginRight: "10px",
        display: "flex",
        alignSelf: "center",
        width: 20,
        height: 20,
        ...props.style,
      }}
    />
  );
};

export const PoolIcon = (props: {
  mintA: string;
  mintB: string;
  style?: React.CSSProperties;
  className?: string;
}) => {
  return (
    <div className={props.className} style={{ display: "flex" }}>
      <TokenIcon
        mintAddress={props.mintA}
        style={{ marginRight: "-10px", ...props.style }}
      />
      <TokenIcon mintAddress={props.mintB} />
    </div>
  );
};
