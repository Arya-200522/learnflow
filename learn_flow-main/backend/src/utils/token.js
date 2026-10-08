import jwt from "jsonwebtoken";

export function createToken(
  userId,
  sessionId = null,
) {
  return jwt.sign(
    {
      sub: userId,
      sid: sessionId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

export function setAuthCookie(
  res,
  token,
) {
  res.cookie(
    "learnflow_token",
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      maxAge:
        7 * 24 * 60 * 60 * 1000,
    },
  );
}

export function clearAuthCookie(
  res,
) {
  res.clearCookie(
    "learnflow_token",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",
    },
  );
}