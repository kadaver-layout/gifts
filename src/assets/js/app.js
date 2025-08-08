import Splide from "@splidejs/splide";

// Данные для карты и корзины
const citiesData = {
  cities: [
    {
      name: "Москва",
      points: [
        {
          id: 1,
          address: "г. Москва, ул Малая Бронная, д. 41",
          coordinates: [55.753994, 37.620835],
          available_products: ["Товар 1", "Товар 2"],
          working_hours: "Сегодня с 09:00 до 18:00",
        },
        {
          id: 2,
          address: "г. Москва, ул Малый Арбат, д. 20",
          coordinates: [55.751244, 37.618423],
          available_products: ["Товар 1", "Товар 2"],
          working_hours: "Завтра с 11:00 до 17:00",
        },
      ],
    },
    {
      name: "Санкт-Петербург",
      points: [
        {
          id: 3,
          address: "г. Санкт-Петербург, Невский пр., д. 55",
          coordinates: [59.938631, 30.323055],
          available_products: ["Товар 1", "Товар 2"],
          working_hours: "Сегодня с 10:00 до 19:00",
        },
        {
          id: 4,
          address: "г. Санкт-Петербург, ул. Большая Конюшенная, д. 19",
          coordinates: [59.950446, 30.332728],
          available_products: ["Товар 1", "Товар 2"],
          working_hours: "Завтра с 12:00 до 20:00",
        },
      ],
    },
  ],
};

const cartItems = [
  { id: 1, name: "Товар 1", image: "assets/img/product2.jpg", quantity: 1 },
  { id: 2, name: "Товар 2", image: "assets/img/product1.jpg", quantity: 2 },
];

// Инициализируем модуль карты
let mapModule;

