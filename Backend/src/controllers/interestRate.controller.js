import InterestRateConfig from "../models/InterestRateConfig.js";

/* =========================
   CREATE INTEREST RATE CONFIG
========================= */
export const createInterestRateConfig = async (req, res) => {
  try {
    const {
      communityId,
      loanType,
      interestRate,
      interestType,
      minAmount,
      maxAmount,
      maxTenure,
      processingFee,
      lateFeeRate,
      gracePeriod
    } = req.body;

    // Check if config already exists for this community and loan type
    const existingConfig = await InterestRateConfig.findOne({
      communityId,
      loanType
    });

    if (existingConfig) {
      return res.status(400).json({
        message: "Interest rate configuration already exists for this loan type"
      });
    }

    const config = await InterestRateConfig.create({
      communityId,
      loanType,
      interestRate,
      interestType,
      minAmount,
      maxAmount,
      maxTenure,
      processingFee,
      lateFeeRate,
      gracePeriod,
      createdBy: req.user.id
    });

    await config.populate('communityId', 'name');
    await config.populate('createdBy', 'name');

    res.status(201).json({
      message: "Interest rate configuration created successfully",
      config
    });
  } catch (error) {
    console.error("Create interest rate config error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET INTEREST RATE CONFIGS
========================= */
export const getInterestRateConfigs = async (req, res) => {
  try {
    let query = {};

    // For regular admin, filter by communityId
    if (req.user.role === "ADMIN" && req.user.communityId) {
      query.communityId = req.user.communityId;
    }

    const configs = await InterestRateConfig.find(query)
      .populate('communityId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(configs);
  } catch (error) {
    console.error("Get interest rate configs error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET SINGLE CONFIG
========================= */
export const getInterestRateConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await InterestRateConfig.findById(id)
      .populate('communityId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    // Check access for regular admin
    if (req.user.role === "ADMIN" && req.user.communityId) {
      if (config.communityId._id.toString() !== req.user.communityId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(config);
  } catch (error) {
    console.error("Get interest rate config error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE CONFIG
========================= */
export const updateInterestRateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user.id };

    const config = await InterestRateConfig.findById(id);
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    // Check access for regular admin
    if (req.user.role === "ADMIN" && req.user.communityId) {
      if (config.communityId.toString() !== req.user.communityId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const updatedConfig = await InterestRateConfig.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('communityId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    res.json({
      message: "Configuration updated successfully",
      config: updatedConfig
    });
  } catch (error) {
    console.error("Update interest rate config error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE CONFIG
========================= */
export const deleteInterestRateConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await InterestRateConfig.findById(id);
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    // Check access for regular admin
    if (req.user.role === "ADMIN" && req.user.communityId) {
      if (config.communityId.toString() !== req.user.communityId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    await InterestRateConfig.findByIdAndDelete(id);

    res.json({ message: "Configuration deleted successfully" });
  } catch (error) {
    console.error("Delete interest rate config error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET CONFIG BY COMMUNITY AND LOAN TYPE
========================= */
export const getConfigByType = async (req, res) => {
  try {
    const { communityId, loanType } = req.params;

    const config = await InterestRateConfig.findOne({
      communityId,
      loanType,
      isActive: true
    });

    if (!config) {
      return res.status(404).json({ 
        message: "No configuration found for this loan type",
        defaultConfig: {
          interestRate: 12,
          interestType: "SIMPLE",
          lateFeeRate: 5,
          gracePeriod: 7
        }
      });
    }

    res.json(config);
  } catch (error) {
    console.error("Get config by type error:", error);
    res.status(500).json({ message: error.message });
  }
};