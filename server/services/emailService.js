const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const OTP_EXPIRY_LABEL = '10 minutes';

const EMAIL_COPY = {
  verify_email: {
    subject: 'Verify your TrackIt email',
    heading: 'Verify your email address',
    intro: 'Use the verification code below to finish setting up your TrackIt account.',
    ignoreNote: 'If you did not create a TrackIt account, you can safely ignore this email.',
  },
  reset_password: {
    subject: 'Reset your TrackIt password',
    heading: 'Reset your password',
    intro: 'Use the code below to choose a new password for your TrackIt account.',
    ignoreNote: 'If you did not request a password reset, you can safely ignore this email.',
  },
};

const getCopy = (purpose) => EMAIL_COPY[purpose] ?? EMAIL_COPY.verify_email;

const getSender = () => ({
  email: process.env.BREVO_SENDER_EMAIL || 'no-reply@trackit.app',
  name: process.env.BREVO_SENDER_NAME || 'TrackIt',
});

const buildTextEmail = ({ purpose, code }) => {
  const copy = getCopy(purpose);
  return [
    copy.heading,
    '',
    copy.intro,
    '',
    `Code: ${code}`,
    '',
    `This code expires in ${OTP_EXPIRY_LABEL}.`,
    copy.ignoreNote,
    '',
    'TrackIt',
  ].join('\n');
};

const buildHtmlEmail = ({ purpose, code }) => {
  const copy = getCopy(purpose);
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#16a34a;">TrackIt</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0f172a;">${copy.heading}</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">${copy.intro}</p>
                <div style="margin:0 0 24px;padding:20px;border-radius:12px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;">
                  <span style="font-family:Consolas,Monaco,monospace;font-size:34px;font-weight:700;letter-spacing:0.35em;color:#166534;">${code}</span>
                </div>
                <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">This code expires in <strong>${OTP_EXPIRY_LABEL}</strong>.</p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">${copy.ignoreNote}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const assertEmailServiceConfiguration = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.BREVO_API_KEY) {
    throw new Error(
      'BREVO_API_KEY is required in production. Refusing to start without email delivery configured.'
    );
  }
};

export const sendOtpEmail = async ({ to, code, purpose }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[TrackIt] ${purpose} OTP for ${to}: ${code} (expires in ${OTP_EXPIRY_LABEL})`);
      return;
    }
    throw new Error('BREVO_API_KEY is required to send email.');
  }

  const copy = getCopy(purpose);
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: getSender(),
      to: [{ email: to }],
      subject: copy.subject,
      htmlContent: buildHtmlEmail({ purpose, code }),
      textContent: buildTextEmail({ purpose, code }),
    }),
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      detail = '';
    }
    console.error('Brevo email delivery failed', {
      status: response.status,
      detail: detail.slice(0, 500),
    });
    const error = new Error('Unable to send email right now.');
    error.status = 502;
    error.code = 'EMAIL_SEND_FAILED';
    throw error;
  }
};