$(document).ready(function () {
  // Установка текущего года
  if (document.getElementById("year")) {
    document.getElementById("year").innerHTML = new Date().getFullYear();
  }

  // Инициализация модального окна выбора города
  const modal = document.getElementById("city-modal");
  const openBtn = document.querySelector('[data-toggle="city-modal"]');
  const closeBtn = document.querySelector('[data-close="city-modal"]');
  if (modal && openBtn && closeBtn) {
    openBtn.addEventListener("click", function () {
      modal.classList.add("open");
    });
    closeBtn.addEventListener("click", function () {
      modal.classList.remove("open");
    });
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.classList.remove("open");
      }
    });
  }

  // Проверка состояния поля адреса при загрузке
  checkAddressInput();

  // Загружает SVG спрайт и вставляет его в DOM
  async function loadSvgSprite() {
    const spriteContainer = document.getElementById("svg-sprite-container");
    if (!spriteContainer) return;
    try {
      const response = await fetch("assets/img/sprite.svg");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const svgText = await response.text();
      spriteContainer.innerHTML = svgText;
    } catch (error) {
      console.error("Ошибка загрузки SVG спрайта:", error);
    }
  }

  // Инициализирует выпадающий список сортировки
  function initSortDropdown() {
    const sortContainers = document.querySelectorAll(".sort-container");
    sortContainers.forEach((container) => {
      const sortToggle = container.querySelector(".sort-toggle");
      const sortMenu = container.querySelector(".sort-menu");
      const selectedText = container.querySelector(".selected-text");
      const currentIcon = container.querySelector(".icon-current use");
      const menuItems = sortMenu.querySelectorAll("li");

      // Переключение видимости меню
      sortToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllSortDropdowns();
        sortToggle.classList.toggle("active");
        sortMenu.classList.toggle("active");
      });

      // Обработка выбора элемента меню
      menuItems.forEach((item) => {
        item.addEventListener("click", function (e) {
          e.stopPropagation();
          const sortType = this.dataset.sort;
          const iconName = this.dataset.icon;
          const text = this.querySelector("span").textContent.trim();
          menuItems.forEach((el) => el.classList.remove("active"));
          this.classList.add("active");
          if (selectedText) {
            selectedText.textContent = text;
          }
          if (currentIcon && iconName) {
            currentIcon.setAttribute("xlink:href", `#${iconName}`);
          }
          sortToggle.classList.remove("active");
          sortMenu.classList.remove("active");
        });
      });
    });

    // Закрытие всех выпадающих списков при клике вне их
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".sort-container")) {
        closeAllSortDropdowns();
      }
    });

    // Закрывает все активные выпадающие списки сортировки
    function closeAllSortDropdowns() {
      const activeToggles = document.querySelectorAll(".sort-toggle.active");
      const activeMenus = document.querySelectorAll(".sort-menu.active");
      activeToggles.forEach((toggle) => toggle.classList.remove("active"));
      activeMenus.forEach((menu) => menu.classList.remove("active"));
    }
  }

  // Загрузка SVG спрайта и инициализация выпадающего списка сортировки
  loadSvgSprite().then(() => {
    setTimeout(initSortDropdown, 100);
  });

  // Инициализация библиотеки AOS для анимаций при прокрутке
  AOS.init();

  // Заменяет теги <img> с классом .svg на встроенный SVG код
  const Svg = () => {
    let x = [".svg"];
    x.forEach((item) => {
      $(item).each(function () {
        let $img = $(this);
        let imgClass = $img.attr("class");
        let imgURL = $img.attr("src");
        $.get(
          imgURL,
          function (data) {
            let $svg = $(data).find("svg");
            if (typeof imgClass !== "undefined") {
              $svg = $svg.attr("class", imgClass + " replaced-svg");
            }
            $svg = $svg.removeAttr("xmlns:a");
            if (
              !$svg.attr("viewBox") &&
              $svg.attr("height") &&
              $svg.attr("width")
            ) {
              $svg.attr(
                "viewBox",
                "0 0 " + $svg.attr("height") + " " + $svg.attr("width")
              );
            }
            $img.replaceWith($svg);
          },
          ""
        );
      });
    });
  };
  Svg();

  // Инициализация мобильного меню
  let burger = document.querySelector(".burger");
  let menu = document.querySelector(".header__list-mobile");
  if (burger && menu) {
    let menuLinks = menu.querySelectorAll(".header__link");
    burger.addEventListener("click", function () {
      burger.classList.toggle("burger--active");
      menu.classList.toggle("header__list-mobile--active");
      document.body.classList.toggle("stop-scroll");
    });
    menuLinks.forEach(function (el) {
      el.addEventListener("click", function () {
        burger.classList.remove("burger--active");
        menu.classList.remove("header__list-mobile--active");
        document.body.classList.remove("stop-scroll");
      });
    });
  }

  // Инициализация видео плееров
  let videoBox = document.querySelectorAll(".reviews__video-box");
  videoBox.forEach((elem) => {
    const videoElem = elem.querySelector(".reviews__video");
    const dataVideo = videoElem.getAttribute("data-video");
    const dataImg = videoElem.getAttribute("data-image");
    const dataId = videoElem.getAttribute("id");
    new Playerjs({
      id: dataId,
      file: dataVideo,
      poster: dataImg,
    });
  });

  // Класс для инициализации кастомных селектов с помощью Select2
  class Select {
    constructor(el, placeholder) {
      this.el = el;
      this.placeholder = placeholder;
    }

    // Инициализирует селект
    init() {
      $(this.el)
        .select2({
          theme: "select-filter__theme",
          dropdownCssClass: "select-filter__drop",
          selectionCssClass: "select-filter__selection",
          allowClear: false,
          closeOnSelect: true,
          dropdownAutoWidth: false,
          placeholder: this.placeholder,
          language: {
            noResults: function (params) {
              return "Нет результатов";
            },
          },
        })
        .on("select2:open", function (e) {
          $(".select2-search__field").attr("placeholder", "Поиск");
        });
    }
  }

  // Инициализация селектов для городов и советов на десктопе
  if (window.screen.availWidth >= 960) {
    const selectCity = new Select($(".city"), "");
    const selectAdvice = new Select($(".advice"), "");
    selectCity.init();
    selectAdvice.init();
  }

  // Обработка состояния инпутов форм
  let inputBlock = document.querySelectorAll(".input_block");
  inputBlock.forEach((elem) => {
    let input = elem.querySelector(".form__input");
    let labelInput = elem.querySelector(".label-input");
    input.addEventListener("input", () => {
      labelInput.classList.add("active");
    });
    input.addEventListener("blur", () => {
      if (input.value === "") {
        labelInput.classList.remove("active");
      }
    });
  });

  // Обработка состояния селектов на мобильных устройствах
  if (window.screen.availWidth < 960) {
    let selectBlock = document.querySelectorAll(".select_block");
    selectBlock.forEach((elem) => {
      let selectMob = elem.querySelector("select");
      let labelSelect = elem.querySelector(".label-input-select");
      selectMob.addEventListener("click", () => {
        labelSelect.classList.add("active");
      });
      document.addEventListener("click", (e) => {
        const withinBoundaries = e.composedPath().includes(selectMob);
        if (!withinBoundaries && selectMob.value == "") {
          labelSelect.classList.remove("active");
        }
      });
    });
  } else {
    // Обработка состояния селектов на десктопе
    let selectBlock = document.querySelectorAll(".select_block");
    selectBlock.forEach((elem) => {
      let select = elem.querySelector(".select2-selection__rendered");
      let labelSelect = elem.querySelector(".label-input-select");
      select.addEventListener("click", () => {
        labelSelect.classList.add("active");
      });
      document.addEventListener("click", (e) => {
        const withinBoundaries = e.composedPath().includes(select);
        if (
          !withinBoundaries &&
          select.innerHTML ===
            '<span class="select2-selection__placeholder"></span>'
        ) {
          labelSelect.classList.remove("active");
        }
      });
    });
  }

  // Инициализация валидации формы
  if (document.querySelector("#form")) {
    const validation = new JustValidate("#form", {
      errorFieldCssClass: "is-invalid",
      errorLabelStyle: {
        fontSize: "12px",
        color: "#F65252",
      },
      focusInvalidField: true,
      lockForm: true,
    });
    validation
      .addField("#name_input", [
        {
          rule: "required",
          errorMessage: "Вы не ввели имя",
        },
        {
          rule: "minLength",
          value: 3,
          errorMessage: "Слишком короткое имя",
        },
        {
          rule: "maxLength",
          value: 30,
          errorMessage: "Слишком длинное имя",
        },
      ])
      .addField("#tel_input", [
        {
          rule: "required",
          errorMessage: "Вы не ввели телефон",
        },
      ]);
  }

  // Обработка кнопки "Показать все" в каталоге
  let allBtn = document.querySelector(".catalog__all-btn");
  let allCatalog = document.querySelectorAll(".catalog__item--hidden");
  if (allBtn) {
    allBtn.addEventListener("click", () => {
      allBtn.classList.add("d-n");
      allCatalog.forEach((element) => {
        element.classList.toggle("hidden");
      });
    });
  }

  // Инициализация слайдера
  if (document.querySelector(".slider")) {
    const splide = new Splide(".slider", {
      perPage: 5,
      arrows: false,
      pagination: false,
      breakpoints: {
        1919: {
          perPage: 4,
        },
        1344: {
          perPage: 4,
        },
        1199: {
          perPage: 4,
        },
        959: {
          perPage: 3,
        },
        599: {
          perPage: 2,
        },
      },
    });
    splide.mount();
    document
      .querySelector(".slider-nav--next")
      .addEventListener("click", function () {
        splide.go(">");
      });
    document
      .querySelector(".slider-nav--prev")
      .addEventListener("click", function () {
        splide.go("<");
      });
  }

  // Обработка навигации по категориям каталога
  const catalogNavBtn = document.querySelectorAll(".category-nav__btn");
  if (catalogNavBtn) {
    catalogNavBtn.forEach((el) => {
      el.addEventListener("click", () => {
        const catalogNavItem = el.closest(".category-nav__item");
        catalogNavItem.classList.toggle("active");
      });
    });
  }

  // Обработка кнопок добавления в корзину и счетчиков
  const productCards = document.querySelectorAll(".card__button-box");
  productCards.forEach((card) => {
    const addToCartBtn = card.querySelector(".card__button");
    const counterContainer = card.querySelector(".card__button-count");
    const minusBtn = card.querySelector(".card__button-count--minus");
    const plusBtn = card.querySelector(".card__button-count--plus");
    const valueText = card.querySelector(".card__button-count-text");
    if (addToCartBtn && counterContainer && minusBtn && plusBtn && valueText) {
      addToCartBtn.addEventListener("click", function (e) {
        e.preventDefault();
        addToCartBtn.classList.add("is-hidden");
        counterContainer.classList.remove("is-hidden");
        valueText.textContent = "1";
      });
      plusBtn.addEventListener("click", function (e) {
        e.preventDefault();
        let currentValue = parseInt(valueText.textContent) || 1;
        currentValue++;
        valueText.textContent = currentValue;
      });
      minusBtn.addEventListener("click", function (e) {
        e.preventDefault();
        let currentValue = parseInt(valueText.textContent) || 1;
        if (currentValue > 1) {
          currentValue--;
          valueText.textContent = currentValue;
        } else if (currentValue === 1) {
          addToCartBtn.classList.remove("is-hidden");
          counterContainer.classList.add("is-hidden");
        }
      });
    }
  });

  // Обработка счетчиков количества товаров в корзине
  const cartSteppers = document.querySelectorAll(
    ".cart__item-quantity-stepper"
  );
  cartSteppers.forEach((stepper) => {
    const minusBtn = stepper.querySelector(".cart__item-quantity-btn--minus");
    const plusBtn = stepper.querySelector(".cart__item-quantity-btn--plus");
    const valueSpan = stepper.querySelector(".cart__item-quantity-value");
    if (minusBtn && plusBtn && valueSpan) {
      // Обновляет состояние кнопки минус (активна/неактивна)
      function updateMinusButtonState() {
        const currentValue = parseInt(valueSpan.textContent) || 1;
        minusBtn.disabled = currentValue <= 1;
      }
      updateMinusButtonState();
      plusBtn.addEventListener("click", function (e) {
        e.preventDefault();
        let currentValue = parseInt(valueSpan.textContent) || 1;
        currentValue++;
        valueSpan.textContent = currentValue;
        updateMinusButtonState();
      });
      minusBtn.addEventListener("click", function (e) {
        e.preventDefault();
        let currentValue = parseInt(valueSpan.textContent) || 1;
        if (currentValue > 1) {
          currentValue--;
          valueSpan.textContent = currentValue;
          updateMinusButtonState();
        }
      });
    }
  });

  // Обработка чекбокса "Выбрать все" в корзине
  const selectAllCheckboxBox = document.querySelector(".cart__controls");
  const itemCheckboxesBox = document.querySelectorAll(".cart__item-row");
  if (selectAllCheckboxBox && itemCheckboxesBox) {
    const selectAllCheckbox = selectAllCheckboxBox.querySelector(
      ".custom-checkbox__input"
    );
    selectAllCheckbox.addEventListener("change", function () {
      itemCheckboxesBox.forEach((element) => {
        const itemCheckboxes = element.querySelector(".custom-checkbox__input");
        if (!itemCheckboxes.hasAttribute("disabled")) {
          itemCheckboxes.checked = this.checked;
        }
      });
    });
  }

  // Обработка промокодов в корзине
  if (document.querySelector(".cart__promo-input-field")) {
    const promoCodes = ["СКИДКА", "SALE", "ХОЧУСКИДОС"];
    const promoInput = document.querySelector(".cart__promo-input-field");
    const borderInput = promoInput?.closest(".cart__promo-input");
    const orderSummary = document.querySelector(".cart__loader-wrapper");
    const priceBox = orderSummary?.querySelector(".cart__summary-box--price");
    const discountBox = orderSummary?.querySelector(
      ".cart__discount-row--promo"
    );
    const loader = document.querySelector(".cart__loader");
    if (!promoInput) {
      console.log("Promo input field not found.");
    } else {
      // Показывает индикатор загрузки
      function showLoader() {
        if (loader) loader.style.display = "flex";
        if (priceBox) priceBox.style.opacity = "0.3";
      }

      // Скрывает индикатор загрузки
      function hideLoader() {
        if (loader) loader.style.display = "none";
        if (priceBox) priceBox.style.opacity = "1";
      }

      // Обрабатывает введенный промокод
      function processPromoCode(promoCode) {
        const trimmedCode = promoCode.trim().toUpperCase();
        if (promoCodes.includes(trimmedCode)) {
          showLoader();
          setTimeout(() => {
            hideLoader();
            promoInput.value = promoCode.trim();
            borderInput?.classList.remove("promo-invalid");
            borderInput?.classList.add("promo-valid");
            if (discountBox) discountBox.style.display = "flex";
          }, 2000);
        } else {
          showLoader();
          setTimeout(() => {
            hideLoader();
            promoInput.value = "Промокод не существует";
            borderInput?.classList.remove("promo-valid");
            borderInput?.classList.add("promo-invalid");
          }, 2000);
        }
      }

      promoInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          processPromoCode(this.value);
        }
      });
      borderInput?.addEventListener("input", function (e) {
        if (this.classList.contains("promo-invalid")) {
          this.classList.remove("promo-invalid");
        }
        if (this.classList.contains("promo-valid")) {
          this.classList.remove("promo-valid");
        }
      });
      promoInput.addEventListener("focus", function () {
        if (
          this.classList.contains("promo-invalid") &&
          this.value === "Промокод не существует"
        ) {
          this.value = "";
          this.classList.remove("promo-invalid");
        }
      });
    }
  }

  // Карта на главной

  if (document.getElementById("mapMain")) {
    ymaps.ready(initMain);
    function initMain() {
      let destinations = {
        OR: [52.973583, 36.096968], 
        KOM: [52.937419, 36.041649], 
        MIX: [52.993878, 36.114596], 
        LOM: [52.981875, 36.069292], 
      };
      let myMap = new ymaps.Map("mapMain", {
        center: destinations["OR"], 
        zoom: 13.5,
      });

      let myPlacemark = new ymaps.Placemark(
        destinations["KOM"],
        {},
        {
          //опции
          iconLayout: "default#image",
          iconImageHref: "../assets/img/icon-map.svg",
          iconImageSize: [35, 45],
          iconImageOffset: [-20, -50],
        }
      );
      let myPlacemark1 = new ymaps.Placemark(
        destinations["MIX"],
        {},
        {
          //опции
          iconLayout: "default#image",
          iconImageHref: "../assets/img/icon-map.svg",
          iconImageSize: [35, 45],
          iconImageOffset: [-20, -50],
        }
      );
      let myPlacemark2 = new ymaps.Placemark(
        destinations["LOM"],
        {},
        {
          //опции
          iconLayout: "default#image",
          iconImageHref: "../assets/img/icon-map.svg",
          iconImageSize: [35, 45],
          iconImageOffset: [-20, -50],
        }
      );
      // После того как метка была создана, добавляем её на карту.
      myMap.geoObjects.add(myPlacemark);
      myMap.geoObjects.add(myPlacemark1);
      myMap.geoObjects.add(myPlacemark2);
    }
  }

  // ЛОГИКА РАБОТЫ С КАРТОЙ ВЫНЕСЕНА В ОТДЕЛЬНЫЫЙ МОДУЛЬ
  // Инициализация модуля карты
  mapModule = initMapModule(citiesData, cartItems);

  // Инициализация карты при наличии контейнера
  if (document.getElementById("map")) {
    mapModule
      .init()
      .then(() => {
        const defaultCity = mapModule.getDefaultCity();
        if (defaultCity) {
          mapModule.setCurrentCityPoints(defaultCity.points);
          mapModule.renderPickupPoints(defaultCity.points);

          // Назначаем обработчики кликов по пунктам самовывоза из основного файла
          document.querySelectorAll(".pickup-point-link").forEach((link) => {
            link.addEventListener("click", function (e) {
              e.preventDefault();
              const pointId = parseInt(this.getAttribute("data-point-id"));
              const point = mapModule.findPointById(pointId);
              if (point) {
                mapModule.updateMapWithPoint(point);
              }
            });
          });

          // Добавляем маркеры на карту
          mapModule.addMarkers(defaultCity.points);

          // Назначаем обработчики кликов по маркерам
          const mapInstance = mapModule.getMapInstance();
          if (mapInstance && mapInstance.geoObjects) {
            mapInstance.geoObjects.each((geoObject) => {
              // Предполагаем, что geoObject это Placemark, созданный ранее
              // Нужно связать маркер с данными точки. Можно использовать userData.
              const pointData = defaultCity.points.find(
                (p) =>
                  p.coordinates[0] === geoObject.geometry.getCoordinates()[0] &&
                  p.coordinates[1] === geoObject.geometry.getCoordinates()[1]
              );
              if (pointData) {
                geoObject.events.add("click", function () {
                  mapModule.updateMapWithPoint(pointData);
                });
              }
            });
          }
        }
      })
      .catch((error) => {
        console.error("Ошибка при инициализации модуля карты:", error);
      });
  } else {
    console.log(
      "Контейнер карты #map не найден на странице. Инициализация API Яндекс.Карт пропущена."
    );
  }

  // Обработчики переключения вкладок "Самовывоз" и "Доставка"
  const tabPickup = document.getElementById("tab-pickup");
  const tabDelivery = document.getElementById("tab-delivery");
  if (tabPickup) {
    tabPickup.addEventListener("change", function () {
      if (this.checked) {
        // 1. Сброс поля ввода адреса
        const addressInput = document.getElementById("address");
        if (addressInput) {
          addressInput.value = "";
          checkAddressInput();
        }
        // 2. Очистка списка подсказок
        const suggestionsList = document.getElementById("suggestions");
        if (suggestionsList) {
          suggestionsList.innerHTML = "";
        }
        // 3. Получение точек для отображения
        const defaultCity = mapModule.getDefaultCity();
        if (defaultCity) {
          mapModule.setCurrentCityPoints(defaultCity.points);
          // 4. Рендер списка пунктов самовывоза
          mapModule.renderPickupPoints(defaultCity.points);
          // 5. Обновление маркеров на карте
          mapModule.addMarkers(defaultCity.points);

          // Переопределяем обработчики кликов по ссылкам
          document.querySelectorAll(".pickup-point-link").forEach((link) => {
            link.addEventListener("click", function (e) {
              e.preventDefault();
              const pointId = parseInt(this.getAttribute("data-point-id"));
              const point = mapModule.findPointById(pointId);
              if (point) {
                mapModule.updateMapWithPoint(point);
              }
            });
          });

          // Переопределяем обработчики кликов по маркерам
          const mapInstance = mapModule.getMapInstance();
          if (mapInstance && mapInstance.geoObjects) {
            mapInstance.geoObjects.removeAll(); // Очищаем старые
            mapModule.addMarkers(defaultCity.points); // Добавляем новые с обработчиками
            mapInstance.geoObjects.each((geoObject) => {
              const pointData = defaultCity.points.find(
                (p) =>
                  p.coordinates[0] === geoObject.geometry.getCoordinates()[0] &&
                  p.coordinates[1] === geoObject.geometry.getCoordinates()[1]
              );
              if (pointData) {
                geoObject.events.add("click", function () {
                  mapModule.updateMapWithPoint(pointData);
                });
              }
            });
          }
        }
      }
    });
  }
  if (tabDelivery) {
    tabDelivery.addEventListener("change", function () {
      if (this.checked) {
        // Очистка маркеров с карты
        mapModule.clearMarkers();
      }
    });
  }

  // Обработка ввода адреса доставки
  const addressInput = document.getElementById("address");
  const suggestionsList = document.getElementById("suggestions");
  if (addressInput && suggestionsList) {
    addressInput.addEventListener("input", function () {
      const query = this.value.trim();
      if (!query) {
        suggestionsList.innerHTML = "";
        return;
      }
      fetch(
        `https://suggest-maps.yandex.ru/v1/suggest?apikey=1ff1b2a6-af01-45fa-9470-b69c21fcbd91&text=${encodeURIComponent(
          query
        )}&lang=ru_RU`
      )
        .then((res) => res.json())
        .then((data) => {
          suggestionsList.innerHTML = "";
          data.results.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item.title.text;
            li.style.padding = "5px";
            li.style.cursor = "pointer";
            li.addEventListener("click", () => {
              addressInput.value = item.title.text;
              suggestionsList.innerHTML = "";
              mapModule.showDeliveryAddressOnMap(item.title.text); // Используем метод модуля
            });
            suggestionsList.appendChild(li);
          });
        })
        .catch(console.error);
    });
  }

  // Обработчики кликов по кнопкам "Назад" и триггерам оверлеев
  const showOverlayTrigger = document.querySelector(".overlay-trigger");
  if (showOverlayTrigger) {
    showOverlayTrigger.addEventListener("click", () =>
      mapModule.showPickupOverlay
        ? mapModule.showPickupOverlay()
        : console.warn("mapModule.showPickupOverlay not found")
    );
  }
  const backLink = document.querySelector(".delivery__back-link--overlay");
  if (backLink) {
    backLink.addEventListener("click", function (e) {
      e.preventDefault();
      mapModule.hidePickupOverlay();
    });
  }
  document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("pickup-button")) {
      mapModule.hidePickupOverlay();
    }
  });
  const backLinkMain = document.querySelector(".delivery__back-link");
  if (backLinkMain) {
    backLinkMain.addEventListener("click", function (e) {
      e.preventDefault();
    });
  }

  // Открытие карты по кнопке "Показать карту"
  const mapOpenBtn = document.querySelector(".delivery__map-btn--open");
  const deliveryPanel = document.querySelector(".delivery__options-panel");
  const mapContainer = document.querySelector(".delivery__map-container");
  if (mapOpenBtn && deliveryPanel) {
    mapOpenBtn.addEventListener("click", function () {
      deliveryPanel.classList.add("d-n");
      mapContainer.classList.add("active");
    });
  }

  // Закрытие карты по кнопке "Показать списком"
  const mapCloseBtn = document.querySelector(".delivery__map-btn--close");
  if (mapCloseBtn) {
    mapCloseBtn.addEventListener("click", function () {
      deliveryPanel.classList.remove("d-n");
      mapContainer.classList.remove("active");
    });
  }

  // КОНЕЦ ЛОГИКИ РАБОТЫ С КАРТОЙ

  // Повторная инициализация модального окна выбора города
  const changeCityLink = document.querySelector('[data-toggle="city-modal"]');
  const cityModal = document.getElementById("city-modal");
  const closeCityModalBtn = document.querySelector('[data-close="city-modal"]');
  if (changeCityLink && cityModal) {
    changeCityLink.addEventListener("click", function (e) {
      e.preventDefault();
      cityModal.classList.add("open");
    });
    if (closeCityModalBtn) {
      closeCityModalBtn.addEventListener("click", function () {
        cityModal.classList.remove("open");
      });
    }
    window.addEventListener("click", function (event) {
      if (event.target === cityModal) {
        cityModal.classList.remove("open");
      }
    });
  }

  // Проверяем при загрузке страницы
  handleScroll();
  // Добавляем обработчик события прокрутки
  document.addEventListener("scroll", handleScroll);
  // Добавляем обработчик изменения размера окна
  document.addEventListener("resize", handleScroll);
});

