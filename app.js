const ExpData = [];

let currentEditIndex = null;
const editForm = document.getElementById("edit-form");
const editModal = document.getElementById("edit-modal");
const closeBtn = document.getElementById("close-btn");


function saveToLocalStorage() {
  localStorage.setItem('expenses', JSON.stringify(ExpData));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('expenses');
  if (data) {
    ExpData.push(...JSON.parse(data));
  }
}


const expenseForm = document.getElementById("form_data");

function getFormData(FormElement) {
  const formData = new FormData(FormElement);
  const data = Object.fromEntries(formData.entries());

  data.description = data.description.trim();
  data.date = data.date.trim();
  data.amount = Number(data.amount);

  
  if (!data.description || !data.date || !data.amount) {
    alert('Every field must be filled');
    return null;
  }

  return data;
}


// Handle form submission

function HandleSubmit(e) {
  e.preventDefault();

  const data = getFormData(this);

  
  if (!data) return;

  ExpData.push(data);

  console.log('User data:', ExpData);

  UpdateTotal();
  UpdateTable();
  UpdateFlex();
  saveToLocalStorage(); 
  expenseForm.reset(); // Clear form after submit
}


expenseForm.addEventListener('submit', HandleSubmit);

// === Table rendering function ===
function UpdateTable() {
  const Tbody = document.getElementById('table_body');
  Tbody.innerHTML = ""; // Clear previous rows

  ExpData.forEach((expense, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.description}</td>
      <td style="color: ${expense.amount >= 0 ? 'green' : 'red'}">${expense.amount}</td>
      <td>${expense.date}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;

    // DELETE
    row.querySelector('.delete-btn').addEventListener('click', () => {
      ExpData.splice(index, 1);
      UpdateTotal();
      UpdateTable();
      UpdateFlex();
      saveToLocalStorage();
    });

    // EDIT using modal
    row.querySelector('.edit-btn').addEventListener('click', () => {
      currentEditIndex = index;

      editForm.description.value = expense.description;
      editForm.amount.value = expense.amount;
      editForm.date.value = expense.date;

      editModal.style.display = "block";
    });

    Tbody.appendChild(row);
  });
}

// === Flexbox rendering function ===


function UpdateFlex() {

  const container = document.getElementById('container_data');
  container.innerHTML = ""; // Clear previous content

  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const closeBtn = document.getElementById("close-btn");

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

    // DELETE
    deleteBtn.addEventListener("click", () => {
      ExpData.splice(index, 1);
      UpdateTotal();
      UpdateFlex();
      UpdateTable();
      saveToLocalStorage(); 
    });

    // EDIT
    editBtn.addEventListener("click", () => {
      currentEditIndex = index;

      editForm.description.value = expense.description;
      editForm.amount.value = expense.amount;
      editForm.date.value = expense.date;

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


function getFormData(FormElement) {
  const formData = new FormData(FormElement);
  const data = Object.fromEntries(formData.entries());

  data.description = data.description.trim();
  data.date = data.date.trim();
  data.amount = Number(data.amount);

  if (!data.description || !data.date || !data.amount) {
    alert('Every field must be filled');
    return null;
  }

  return data;
}

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = getFormData(editForm);
  if (!data || currentEditIndex === null) return;

  // Update the correct item
  ExpData[currentEditIndex] = {
    ...ExpData[currentEditIndex],
    ...data
  };

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
  let total = 0;
  for (let i = 0; i < ExpData.length; i++) {
    total += ExpData[i].amount;
  }
  return total;
}

// === Update total on page ===

function UpdateTotal() {
  const headTotal = document.getElementById("total_amount");
  const total = CalculateTotal();

  headTotal.innerHTML = `<h1>Total Amount: ${total}</h1>`;

  if (total < 0) {
    headTotal.style.color = "red";
  } else if (total > 0) {
    headTotal.style.color = "green";
  } else {
    headTotal.style.color = "black"; // for zero 
  }
}



// filtering by amount 

function filterExpenses() {
  const minAmount = parseFloat(document.getElementById('minAmount').value);
  const maxAmount = parseFloat(document.getElementById('maxAmount').value);
  const startDate = document.getElementById('startDate').value; // string in "YYYY-MM-DD"
  const endDate = document.getElementById('endDate').value;
 

  // Filtered array based on conditions
  const filtered = ExpData.filter(expense => {
    const amount = expense.amount;
    const date = expense.date; // assuming date is stored as "YYYY-MM-DD"

    // Amount filters
    if (!isNaN(minAmount) && amount < minAmount) return false;
    if (!isNaN(maxAmount) && amount > maxAmount) return false;
    
     // Date filters (compare strings as YYYY-MM-DD, or convert to Date objects for safety)
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;

    return true; // passes all filters
  });

  // Now display filtered data instead of full list
  renderFilteredExpenses(filtered);
}

// rendering filtering 

function renderFilteredExpenses(expenses) {
  const container = document.getElementById('container_data');
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

    // Create Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    // Create Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    // Edit functionality
    editBtn.addEventListener("click", () => {
      const newDescription = prompt("Enter new description:", expense.description);
      const newAmount = prompt("Enter new amount:", expense.amount);
      const newDate = prompt("Enter new date:", expense.date);

      if (newDescription && newAmount && newDate) {
        expense.description = newDescription;
        expense.amount = parseFloat(newAmount);
        expense.date = newDate;

        // Re-render with current filter applied (or just update the UI)
        filterExpenses();  // assuming you have this function to filter and render
        UpdateTotal();
        saveToLocalStorage(); 
      }
    });

    // Delete functionality
    deleteBtn.addEventListener("click", () => {
      // Find index in main ExpData array
      const idx = ExpData.findIndex(item => item === expense);
      if (idx !== -1) {
        ExpData.splice(idx, 1);       // Remove from main array
        filterExpenses();             // Re-apply filter and re-render UI
        UpdateTotal();
        saveToLocalStorage(); 
      }
    });

    // Append all elements
    expenseBox.appendChild(descriptionData);
    expenseBox.appendChild(amountData);
    expenseBox.appendChild(dateData);
    expenseBox.appendChild(editBtn);
    expenseBox.appendChild(deleteBtn);

    container.appendChild(expenseBox);
  });
}

// filter button
document.getElementById('filterBtn').addEventListener('click', filterExpenses);


//  Load and render saved data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  UpdateTotal();
  UpdateTable();
  UpdateFlex();
});

//toggle the add expense

 const showFormBtn = document.getElementById('showFormBtn');
 const form = document.getElementById('form_data');
 showFormBtn.addEventListener('click', () => {
  form.style.display = form.style.display === 'block' ? 'none' : 'block'})

// toggle filter
/*
 const filterSection = document.querySelector('.filter-section');
document.getElementById('ShowFilter').addEventListener('click', ()=>{
filterSection.style.display = filterSection.style.display === 'block' ? 'none' : 'block'
})

*/