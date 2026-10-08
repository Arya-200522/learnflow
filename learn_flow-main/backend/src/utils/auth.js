import jwt from "jsonwebtoken";

const COOKIE_NAME = "learnflow_token";

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

export function createToken(userId, sessionId = null) {
  return jwt.sign(
    {
      sid: sessionId,
    },
    process.env.JWT_SECRET,
    {
      subject: userId.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
}