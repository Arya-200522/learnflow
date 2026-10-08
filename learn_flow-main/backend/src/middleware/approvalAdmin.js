import jwt from "jsonwebtoken";

export function protectApprovalAdmin(
  req,
  res,
  next,
) {
  try {
    const token =
      req.cookies
        .learnflow_approval_admin;

    if (!token) {
      return res.status(401).json({
        message:
          "Approval login required",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    if (
      payload.scope !==
      "verification-admin"
    ) {
      return res.status(401).json({
        message:
          "Invalid approval session",
      });
    }

    next();
  } catch {
    return res.status(401).json({
      message:
        "Approval session expired",
    });
  }
}