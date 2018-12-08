module.exports = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS');
    return res.status(204).end();
  }
  return next();
};
