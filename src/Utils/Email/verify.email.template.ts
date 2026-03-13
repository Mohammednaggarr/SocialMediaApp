export const template = (
  code: number,
  firstName: string,
  subject: string
): string => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f6fa;
    }

    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .email-header {
      background: linear-gradient(135deg, #6a5acd, #7a6ff0);
      color: #ffffff;
      text-align: center;
      padding: 25px 20px;
    }

    .email-header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 600;
    }

    .email-body {
      padding: 25px 20px;
      color: #333333;
      line-height: 1.7;
      font-size: 16px;
    }

    .email-body h2 {
      margin-top: 0;
      font-size: 20px;
      color: #6a5acd;
    }

    .code-box {
      display: inline-block;
      background-color: #6a5acd;
      color: #ffffff !important;
      padding: 12px 25px;
      font-size: 22px;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: bold;
      letter-spacing: 2px;
    }

    .email-footer {
      text-align: center;
      padding: 15px;
      background-color: #f5f6fa;
      font-size: 13px;
      color: #777;
    }

    .email-footer a {
      color: #6a5acd;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>

<body>
  <div class="email-container">
    
    <div class="email-header">
      <h1>${subject}</h1>
    </div>

    <div class="email-body">
      <h2>Hello ${firstName},</h2>

      <p>
        Thank you for joining <strong>SocialBox</strong>!  
        To secure your account and complete your verification, please use the activation code below:
      </p>

      <div class="code-box">${code}</div>

      <p>
        If you didn’t request this email, you can safely ignore it.
      </p>

      <p>
        Best regards,<br />
        <strong>SocialBox Team</strong>
      </p>
    </div>

    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} SocialBox. All rights reserved.</p>
      <p>
        <a href="[SupportLink]">Contact Support</a> |
        <a href="[UnsubscribeLink]">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;