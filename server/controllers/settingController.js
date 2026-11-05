const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/logger');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin only)
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    settings.updatedBy = req.user.id;
    await settings.save();

    await logAudit({
      req,
      user: req.user,
      action: 'UPDATE_SETTINGS',
      entityType: 'Settings',
      entityId: settings._id,
      description: 'System and company profile settings updated',
    });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get audit logs
// @route   GET /api/settings/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { entityType, action } = req.query;
    const query = {};

    if (entityType) query.entityType = entityType;
    if (action) query.action = { $regex: action, $options: 'i' };

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getAuditLogs,
};

