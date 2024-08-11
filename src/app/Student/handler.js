const Student = require("./Services/StudentService");

module.exports = {
  register: async (req, res) => {
    const data = req.body;
    const result = await new Student(data).register();
    res.status(result.code).send({
      data: result.data,
      token: result.token,
    });
  },

  signIn: async (req, res) => {
    const result = await Student.signIn(req.body.email, req.body.password);
    res.status(result.code).send({
      data: result.data,
      token: result.token,
    });
  },
  getStudentDetails: async (req, res) => {
    const result = await Student.getDetails(req.params.id);
    res.status(result.code).send({
      data: result.data,
      token: result.token,
    });
  },
  getStudentOrders: async (req, res) => {
    const data = req.body;
    data.id = req.params.id;
    const result = await Student.getOrders(data);
    res.status(result.code).send({
      data: result.data,
      token: result.token,
    });
  },

  updateStudentDetails: async (req, res) => {
    const result = await new Student(req.body).updateDetails(req.params.id);
    res.status(result.code).send({
      data: result.data,
      token: result.token,
    });
  },

  verifyEmail: async (req, res) => {
    const { token } = req.query;
    const result = await Student.verifyEmail(token);
    res.status(result.code).send({
      data: result.data,
      token: result.token,
    });
  },

  sendEmailVerfication: async (req, res) => {
    const email = req.body.email;
    const result = await new Student(email).sendEmailVerfication(email);
    res.status(result.code).send({
      data: result.data,
      token: result.token,
    });
  },
};
