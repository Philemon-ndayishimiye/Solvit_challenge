const ExpData = [];

let currentEditIndex = null;
const editForm = document.getElementById("edit-form");
const editModal = document.getElementById("edit-modal");
const closeBtn = document.getElementById("close-btn");
const expenseForm = document.getElementById("form_data");

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(ExpData));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem("expenses");
  if (data) {
    const parsed = JSON.parse(data);
    parsed.forEach((item) => {
      item.amount =
        item.type === "expense"
          ? -Math.abs(item.amount)
          : Math.abs(item.amount);
    });
    ExpData.push(...parsed);
  }
}

function getFormData(FormElement) {
  const formData = new FormData(FormElement);
  const data = Object.fromEntries(formData.entries());

  data.description = data.description.trim();
  data.date = data.date.trim();
  data.type = formData.get("type");

  // Convert amount to integer
  data.amount = parseInt(data.amount, 10);

  // Validate all fields are filled and amount is a valid integer
  if (
    !data.description ||
    !data.date ||
    isNaN(data.amount) ||
    !Number.isInteger(data.amount) ||
    !data.type
  ) {
    alert("Every field must be filled, and amount must be an integer number.");
    return null;
  }

  // Apply sign based on type
  data.amount =
    data.type === "expense" ? -Math.abs(data.amount) : Math.abs(data.amount);

  return data;
}

function HandleSubmit(e) {
  e.preventDefault();
  const data = getFormData(this);
  if (!data) return;

  ExpData.push(data);

  UpdateTotal();
  UpdateTable();
  UpdateFlex();
  saveToLocalStorage();
  expenseForm.reset();
}

expenseForm.addEventListener("submit", HandleSubmit);

function UpdateTable() {
  const Tbody = document.getElementById("table_body");
  Tbody.innerHTML = "";

  ExpData.forEach((expense, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.description}</td>
      <td style="color: ${expense.amount >= 0 ? "green" : "red"}">${
      expense.amount
    }</td>
      <td>${expense.date}</td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>
      </td>
    `;

    row.querySelector(".delete-btn").addEventListener("click", () => {
      ExpData.splice(index, 1);
      UpdateTotal();
      UpdateTable();
      UpdateFlex();
      saveToLocalStorage();
    });

    row.querySelector(".edit-btn").addEventListener("click", () => {
      currentEditIndex = index;
      editForm.description.value = expense.description;
      editForm.amount.value = Math.abs(expense.amount);
      editForm.date.value = expense.date;
      editForm.type.value = expense.amount < 0 ? "expense" : "income";
      editModal.style.display = "block";
    });

    Tbody.appendChild(row);
  });
}

function UpdateFlex() {
  const container = document.getElementById("container_data");
  container.innerHTML = "";

  ExpData.forEach((expense, index) => {
    const expenseBox = document.createElement("div");
    expenseBox.className = "expense-box";

    const descriptionData = document.createElement("h3");
    descriptionData.textContent = `Description: ${expense.description}`;

    const amountData = document.createElement("p");
    amountData.textContent = `Amount: ${expense.amount}`;
    amountData.style.color = expense.amount >= 0 ? "green" : "red";

    const dateData = document.createElement("p");
    dateData.textContent = `Date: ${expense.date}`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
      ExpData.splice(index, 1);
      UpdateTotal();
      UpdateFlex();
      UpdateTable();
      saveToLocalStorage();
    });

    editBtn.addEventListener("click", () => {
      currentEditIndex = index;
      editForm.description.value = expense.description;
      editForm.amount.value = Math.abs(expense.amount);
      editForm.date.value = expense.date;
      editForm.type.value = expense.amount < 0 ? "expense" : "income";
      editModal.style.display = "block";
    });

    expenseBox.appendChild(descriptionData);
    expenseBox.appendChild(amountData);
    expenseBox.appendChild(dateData);
    expenseBox.appendChild(editBtn);
    expenseBox.appendChild(deleteBtn);

    container.appendChild(expenseBox);
  });
}

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getFormData(editForm);
  if (!data || currentEditIndex === null) return;

  ExpData[currentEditIndex] = { ...ExpData[currentEditIndex], ...data };

  editModal.style.display = "none";
  currentEditIndex = null;

  UpdateTotal();
  UpdateFlex();
  UpdateTable();
  saveToLocalStorage();
});

closeBtn.addEventListener("click", () => {
  editModal.style.display = "none";
  currentEditIndex = null;
});

function CalculateTotal() {
  return ExpData.reduce((total, exp) => total + exp.amount, 0);
}

function UpdateTotal() {
  const headTotal = document.getElementById("total_amount");
  const total = CalculateTotal();

  headTotal.innerHTML = `<h1>Total Amount: ${total}</h1>`;
  headTotal.style.color = total < 0 ? "red" : total > 0 ? "green" : "black";
}

function filterExpenses() {
  const minAmount = parseFloat(document.getElementById("minAmount").value);
  const maxAmount = parseFloat(document.getElementById("maxAmount").value);
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  const filtered = ExpData.filter((expense) => {
    const amount = expense.amount;
    const date = expense.date;

    if (!isNaN(minAmount) && amount < minAmount) return false;
    if (!isNaN(maxAmount) && amount > maxAmount) return false;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;

    return true;
  });

  renderFilteredExpenses(filtered);
}

function renderFilteredExpenses(expenses) {
  const container = document.getElementById("container_data");
  container.innerHTML = "";

  expenses.forEach((expense) => {
    const expenseBox = document.createElement("div");
    expenseBox.className = "expense-box";

    const descriptionData = document.createElement("h3");
    descriptionData.textContent = `Description: ${expense.description}`;

    const amountData = document.createElement("p");
    amountData.textContent = `Amount: ${expense.amount}`;
    amountData.style.color = expense.amount >= 0 ? "green" : "red";

    const dateData = document.createElement("p");
    dateData.textContent = `Date: ${expense.date}`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    editBtn.addEventListener("click", () => {
      const newDescription = prompt(
        "Enter new description:",
        expense.description
      );
      const newAmount = prompt("Enter new amount:", Math.abs(expense.amount));
      const newDate = prompt("Enter new date:", expense.date);

      if (newDescription && newAmount && newDate) {
        expense.description = newDescription;
        expense.amount =
          expense.amount < 0 ? -Math.abs(newAmount) : Math.abs(newAmount);
        expense.date = newDate;

        filterExpenses();
        UpdateTotal();
        saveToLocalStorage();
      }
    });

    deleteBtn.addEventListener("click", () => {
      const idx = ExpData.findIndex((item) => item === expense);
      if (idx !== -1) {
        ExpData.splice(idx, 1);
        filterExpenses();
        UpdateTotal();
        saveToLocalStorage();
      }
    });

    expenseBox.appendChild(descriptionData);
    expenseBox.appendChild(amountData);
    expenseBox.appendChild(dateData);
    expenseBox.appendChild(editBtn);
    expenseBox.appendChild(deleteBtn);

    container.appendChild(expenseBox);
  });
}

document.getElementById("filterBtn").addEventListener("click", filterExpenses);

document.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  UpdateTotal();
  UpdateTable();
  UpdateFlex();
});

const showFormBtn = document.getElementById("showFormBtn");
const form = document.getElementById("form_data");
showFormBtn.addEventListener("click", () => {
  form.style.display = form.style.display === "block" ? "none" : "block";
});
