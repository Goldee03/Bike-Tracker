/* EXPENSES page (/expenses)
   Other expenses (insurance, repair, accessories ...). */

const EXPENSE_CATEGORIES = ['Insurance','Repair','Accessories','Tires/Puncture','Cleaning','Fine/Challan','Parts','Other'];

// ---- Expenses ----
let editingExpenseId = null;

function expensesTabHTML(){
  const editing = editingExpenseId ? data.expenses.find(e=>e.id===editingExpenseId) : null;
  return `
    <div class="panel">
      <h2>🧾 ${editing ? 'Edit Expense' : 'Log an Expense'}</h2>
      <div class="field-row">
        <div class="field">
          <label>Date</label>
          <input type="date" id="ex-date" value="${editing ? editing.date : todayISO()}">
        </div>
        <div class="field">
          <label>Category</label>
          <select id="ex-category">
            ${EXPENSE_CATEGORIES.map(c=>`<option value="${c}" ${editing && editing.category===c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Amount (₹)</label>
          <input type="number" step="0.01" id="ex-amount" placeholder="e.g. 1800" value="${editing ? editing.amount : ''}">
        </div>
        <div class="field">
          <label>Note</label>
          <input type="text" id="ex-note" placeholder="e.g. Annual insurance premium" value="${editing ? (editing.note||'') : ''}">
        </div>
      </div>
      <button class="btn" onclick="submitExpense()">${editing ? 'Update Expense' : 'Save Expense'}</button>
      ${editing ? `<button class="btn secondary" onclick="cancelEditExpense()">Cancel Edit</button>` : ''}
      <div class="hint">Fuel and service costs are logged in their own tabs and get included in Spending automatically — use this tab for everything else.</div>
    </div>
    <div class="panel">
      <h2>History</h2>
      ${expensesTableHTML()}
    </div>
  `;
}

function expensesTableHTML(){
  const list = [...data.expenses].sort((a,b)=>b.date.localeCompare(a.date));
  if(list.length===0) return `<div class="empty">No other expenses logged yet.</div>`;
  return `<table>
    <tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th></th></tr>
    ${list.map(e=>`
      <tr>
        <td>${dLabel(e.date)}</td>
        <td>${e.category}</td>
        <td>${fmtMoney(e.amount)}</td>
        <td>${e.note||'—'}</td>
        <td class="row-actions">
          <button class="icon-btn" onclick="editExpense('${e.id}')">✎</button>
          <button class="icon-btn" onclick="deleteExpense('${e.id}')">✕</button>
        </td>
      </tr>`).join('')}
  </table>`;
}

function editExpense(id){
  editingExpenseId = id;
  renderTab();
}

function cancelEditExpense(){
  editingExpenseId = null;
  renderTab();
}

async function submitExpense(){
  const date = document.getElementById('ex-date').value;
  const category = document.getElementById('ex-category').value;
  const amount = Number(document.getElementById('ex-amount').value);
  const note = document.getElementById('ex-note').value;
  if(!date || !amount){ alert('Enter date and amount'); return; }
  if(editingExpenseId){
    const idx = data.expenses.findIndex(e=>e.id===editingExpenseId);
    if(idx !== -1){
      data.expenses[idx] = { ...data.expenses[idx], date, category, amount, note };
    }
    editingExpenseId = null;
  } else {
    data.expenses.push({id:'ex'+Date.now(), date, category, amount, note});
  }
  await saveData();
  render();
  activeTab='expenses'; renderTab();
}

async function deleteExpense(id){
  data.expenses = data.expenses.filter(e=>e.id!==id);
  if(editingExpenseId === id) editingExpenseId = null;
  await saveData();
  render();
  activeTab='expenses'; renderTab();
}
