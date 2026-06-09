const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'refreshToken required' });
    const tokens = await authService.refresh(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id, req.user.jti);
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
}

module.exports = { login, refresh, logout, me };