// Проверка состояния поля адреса при загрузке
function checkAddressInput() {
  const addressInput = document.getElementById("address");
  const submitButton = document.getElementById("submit-btn");
  if (!addressInput || !submitButton) return;
  function updateButtonState() {
    if (addressInput.value.trim() !== "") {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  }
  updateButtonState();
  addressInput.addEventListener("input", updateButtonState);
}

// Фиксация кнопки корзины при скролле на мобильных
const mediaQuery = window.matchMedia("(max-width: 1199px)");
function handleScroll() {
  // Проверяем, соответствует ли текущая ширина экрана условию
  if (!mediaQuery.matches) {
    return;
  }
  const checkoutBtn = document.querySelector(".cart__checkout-btn");
  const summaryBox = document.querySelector(".cart__summary-box--price");
  if (!checkoutBtn || !summaryBox) {
    return;
  }

  // Получаем координаты ВЕРХНЕЙ границы блока summaryBox относительно viewport
  const summaryBoxRect = summaryBox.getBoundingClientRect();
  const summaryBoxTop = Math.round(summaryBoxRect.top);
  // Получаем высоту viewport
  const viewportHeight = Math.round(window.innerHeight);
  if (summaryBoxTop <= viewportHeight) {
    // Делаем кнопку "статичной" (на своём месте)
    checkoutBtn.classList.add("cart__checkout-btn--static");
  } else {
    // Иначе держим кнопку фиксированной
    checkoutBtn.classList.remove("cart__checkout-btn--static");
  }
}
