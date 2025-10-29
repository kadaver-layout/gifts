// Инициализирует модуль работы с картой.
function initMapModule(citiesData, cartItems) {
  let map;
  let markers = [];
  let currentCityPoints = [];
  const mapContainerId = "map";

  // Находит точку самовывоза по ID.
  function findPointById(id) {
    for (const city of citiesData.cities) {
      const foundPoint = city.points.find((p) => p.id === id);
      if (foundPoint) return foundPoint;
    }
    return null;
  }

  // Рендерит список пунктов самовывоза.
  function renderPickupPoints(points) {
    const listElement = document.querySelector(".delivery__fairs-list");
    if (!listElement) {
      console.error("Элемент списка точек самовывоза не найден.");
      return;
    }
    listElement.innerHTML = "";
    points.forEach((point) => {
      const listItem = document.createElement("li");
      // Важно: обработчики кликов убраны, основной файл будет их назначать
      listItem.innerHTML = `
        <a data-point-id="${point.id}" class="delivery__fair-item pickup-point-link" href="#">
          <div class="delivery__fair-details">
            <p class="delivery__fair-address">${point.address}</p>
            <p class="delivery__fair-time">${point.working_hours}</p>
          </div>
          <span class="delivery__fair-cost">Бесплатно</span>
        </a>
        <hr class="cart__divider">
      `;
      listElement.appendChild(listItem);
    });
  }

  // Обновляет содержимое оверлея с информацией о точке.
  function updateOverlayContent(point) {
    const addressElement = document.querySelector(".delivery__address-text");
    const workingHoursElement = document.querySelector(
      ".delivery__working-hours"
    );
    const productListElement = document.querySelector(
      ".delivery__product-list"
    );
    if (addressElement) addressElement.textContent = point.address;
    if (workingHoursElement)
      workingHoursElement.textContent = point.working_hours;
    if (productListElement) {
      productListElement.innerHTML = "";
      cartItems.items.forEach((item) => {
          const productCard = document.createElement("div");
          productCard.classList.add("delivery__product-card");
          productCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
            <div class="delivery__product-info">
              <p class="delivery__product-quantity">${item.quantity}</p>
            </div>
          `;
          productListElement.appendChild(productCard);
      });
    }
  }

  // Показывает оверлей с информацией о точке самовывоза.
  function showPickupOverlay() {
    const overlay = document.querySelector(".delivery__pickup-overlay");
    if (overlay) {
      overlay.classList.add("active");
    }
  }

  // Скрывает оверлей с информацией о точке самовывоза.
  function hidePickupOverlay() {
    const overlay = document.querySelector(".delivery__pickup-overlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
    if (map) {
      const tabPickup = document.getElementById("tab-pickup");
      if (tabPickup && tabPickup.checked) {
        if (currentCityPoints && currentCityPoints.length > 0) {
          addMarkers(currentCityPoints);
          console.log("Все метки текущего города восстановлены на карте.");
        } else {
          const defaultCity = citiesData.cities[0];
          if (defaultCity) {
            currentCityPoints = defaultCity.points;
            addMarkers(defaultCity.points);
            console.log("Метки дефолтного города восстановлены на карте.");
          }
        }
      }
    } else {
      console.warn("Карта не инициализирована, невозможно восстановить метки.");
    }
  }

  function hideDeliveryModalOverlay() {
    const overlay = document.querySelector(".overlay-delivery-modal");
    if (overlay) {
      overlay.classList.add("hidden");
    }
  }

  function showDeliveryModalOverlay() {
    const overlay = document.querySelector(".overlay-delivery-modal");
    if (overlay) {
      overlay.classList.remove("hidden");
    }
  }

  // Обновляет карту с выбранной точкой.
  function updateMapWithPoint(point) {
    if (!map) {
      console.error("Карта не инициализирована");
      return;
    }
    map.geoObjects.removeAll();
    markers = [];
    const selectedMarker = new ymaps.Placemark(
      point.coordinates,
      {
        hintContent: point.address,
        balloonContent: `<strong>${point.address}</strong><br>${point.working_hours}`,
      },
      {
        iconLayout: "default#image",
        iconImageHref: "/local/templates/catalog/assets/img/map-check.png",
        iconImageSize: [62, 85],
        iconImageOffset: [-31, -85],
      }
    );
    map.geoObjects.add(selectedMarker);
    markers.push(selectedMarker);
    map.setCenter(point.coordinates, 16);
    updateOverlayContent(point);
    showPickupOverlay();
  }

  // Добавляет маркеры на карту и центрирует карту на них.
  function addMarkers(points) {
    if (!map || !map.geoObjects) {
      console.error("Ошибка: Объект карты или geoObjects не инициализирован.");
      return;
    }
    map.geoObjects.removeAll();
    markers = [];
    // Если нет точек, ничего не делаем
    if (points.length === 0) {
      return;
    }
    points.forEach((point) => {
      const marker = new ymaps.Placemark(
        point.coordinates,
        {
          hintContent: point.address,
          balloonContent: `<strong>${point.address}</strong><br>${point.working_hours}`,
        },
        {
          iconLayout: "default#image",
          iconImageHref: "/local/templates/catalog/assets/img/map-marker.png",
          iconImageSize: [62, 85],
          iconImageOffset: [-31, -85],
        }
      );
      // Обработчик клика будет добавляться из основного файла
      map.geoObjects.add(marker);
      markers.push(marker);
    });
    // Если одна точка, центрируем на ней
    if (points.length === 1) {
      map.setCenter(points[0].coordinates, 16);
    }
    // Если несколько точек, вычисляем границы и центрируем
    else if (points.length > 1) {
      let minLat = points[0].coordinates[0];
      let maxLat = points[0].coordinates[0];
      let minLon = points[0].coordinates[1];
      let maxLon = points[0].coordinates[1];
      points.forEach((point) => {
        const [lat, lon] = point.coordinates;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
      });
      // Создаем bounds в формате, который принимает API
      const bounds = [
        [minLat, minLon],
        [maxLat, maxLon],
      ];
      // Центрируем и масштабируем карту
      map.setBounds(bounds, {
        checkZoomRange: true,
        zoomMargin: [20, 20, 20, 20], // Отступы в пикселях
      });
    }
  }

  // Инициализирует карту Яндекса.
  function initMap() {
    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) {
      console.log(
        `Элемент карты #${mapContainerId} не найден в DOM. Инициализация карты пропущена.`
      );
      return Promise.resolve(null); // Возвращаем Promise, раз карта не нужна
    }
    return new Promise((resolve) => {
      ymaps.ready(() => {
        try {
          map = new ymaps.Map(mapContainerId, {
            center: [55.753994, 37.620835],
            zoom: 14,
          });
          console.log(mapContainer);
          console.log("Карта успешно инициализирована");
          resolve(map); // Разрешаем Promise с объектом карты
        } catch (e) {
          console.error("Ошибка при инициализации карты:", e);
          map = null;
          resolve(null); // Разрешаем Promise с null в случае ошибки
        }
      });
    });
  }

  // Показывает адрес на карте (для доставки).
  function showDeliveryAddressOnMap(address) {
    if (!map) {
      console.warn("Карта для подсказок не инициализирована.");
      return;
    }
    ymaps.geocode(address).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (!firstGeoObject) {
        console.warn("Геокодирование не дало результатов для адреса:", address);
        return;
      }
      const coords = firstGeoObject.geometry.getCoordinates();
      // Очищаем карту и добавляем новую метку
      map.geoObjects.removeAll();
      markers = [];
      const marker = new ymaps.Placemark(
        coords,
        {
          hintContent: address,
          balloonContent: firstGeoObject.getAddressLine(),
        },
        {
          iconLayout: "default#image",
          iconImageHref: "/local/templates/catalog/assets/img/map-marker.png",
          iconImageSize: [62, 85],
          iconImageOffset: [-31, -85],
        }
      );
      map.geoObjects.add(marker);
      markers.push(marker);
      map.setCenter(coords, 15);
    });
  }

  // Удаляет все маркеры с карты.
  function clearMarkers() {
    if (map) {
      map.geoObjects.removeAll();
      markers = [];
      console.log("Маркеры с карты удалены.");
    }
  }

  // Возвращаем объект с публичными методами
  return {
    init: initMap, // Инициализирует карту, возвращает Promise
    renderPickupPoints, // Рендерит список точек
    updateMapWithPoint, // Обновляет карту с выбранной точкой и показывает оверлей
    addMarkers, // Добавляет маркеры на карту
    findPointById, // Находит точку по ID
    hidePickupOverlay, // Скрывает оверлей
    showDeliveryModalOverlay, // Скрывает оверлей
    hideDeliveryModalOverlay, // Скрывает оверлей
    showDeliveryAddressOnMap, // Показывает адрес доставки
    clearMarkers, // Удаляет маркеры
    getMapInstance: () => map, // Получить экземпляр карты (если нужно)
    getCurrentCityPoints: () => currentCityPoints, // Получить текущие точки
    setCurrentCityPoints: (points) => {
      currentCityPoints = points;
    }, // Установить текущие точки
    getDefaultCity: () => citiesData.cities[0] || null, // Получить данные дефолтного города
  };
}

window.initMapModule = initMapModule;
