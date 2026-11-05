const AuditLog = require('../models/AuditLog');

/**
 * Creates an audit log record
 */
const logAudit = async ({
  req,
  user,
  action,
  entityType,
  entityId = '',
  description = '',
  details = {},
}) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers['user-agent'] || '';
    const userId = user?._id || req?.user?._id || null;

    await AuditLog.create({
      user: userId,
      action,
      entityType,
      entityId: String(entityId),
      description,
      details,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};

module.exports = { logAudit };

