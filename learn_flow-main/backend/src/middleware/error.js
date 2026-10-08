export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  const status = error.status || error.response?.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Something went wrong"
      : error.message;

  if (res.headersSent) return next(error);
  res.status(status).json({ message });
}
