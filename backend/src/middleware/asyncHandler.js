// Express 4 doesn't catch rejections thrown by an async route handler — the
// promise just rejects into the void, no response is ever sent, and the client
// hangs until it gives up on its own. Forward the rejection to next(err) so the
// app's error middleware actually gets to respond.
export function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}
