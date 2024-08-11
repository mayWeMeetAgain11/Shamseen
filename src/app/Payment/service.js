const { PaymentModel } = require("../index");
const code = require("../../../utils/httpStatus");
const uniqueId = require("../../../helpers/uniqueId");
const { JSDOM } = require("jsdom");
const fs = require("fs");

const { default: axios } = require("axios");
{
  /* <script
  src="https://adcb.gateway.mastercard.com/static/checkout/checkout.min.js"
  data-complete="completeCallback"
  data-error="errorCallback"
  data-cancel="cancelCallback"
  data-beforeRedirect="Checkout.saveFormFields"
  data-afterRedirect="Checkout.restoreFormFields"
></script>; */
}
class Payment {
  constructor(data) {
    this.email = data.email;
    this.amount = data.amount;
    this.successInd = data.successInd;
    this.student_id = data.student_id;
  }

  async storePayment() {
    try {
      const payment = await PaymentModel.create(this);

      return {
        data: payment,
        status: code.CREATED,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
  async doPayment() {
    try {
      const usernamePasswordBuffer = Buffer.from(
        "merchant.120810000145" + ":" + "07a33e2775caaa44168d38c26906a7f2"
      );
      const base64data = usernamePasswordBuffer.toString("base64");

      const options = {
        method: "POST",
        headers: { Authorization: `Basic ${base64data}` },
        data: {
          apiOperation: "INITIATE_CHECKOUT",
          customer: {
            email: this.email,
          },
          interaction: {
            operation: "PURCHASE",
            merchant: {
              name: "merchant.120810000145",
            },
            //returnUrl: "https://timeengcom.com/sp-test/main",
          },
          order: {
            amount: this.amount,
            currency: "AED",
            description: "Ordered goods",
            id: uniqueId(),
          },
        },
        url: "https://adcb.gateway.mastercard.com/api/rest/version/67/merchant/120810000145/session",
      };
      let sessionId;
      await axios(options)
        .then(async (response) => {
          sessionId = response.data.session.id;
          (this.successInd = response.data.successIndicator),
            await this.storePayment();
        })
        .catch((error) => {
          console.log(error);
          throw new Error(error.message);
        });
      return {
        data: sessionId,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

module.exports = Payment;
