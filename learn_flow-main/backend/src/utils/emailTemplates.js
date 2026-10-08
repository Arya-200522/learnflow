function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function passwordResetEmail({
  name,
  resetUrl,
}) {
  const safeName = escapeHtml(
    name || "Learner",
  );

  const safeResetUrl =
    escapeHtml(resetUrl);

  return {
    subject:
      "Reset your LearnFlow Academy password",

    text: [
      `Hello ${name || "Learner"},`,
      "",
      "We received a request to reset your LearnFlow Academy password.",
      "",
      `Reset your password: ${resetUrl}`,
      "",
      "This link will expire in 30 minutes.",
      "",
      "If you did not request this password reset, you can safely ignore this email.",
      "",
      "LearnFlow Academy",
    ].join("\n"),

    html: `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Password Reset</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #f3f5fa;
            font-family: Arial, Helvetica, sans-serif;
            color: #172033;
          "
        >
          <div
            style="
              width: 100%;
              padding: 40px 16px;
              box-sizing: border-box;
            "
          >
            <div
              style="
                max-width: 560px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 18px 60px rgba(30, 41, 59, 0.12);
              "
            >
              <div
                style="
                  padding: 30px;
                  background: linear-gradient(135deg, #312e81, #4f46e5, #0891b2);
                  color: #ffffff;
                "
              >
                <div
                  style="
                    font-size: 21px;
                    font-weight: 700;
                  "
                >
                  LearnFlow Academy
                </div>

                <div
                  style="
                    margin-top: 6px;
                    font-size: 13px;
                    color: #dbeafe;
                  "
                >
                  Learn. Practice. Progress.
                </div>
              </div>

              <div style="padding: 34px 30px">
                <div
                  style="
                    display: inline-block;
                    padding: 7px 12px;
                    border-radius: 999px;
                    background: #eef2ff;
                    color: #4f46e5;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                  "
                >
                  Password reset
                </div>

                <h1
                  style="
                    margin: 22px 0 12px;
                    font-size: 28px;
                    line-height: 1.25;
                    color: #0f172a;
                  "
                >
                  Reset your password
                </h1>

                <p
                  style="
                    margin: 0;
                    font-size: 15px;
                    line-height: 1.8;
                    color: #64748b;
                  "
                >
                  Hello ${safeName}, we received a
                  request to reset the password for
                  your LearnFlow Academy account.
                </p>

                <div
                  style="
                    margin: 28px 0;
                  "
                >
                  <a
                    href="${safeResetUrl}"
                    style="
                      display: inline-block;
                      padding: 14px 22px;
                      border-radius: 12px;
                      background: #4f46e5;
                      color: #ffffff;
                      font-size: 14px;
                      font-weight: 700;
                      text-decoration: none;
                    "
                  >
                    Reset password
                  </a>
                </div>

                <div
                  style="
                    padding: 14px 16px;
                    border: 1px solid #fde68a;
                    border-radius: 14px;
                    background: #fffbeb;
                    color: #92400e;
                    font-size: 13px;
                    line-height: 1.6;
                  "
                >
                  This password-reset link will expire
                  in 30 minutes and can be used only
                  once.
                </div>

                <p
                  style="
                    margin: 24px 0 0;
                    font-size: 13px;
                    line-height: 1.7;
                    color: #94a3b8;
                  "
                >
                  If you did not request this password
                  reset, you can safely ignore this
                  email. Your existing password will
                  remain unchanged.
                </p>

                <p
                  style="
                    margin: 20px 0 0;
                    font-size: 12px;
                    line-height: 1.7;
                    color: #94a3b8;
                    word-break: break-all;
                  "
                >
                  If the button does not work, copy and
                  paste this link into your browser:
                  <br />
                  ${safeResetUrl}
                </p>
              </div>

              <div
                style="
                  padding: 20px 30px;
                  border-top: 1px solid #e2e8f0;
                  background: #f8fafc;
                  font-size: 12px;
                  color: #94a3b8;
                  text-align: center;
                "
              >
                LearnFlow Academy · Secure learning
                access
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}