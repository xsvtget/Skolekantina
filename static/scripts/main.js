// --- Dynamic weekly menu rendering ---
async function fetchMenu() {
  const res = await fetch('/api/menu');
  if (!res.ok) return {};
  return await res.json();
}

// Функция обновления карточки продукта
function updateProductCard(productElement, item) {
  // Обновляем изображение
  const img = productElement.querySelector('img');
  if (img) img.src = item.image || '';
  
  // Обновляем название
  const title = productElement.querySelector('.product__title');
  if (title) title.textContent = item.name || '';
  
  // Обновляем описание
  const description = productElement.querySelector('.product__text');
  if (description) description.textContent = item.description || '';
  
  // Добавляем цену, если её ещё нет
  if (!productElement.querySelector('.product__price')) {
    const priceDiv = document.createElement('div');
    priceDiv.className = 'product__price';
    priceDiv.textContent = item.price ? item.price + ' NOK' : '';
    productElement.appendChild(priceDiv);
  } else {
    const priceDiv = productElement.querySelector('.product__price');
    priceDiv.textContent = item.price ? item.price + ' NOK' : '';
  }
}

// Функция, отображающая меню, заменяя содержимое существующих блоков
function renderWeeklyMenu(menu) {
  // Получаем все карточки продуктов
  const productCards = document.querySelectorAll('.main__product');
  
  // Если блоков недостаточно для всех блюд, будем использовать только доступные
  let cardIndex = 0;
  
  // Обходим все дни недели
  const days = ['monday','tuesday','wednesday','thursday','friday'];
  days.forEach(day => {
    // Если есть блюда для этого дня
    if (menu[day] && menu[day].length) {
      // Обновляем каждое блюдо
      menu[day].forEach(item => {
        // Если есть доступная карточка, обновляем её
        if (cardIndex < productCards.length) {
          updateProductCard(productCards[cardIndex], item);
          cardIndex++;
        }
      });
    }
  });
  
  // Если блюд меньше, чем карточек, скрываем оставшиеся карточки
  for (let i = cardIndex; i < productCards.length; i++) {
    productCards[i].style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const menu = await fetchMenu();
  renderWeeklyMenu(menu);
});
// Entry script
console.log("App loaded");

document.querySelectorAll('.title').forEach(el => {
  el.addEventListener('click', () => {
    el.classList.toggle('active');
  });
});
