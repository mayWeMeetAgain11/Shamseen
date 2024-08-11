module.exports = {
  generateVerificationToken() {
    return Math.random().toString(36).substring(7);
  },

  getMessageBody(data) {
    return `<html>
             <head>
            <style>
              h1 {
                color: blue;
              }
              p {
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <h1>Hello Cosma</h1>
            <h3>I'm ${data.contact_name},</h1>
            <p>data is a test email from ${data.company_name}. We hope you are doing well in the ${data.business_sector} industry.</p>
            <p>${data.message}</p>
            <p>Here's our contact information:</p>
            <ul>
              <li>Email: ${data.email}</li>
              <li>Contact number: ${data.contact_number}</li>
              <li>WhatsApp number: ${data.whatsapp_number}</li>
              <li>Country: ${data.country}</li>
              <li>City: ${data.city}</li>
            </ul>
          </body>
        </html>
        `;
  },
};
