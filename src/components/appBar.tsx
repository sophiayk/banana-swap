import React from "react";
import { Button, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useWallet } from "../context/wallet";
import { AccountInfo } from "./accountInfo";
import { WalletConnect } from "./walletConnect";
import { Link, useHistory, useLocation } from "react-router-dom";
import emitter from "../utils/ev"
import {changeHamburgerFunc} from '../redux/action'
import {useSelector,useDispatch} from 'react-redux'


export const AppBar = (props: { left?: JSX.Element; right?: JSX.Element }) => {
  const hamburger = useSelector(state => state);
  const dispatch = useDispatch();
  const { connected } = useWallet();
  const location = useLocation();
  const history = useHistory();
  let collapsed = false
  const toggleCollapsed = () => {
    collapsed=!collapsed
    emitter.emit("changeCollapsed",collapsed)
  }
  const TopBar = (
    <div className="App-Bar">
      <div className="App-Bar-left">
        {/* <div onClick={toggleCollapsed}>折叠</div> */}
        {/* <img src={require("../assets/img/logo2.png")} style={{height:"34px"}} alt=""/> */}
        <div className="App-logo" onClick={() => history.push({ pathname: "/home" })} />
        {props.left}
      </div>
      <div className="App-Bar-right">
        <WalletConnect>
          <AccountInfo />
        </WalletConnect>
        {connected && (
          <Button
            className={location.pathname==='/swap/pool'?'poolActive':''}
            type="text"
            size="large"
            onClick={() => history.push({ pathname: "/swap/pool" })}
          >
            My Pools
          </Button>
        )}
        <MenuOutlined className="cell-menu" onClick={() => dispatch(changeHamburgerFunc(!hamburger))} />
        {/* {props.right} */}
      </div>
    </div>
  );

  return TopBar;
};

