import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const transactions = await sql`
        SELECT * FROM transaction WHERE user_id = ${userId} ORDER BY created_at DESC
        `;
    res.status(200).json(transactions);
    console.log(userId);
  } catch (error) {
    console.log("error getting the transaction", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;
    if (!title || !user_id || !category || amount == undefined) {
      return res.send(400).json({ message: "All fields are required" });
    }

    const transaction =
      await sql`INSERT INTO transaction(user_id,title,amount,category)
    VALUES (${user_id},${title},${amount},${category})
    RETURNING *
    `;
    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (err) {
    console.log("error creating the transaction", err);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    const result = await sql`
    DELETE FROM transaction WHERE id = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("error getting the transaction", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;
    const balanceResult = await sql`
   SELECT COALESCE(SUM(amount),0) as balance FROM transaction WHERE user_id = ${userId}
   `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount),0) as income FROM transaction WHERE user_id = ${userId} AND amount > 0
   `;

    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount),0) as expenses FROM transaction WHERE user_id = ${userId} AND amount < 0
   `;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expense: expenseResult[0].expenses,
    });
  } catch (error) {
    console.log("error getting the transaction", error);
    res.status(500).json({ message: "internal server error" });
  }
}
