import speakeasy from 'speakeasy';
import TwoFactor from '../models/TwoFactor';
// Ensure 'speakeasy' is installed: npm install speakeasy

// Middleware to check if 2FA is required and verified
export const require2FA = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if user has 2FA enabled
    const twoFactorData = await TwoFactor.findOne({ userId });

    if (!twoFactorData || !twoFactorData.enabled) {
      // 2FA not enabled, proceed
      return next();
    }

    // Check if 2FA token was provided
    const { twoFactorToken, backupCode } = req.body;

    if (!twoFactorToken && !backupCode) {
      return res.status(400).json({
        error: '2FA verification required',
        requires2FA: true,
        method: twoFactorData.method,
      });
    }

    // Check if account is locked
    if (twoFactorData.isLocked()) {
      return res.status(429).json({
        error: 'Too many failed attempts. Try again later.',
        lockedUntil: twoFactorData.lockedUntil,
        requires2FA: true,
      });
    }

    let verified = false;

    if (twoFactorToken) {
      // Verify TOTP token
      verified = speakeasy.totp.verify({
        secret: twoFactorData.secret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2, // Allow 2 time windows (30 seconds each)
      });
    } else if (backupCode) {
      // Verify backup code
      const codeIndex = twoFactorData.backupCodes.indexOf(backupCode);
      if (codeIndex !== -1) {
        verified = true;
        // Remove used backup code
        twoFactorData.backupCodes.splice(codeIndex, 1);
      }
    }

    if (!verified) {
      await twoFactorData.incrementAttempts();
      return res.status(400).json({
        error: 'Invalid 2FA token or backup code',
        requires2FA: true,
      });
    }

    // Reset attempts on successful verification
    await twoFactorData.resetAttempts();

    // Add 2FA verification flag to request
    req.twoFactorVerified = true;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Middleware to check 2FA status for sensitive operations
export const check2FAForSensitiveOps = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const twoFactorData = await TwoFactor.findOne({ userId });

    // Add 2FA status to request for use in controllers
    req.twoFactorEnabled = twoFactorData?.enabled || false;
    req.twoFactorMethod = twoFactorData?.method || null;

    next();
  } catch (err) {
    // Don't fail the request if 2FA check fails, just log it
    console.error('Error checking 2FA status:', err);
    req.twoFactorEnabled = false;
    req.twoFactorMethod = null;
    next();
  }
};
