const Payment = require("./service");

module.exports = {
  doPayment: async (req, res) => {
    const data = req.body;
    data.student_id = req.user.id;
    const result = await new Payment(data).doPayment();
    res.render("amount", { result: result.data });
  },
};
