let orderId = 1;

function idd() {
  orderId++;
  return orderId;
}

function uniqueId() {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36);
  return dateString + randomness ;
}

app.use("/sp-test/payment", (req, res) => {
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
        email: req.body.email,
      },
      interaction: {
        operation: "PURCHASE",
        merchant: {
          name: "merchant.120810000145",
        },
        returnUrl: "https://timeengcom.com/sp-test/main",
      },
      order: {
        amount: req.body.amount,
        currency: "AED",
        description: "Ordered goods",
        id: uniqueId(),
      },
    },
    url: "https://adcb.gateway.mastercard.com/api/rest/version/67/merchant/120810000145/session",
  };
  axios(options).then((response) => res.status(200).json(response.data));
});

app.post("/sp-test/e-pay/send-details", (req, res) => {
  var body = req.body;
  var userId = body.user_id;
  var Ind = body.Ind;
  var amount = body.amount;
  con.query(
    `insert into instance(userId , successInd , amount) values(${userId} , "${Ind}" , ${amount})`,
    (err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json({ result: 1 });
      }
    }
  );
});

app.post("/sp-test/e-pay/instance", (req, resp) => {
  var Ind = req.body.Ind;
  var amount = 0.0;
  var u_id = 0;
  var sp_id = 0;
  var f_type = "e-pay";
  var date = getdate();
  con.query(
    "select * from instance where successInd = ?",
    Ind,
    (err, result9) => {
      if (err) {
        resp.json(err);
      } else {
        if (result9.length === 0) {
          resp.json({ result: 0 });
        } else {
          amount = result9[0].amount;
          u_id = result9[0].userId;
          con.query(
            `insert into charge(ch_amount , sp_id , acc_id , ch_type , ch_date) values(${amount} , ${sp_id} , ${u_id} , "${f_type}" , "${date}")`,
            (err, result1) => {
              if (err) {
                resp.json(err);
              } else {
                con.query(
                  "delete from instance where successInd = ? ",
                  Ind,
                  (err, result) => {
                    if (err) {
                      resp.json(err);
                    } else {
                      con.query(
                        `update account set acc_balance = acc_balance + ${amount} where acc_id = ${u_id}`,
                        (erro0, result3) => {
                          resp.json({ result: 1 });
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
});
