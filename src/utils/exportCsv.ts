import type { Expense } from "../types/Expense";

export function exportExpensesToCSV(data: Expense[]) {
  if (!data || data.length === 0) {
    alert("No expenses to export.");
    return;
  }

  const headers = [
    "id",
    "user_id",
    "amount",
    "category",
    "description",
    "date",
    "is_income",
  ];

  const rows = data.map((item) =>
    [
      item.id,
      item.user_id,
      item.amount,
      item.category,
      item.description || "",
      item.date,
      item.is_income,
    ].join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "expenses.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
