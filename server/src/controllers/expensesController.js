const fs = require('fs');
const { processNewDebt } = require('../helpers/processNewDebt');
const Expenses = JSON.parse(
  fs.readFileSync(`${__dirname}/../database/expenses.json`)
);
const crypto = require('crypto');

// ===================FUNCTIONS========================
// Get all expenses
exports.getExpenses = (_, res) => {
  res.status(200).json(Expenses);
};

// Create a expense
exports.createExpense = (req, res) => {
  const { amount, name, who_paid, debtors, group_id } = req.body;
  const id = crypto.randomBytes(10).toString('hex'); //random id

  // STEP-1. Зардлын мэдээллийг Expenses collection дээр хадгалах
  Expenses.push({
    id,
    name, // "odriin hool"
    who_paid, //"Ganzo"
    who_must_pay: debtors, // [{name: 'user1', amount:5000}, {name: 'user2', amount:5000}]
    amount, // 15000
    expense_date: Date.now(),
    group_id,
  });

  fs.writeFile(
    `${__dirname}/../database/expenses.json`,
    JSON.stringify(Expenses),
    (err) => {}
  );

  // STEP-2. Харгалзах өрийн мэдээллүүдийг Debts collection дээр хадгалах
  for (debtor of debtors) {
    const debtorName = debtor.name; // "Bilguun"
    const owedAmount = debtor.amount; // 5000

    processNewDebt(debtorName, who_paid, owedAmount);
  }

  res.status(201).json({ status: 'success', data: Expenses });
};

// Delete a expense by its id
exports.deleteExpenseById = (req, res) => {
  const { id } = req.body;

  //middleware
  const expense = Expenses.find((expense) => expense.id === id);

  if (!expense)
    return res.status(200).json({
      message: 'Expense not found with this id',
    });

  // then proceed to delete
  const updatedExpenses = Expenses.filter((expense) => expense.id !== id);

  fs.writeFile(
    `${__dirname}/../database/expenses.json`,
    JSON.stringify(updatedExpenses),
    (err) => {
      res.status(200).json({ status: 'success' });
    }
  );
};
