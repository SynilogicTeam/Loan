import ExternalBorrower from "../models/ExternalBorrower.js";

/* =========================
   CREATE EXTERNAL BORROWER
========================= */
export const createExternalBorrower = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      aadharNumber,
      panNumber,
      dateOfBirth,
      occupation,
      monthlyIncome,
      bankDetails,
      guarantor1,
      guarantor2,
      remarks
    } = req.body;

    // Check if borrower already exists
    const existingBorrower = await ExternalBorrower.findOne({
      $or: [
        { email },
        { phone },
        { aadharNumber },
        { panNumber }
      ]
    });

    if (existingBorrower) {
      return res.status(400).json({
        message: "Borrower already exists with this email, phone, Aadhar, or PAN"
      });
    }

    const borrower = await ExternalBorrower.create({
      name,
      email,
      phone,
      address,
      aadharNumber,
      panNumber,
      dateOfBirth,
      occupation,
      monthlyIncome,
      bankDetails,
      guarantor1,
      guarantor2,
      remarks,
      createdBy: req.user.id
    });

    await borrower.populate('createdBy', 'name');

    res.status(201).json({
      message: "External borrower created successfully",
      borrower
    });
  } catch (error) {
    console.error("Create external borrower error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ALL EXTERNAL BORROWERS
========================= */
export const getExternalBorrowers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { aadharNumber: { $regex: search, $options: 'i' } },
        { panNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
      if (status === 'verified') query.isVerified = true;
      if (status === 'unverified') query.isVerified = false;
    }

    const borrowers = await ExternalBorrower.find(query)
      .populate('createdBy', 'name')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ExternalBorrower.countDocuments(query);

    res.json({
      borrowers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get external borrowers error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET SINGLE BORROWER
========================= */
export const getExternalBorrower = async (req, res) => {
  try {
    const { id } = req.params;

    const borrower = await ExternalBorrower.findById(id)
      .populate('createdBy', 'name')
      .populate('verifiedBy', 'name');

    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }

    res.json(borrower);
  } catch (error) {
    console.error("Get external borrower error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE BORROWER
========================= */
export const updateExternalBorrower = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const borrower = await ExternalBorrower.findById(id);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }

    // Check for duplicate email, phone, aadhar, pan (excluding current borrower)
    if (updateData.email || updateData.phone || updateData.aadharNumber || updateData.panNumber) {
      const duplicateQuery = {
        _id: { $ne: id },
        $or: []
      };

      if (updateData.email) duplicateQuery.$or.push({ email: updateData.email });
      if (updateData.phone) duplicateQuery.$or.push({ phone: updateData.phone });
      if (updateData.aadharNumber) duplicateQuery.$or.push({ aadharNumber: updateData.aadharNumber });
      if (updateData.panNumber) duplicateQuery.$or.push({ panNumber: updateData.panNumber });

      if (duplicateQuery.$or.length > 0) {
        const existingBorrower = await ExternalBorrower.findOne(duplicateQuery);
        if (existingBorrower) {
          return res.status(400).json({
            message: "Another borrower exists with this email, phone, Aadhar, or PAN"
          });
        }
      }
    }

    const updatedBorrower = await ExternalBorrower.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name')
      .populate('verifiedBy', 'name');

    res.json({
      message: "Borrower updated successfully",
      borrower: updatedBorrower
    });
  } catch (error) {
    console.error("Update external borrower error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   VERIFY BORROWER
========================= */
export const verifyExternalBorrower = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, remarks } = req.body;

    const borrower = await ExternalBorrower.findById(id);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }

    borrower.isVerified = isVerified;
    borrower.verifiedBy = req.user.id;
    borrower.verifiedAt = new Date();
    if (remarks) borrower.remarks = remarks;

    await borrower.save();
    await borrower.populate('verifiedBy', 'name');

    res.json({
      message: `Borrower ${isVerified ? 'verified' : 'unverified'} successfully`,
      borrower
    });
  } catch (error) {
    console.error("Verify external borrower error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE BORROWER
========================= */
export const deleteExternalBorrower = async (req, res) => {
  try {
    const { id } = req.params;

    const borrower = await ExternalBorrower.findById(id);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }

    // Check if borrower has active loans
    const ExternalLoan = (await import("../models/ExternalLoan.js")).default;
    const activeLoans = await ExternalLoan.countDocuments({
      borrowerId: id,
      status: { $in: ['PENDING', 'APPROVED', 'ACTIVE'] }
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        message: "Cannot delete borrower with active loans"
      });
    }

    await ExternalBorrower.findByIdAndDelete(id);

    res.json({ message: "Borrower deleted successfully" });
  } catch (error) {
    console.error("Delete external borrower error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET BORROWER STATISTICS
========================= */
export const getBorrowerStatistics = async (req, res) => {
  try {
    const totalBorrowers = await ExternalBorrower.countDocuments();
    const activeBorrowers = await ExternalBorrower.countDocuments({ isActive: true });
    const verifiedBorrowers = await ExternalBorrower.countDocuments({ isVerified: true });
    
    // Get borrowers by risk category
    const riskStats = await ExternalBorrower.aggregate([
      {
        $group: {
          _id: "$riskCategory",
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent borrowers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBorrowers = await ExternalBorrower.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalBorrowers,
      activeBorrowers,
      verifiedBorrowers,
      recentBorrowers,
      riskStats
    });
  } catch (error) {
    console.error("Get borrower statistics error:", error);
    res.status(500).json({ message: error.message });
  }
};