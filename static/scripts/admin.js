// --- API helpers ---
async function fetchMenu() {
	const res = await fetch('/api/menu');
	if (!res.ok) return {};
	return await res.json();
}

async function saveMenu(menuData) {
	const res = await fetch('/api/menu', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(menuData)
	});
	return await res.json();
}

// --- State ---
let menuData = {
	monday: [],
	tuesday: [],
	wednesday: [],
	thursday: [],
	friday: []
};
let currentDay = 'monday';

// --- UI helpers ---
function renderMenuForDay(day) {
	const container = document.getElementById(`${day}-items`);
	container.innerHTML = '';
	(menuData[day] || []).forEach((item, idx) => {
		const div = document.createElement('div');
		div.className = 'menu-item';
		div.innerHTML = `
			<img src="${item.image || ''}" class="menu-item-image" alt="" />
			<div class="menu-item-details">
				<div class="menu-item-name">${item.name}</div>
				<div class="menu-item-description">${item.description}</div>
				<div class="menu-item-price">${item.price} NOK</div>
			</div>
			<div class="menu-item-actions">
				<button class="edit-btn" data-idx="${idx}" data-day="${day}">Edit</button>
				<button class="delete-btn" data-idx="${idx}" data-day="${day}">Delete</button>
			</div>
		`;
		container.appendChild(div);
	});
}

function renderAllDays() {
	['monday','tuesday','wednesday','thursday','friday'].forEach(renderMenuForDay);
}

function showForm(day, item = null, idx = null) {
	const formTemplate = document.querySelector('.form-template');
	const form = formTemplate.querySelector('form');
	form.day.value = day;
	form.itemId.value = idx !== null ? idx : '';
	form.name.value = item ? item.name : '';
	form.description.value = item ? item.description : '';
	form.price.value = item ? item.price : '';
	form.image.value = item ? item.image : '';
	formTemplate.classList.remove('hidden');
}

function hideForm() {
	document.querySelector('.form-template').classList.add('hidden');
}

// --- Event handlers ---
document.addEventListener('DOMContentLoaded', async () => {
	// Загрузка меню
	menuData = await fetchMenu();
	// Если пусто, инициализируем
	menuData = Object.assign({monday:[],tuesday:[],wednesday:[],thursday:[],friday:[]}, menuData);
	renderAllDays();

	// Переключение вкладок
	document.querySelectorAll('.day-tab').forEach(btn => {
		btn.addEventListener('click', e => {
			document.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			document.querySelectorAll('.day-content').forEach(dc => dc.classList.add('hidden'));
			document.getElementById(`${btn.dataset.day}-content`).classList.remove('hidden');
			currentDay = btn.dataset.day;
		});
	});

	// Кнопки "Add Item"
	document.querySelectorAll('.add-item-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			showForm(btn.dataset.day);
		});
	});

	// Кнопка "Save All Changes"
	document.getElementById('save-all-btn').addEventListener('click', async () => {
		await saveMenu(menuData);
		alert('Menu saved!');
	});

	// Кнопка "Cancel" в форме
	document.querySelector('.cancel-btn').addEventListener('click', hideForm);

	// Сохранение блюда из формы
	document.querySelector('.menu-item-form').addEventListener('submit', e => {
		e.preventDefault();
		const form = e.target;
		const day = form.day.value;
		const idx = form.itemId.value;
		const item = {
			name: form.name.value,
			description: form.description.value,
			price: form.price.value,
			image: form.image.value
		};
		if (idx === '') {
			menuData[day].push(item);
		} else {
			menuData[day][idx] = item;
		}
		renderMenuForDay(day);
		hideForm();
	});

	// Edit/Delete кнопки
	document.querySelectorAll('.menu-items-container').forEach(container => {
		container.addEventListener('click', e => {
			if (e.target.classList.contains('edit-btn')) {
				const day = e.target.dataset.day;
				const idx = e.target.dataset.idx;
				showForm(day, menuData[day][idx], idx);
			}
			if (e.target.classList.contains('delete-btn')) {
				const day = e.target.dataset.day;
				const idx = e.target.dataset.idx;
				if (confirm('Delete this item?')) {
					menuData[day].splice(idx, 1);
					renderMenuForDay(day);
				}
			}
		});
	});
});
