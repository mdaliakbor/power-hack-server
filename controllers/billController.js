const Bill = require("../models/billModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// GET ALL BILLS
exports.getBillList = catchAsync(async (req, res, next) => {
  if (!req.query.limit) {
    req.query.limit = "10";
  }
  if (!req.query.page) {
    req.query.page = "1";
  }
  const search = req.query.search;
  const currentPage = +req.query.page;
  const limit = req.query.limit;

  const totalBillQuantity = await Bill.countDocuments();
  let pages = Math.ceil(totalBillQuantity / limit) || 1;

  let billQuery;
  if (search) {
    const totalBills = await new APIFeatures(
      Bill.find({
        $or: [
          { fullName: { $regex: search } },
          { email: { $regex: search } },
          { phone: { $regex: search } },
        ],
      }),
      req.query
    ).query;

    billQuery = new APIFeatures(
      Bill.find({
        $or: [
          { fullName: { $regex: search } },
          { email: { $regex: search } },
          { phone: { $regex: search } },
        ],
      }),
      req.query
    )
      .sort()
      .paginate();
    const bills = await billQuery.query;
    pages = Math.ceil(totalBills.length / limit) || 1;
    res.status(200).json({
      status: "success",
      pages,
      currentPage,
      results: bills.length,
      data: {
        bills,
      },
    });
  } else {
    billQuery = new APIFeatures(Bill.find(), req.query).sort().paginate();
    const bills = await billQuery.query;
    res.status(200).json({
      status: "success",
      pages,
      currentPage,
      results: bills.length,
      data: {
        bills,
      },
    });
  }
});

// ADD BILL
exports.addBill = catchAsync(async (req, res, next) => {
  const { fullName, email, phone, payableAmount } = req.body;
  const newBill = await Bill.create({
    fullName,
    email,
    phone,
    payableAmount,
  });
  res.status(200).json({
    status: "success",
    data: {
      bill: newBill,
    },
  });
});

// UPDATE BILL BY ID
exports.updateBill = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { fullName, email, phone, payableAmount } = req.body;
  const bill = await Bill.findByIdAndUpdate(
    id,
    { fullName, email, phone, payableAmount },
    { new: true, runValidators: true }
  );
  if (!bill) {
    return next(new AppError(`No bill found for ID: ${id}`, 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      bill,
    },
  });
});

// DELETE BILL
exports.deleteBill = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const bill = await Bill.findByIdAndDelete(id);
  if (!bill) {
    return next(new AppError(`No bill found for ID: ${id}`, 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
