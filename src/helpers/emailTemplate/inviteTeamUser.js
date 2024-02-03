import config from "../../../config";

export const inviteTeamUserTemplate = (data) => {
  return {
    from: config.SYS_APP_CNF.sender_email_name,
    to: data.email,
    subject: `Welcome to Our AI Content Writing Platform - ${config.SYS_APP_CNF.site_name}`,
    html: `<!DOCTYPE html>
        <html>
        <head>
          <title>Welcome to Our AI Content Writing Platform</title>
          <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          
          h1 {
            color: #333;
            font-size: 24px;
            margin: 0 0 20px;
          }
          
          p {
            color: #555;
            font-size: 16px;
            line-height: 1.5;
            margin: 0 0 10px;
          }
          
          .login-details {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          
          .login-details p {
            margin: 0;
          }
          
          .login-details strong {
            font-weight: bold;
          }
          
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 16px;
          }
          
          .button:hover {
            background-color: #45a049;
          }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Our AI Content Writing Platform</h1>
            <p>Dear ${data.fname},</p>
            <p>Welcome aboard! We are delighted to inform you that you have been successfully added as a user to our AI Content Writing Platform.</p>
            <div class="login-details">
              <p><strong>Company Name:</strong> ${data.companyName}</p>
              <p><strong>Username:</strong> ${data.email}</p>
              <p><strong>Password:</strong> ${data.password}</p>
            </div>
            <p>To access the platform and start creating amazing content, please click the button below:</p>
            <a class="button" href="${config.MEMBER_LOGIN}">Login to Platform</a>
            <p>If you have any questions, feedback, or encounter any technical difficulties, please don't hesitate to reach out to our dedicated support team at <a href="mailto:${data.contactEmailAddress}">${data.contactEmailAddress}</a>. We are here to assist you and ensure your experience on our platform is nothing short of exceptional.</p>
            <p>Thank you for joining our AI Content Writing Platform. We are excited to have you on board and witness the incredible content you will create!</p>
            <p>Best regards,</p>
            <p>${config.SYS_APP_CNF.site_name}</p>
          </div>
        </body>
        </html>
        `,
  };
};
