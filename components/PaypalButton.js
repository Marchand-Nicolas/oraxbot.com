import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

import styles from "../styles/Payments.module.css";
import popup from "../utils/popup";
import drop from "../public/icons/drop.svg";
import Loading from "../components/Loading";
import { render } from "react-dom";
import config from "../utils/config";

function Button(props) {
  const serverIp = config.serverIp;
  /**
   * usePayPalScriptReducer use within PayPalScriptProvider
   * isPending: not finished loading(default state)
   * isResolved: successfully loaded
   * isRejected: failed to load
   */
  const [{ isPending }] = usePayPalScriptReducer();
  const paypalbuttonTransactionProps = {
    style: {
      layout: "vertical",
      color: "blue",
      shape: "rect",
      label: "paypal",
      // Set text color to white
      fundingicons: {
        color: "white",
      },
    },
    createOrder(data, actions) {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: "10.00",
            },
          },
        ],
      });
    },
    async onApprove(data, actions) {
      /**
       * data: {
       *   orderID: string;
       *   payerID: string;
       *   paymentID: string | null;
       *   billingToken: string | null;
       *   facilitatorAccesstoken: string;
       * }
       */
      render(<Loading />, document.getElementById("popup"));
      const orderId = data.orderID;
      try {
        const datas = await (
          await fetch(`${serverIp}buy`, {
            method: "POST",
            body: `{ "email": "${props.email}", "guildId": "${props.guildId}", "orderId": "${orderId}", "discordUserId": "${props.discordUserId}" }`,
          })
        ).json();
        if (!datas.result) return requestError();
        popup(
          "Success",
          `Payment completed, order ID : ${orderId}`,
          "success",
          {
            content: (
              <p className="content">
                In case of problems, keep the order ID and contact our support.
              </p>
            ),
            icon: drop,
          }
        );
        props.setPaymentProgress(Math.random());
      } catch (error) {
        console.log(error);
        requestError();
      }
      function requestError() {
        popup("Error", `An error occurred. Order ID : ${orderId}`, "error", {
          content: (
            <p className="content">
              It seems that the payment has not been completed by our
              infrastructure. Please contact the support.
            </p>
          ),
          icon: drop,
        });
      }
    },
  };
  return (
    <>
      {isPending ? <h2>Load Smart Payment Button...</h2> : null}
      <PayPalButtons {...paypalbuttonTransactionProps} />
    </>
  );
}

export default function PaypalButton(props) {
  return (
    <div className={styles.container}>
      <PayPalScriptProvider
        options={{
          "client-id":
            "Ac6OFg81Jg4IEKwydCGpz9xMKfM4XmQACkeKgjE1uwp0VAGjR44FJy-RYH8PAZOVi0d2qJ-ArDkmFBCx",
        }}
      >
        <Button
          setPaymentProgress={props.setPaymentProgress}
          email={props.email}
          guildId={props.guildId}
          discordUserId={props.discordUserId}
        />
      </PayPalScriptProvider>
    </div>
  );
}
