import Admin from '../models/Admin.js';
import SuperAdmin from '../models/SuperAdmin.js';

// Get user settings
export const getSettings = async (req, res) => {
  try {
    const { role } = req.user;
    let user;

    if (role === 'SUPER_ADMIN') {
      user = await SuperAdmin.findById(req.user.id);
    } else {
      user = await Admin.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user settings or default settings
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        sms: false,
        newMembers: true,
        payments: true,
        loans: true,
        overdue: true
      },
      security: {
        twoFactor: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      appearance: {
        theme: 'light',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR'
      },
      privacy: {
        profileVisibility: 'admin',
        dataSharing: false,
        analytics: true
      }
    };

    res.json({
      success: true,
      settings: user.settings || defaultSettings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
};

// Update user settings
export const updateSettings = async (req, res) => {
  try {
    const { role } = req.user;
    const settings = req.body;

    let user;
    if (role === 'SUPER_ADMIN') {
      user = await SuperAdmin.findByIdAndUpdate(
        req.user.id,
        { settings },
        { new: true }
      );
    } else {
      user = await Admin.findByIdAndUpdate(
        req.user.id,
        { settings },
        { new: true }
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Reset settings to default
export const resetSettings = async (req, res) => {
  try {
    const { role } = req.user;
    
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        sms: false,
        newMembers: true,
        payments: true,
        loans: true,
        overdue: true
      },
      security: {
        twoFactor: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      appearance: {
        theme: 'light',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR'
      },
      privacy: {
        profileVisibility: 'admin',
        dataSharing: false,
        analytics: true
      }
    };

    let user;
    if (role === 'SUPER_ADMIN') {
      user = await SuperAdmin.findByIdAndUpdate(
        req.user.id,
        { settings: defaultSettings },
        { new: true }
      );
    } else {
      user = await Admin.findByIdAndUpdate(
        req.user.id,
        { settings: defaultSettings },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Settings reset to default',
      settings: defaultSettings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings'
    });
  }
};