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

  const burger = document.querySelector(".header__burger");
  const navContainer = document.querySelector(".header__nav-container");
  const navBox = document.querySelector(".header__nav-box");
  const navOverlay = document.querySelector(".header__nav-overlay");
  const desktopOverlay = document.querySelector(".header__overlay");
  const body = document.body;
  const pageHeight = document.documentElement.scrollHeight;

  // Функция для открытия меню
  function openMenu() {
    if (navContainer && navBox) {
      navContainer.classList.add("active");
      navBox.classList.add("active");
      const navBoxHeight = navBox.clientHeight;
      setTimeout(() => {
        desktopOverlay.style.top = navBoxHeight + "px";
      }, 500);
    }
    if (burger) {
      burger.classList.add("active");
    }
    // Скрываем скролл только если ширина больше 1199.9px
    if (window.innerWidth > 1199.9) {
      body.style.overflow = "hidden";
    }
    if (window.innerWidth <= 1199.9) {
      navBox.style.height = pageHeight + "px";
    }
  }

  // Функция для закрытия меню
  function closeMenu() {
    if (navContainer && navBox) {
      navContainer.classList.remove("active");
      navBox.classList.remove("active");
      desktopOverlay.style.top = 2 + "px";
    }
    if (burger) {
      burger.classList.remove("active");
    }
    if (window.innerWidth > 1199.9) {
      body.style.overflow = "";
    }
  }

  if (desktopOverlay) {
    desktopOverlay.addEventListener("click", closeMenu);
  }

  // Обработчик клика на бургер
  if (burger) {
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (navContainer && navContainer.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Обработчик клика на оверлей для закрытия меню
  if (navOverlay) {
    navOverlay.addEventListener("click", closeMenu);
  }

  ///popup выбора города
  const overlay = document.createElement("div");
  const popup = document.querySelector(".popup__overlay");
  const popupMobile = document.querySelector(".popup__overlay--mobile");
  const openBtnPopup = document.getElementById("open-popup");
  console.log(popup, popupMobile);

  if (popup && window.innerWidth >= 1199.9) {
    const confirmBtn = popup.querySelector("#confirm-city");
    const changeBtn = popup.querySelector("#change-city");
    // Открыть попап
    openBtnPopup.addEventListener("click", () => {
      popup.style.display = "flex";
    });

    // Подтверждение города
    confirmBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });

    // Изменить город
    changeBtn.addEventListener("click", () => {
      popup.style.display = "none";
      cityModal.classList.add("open");
    });
  }

  if (popupMobile && window.innerWidth <= 1199.9) {
    const confirmBtn = popupMobile.querySelector("#confirm-city");
    const changeBtn = popupMobile.querySelector("#change-city");
    // Открыть попап
    popup.style.display = "none";
    popupMobile.style.display = "flex";
    overlay.style.cssText = `
          position: fixed;
          inset: 0;   
          width: 100vw;
          height: 100vh;
          background-color: rgba(23, 23, 23, 0.4); 
          z-index: 98;
        `;
    document.body.appendChild(overlay);
    overlay.classList.add("overlay-header");

    // Подтверждение города
    confirmBtn.addEventListener("click", () => {
      popupMobile.style.display = "none";
    });

    // Изменить город
    changeBtn.addEventListener("click", () => {
      popupMobile.style.display = "none";

      cityModal.classList.add("open");
    });
  }

  ///поиск мобльная

  const searchButton = document.querySelector(".header__search-button");
  const searchInput = document.querySelector(".header__input");
  const searchBtnBox = document.querySelector(".header__search-btns");
  const serachForm = document.querySelector(".header__search-box");

  const searchReset = document.querySelector(".header__reset-button");
  const searchResault = document.querySelector(".header__search-results");
  const searchBox = document.querySelector(".header__search-form");
  const searchCloseMobile = document.querySelector(
    ".header__search-close--mobile"
  );
  if (searchButton && searchBox) {
    searchButton.addEventListener("click", () => {
      event.preventDefault();
      searchBox.classList.add("active");
      burger.style.display = "none";
      navContainer.classList.remove("active");
    });

    // Закрываем строку поиска при клике вне нее
    document.addEventListener("click", (event) => {
      if (
        searchResault.classList.contains("active") && 
        !searchBox.contains(event.target) &&
        !searchButton.contains(event.target)
      ) {
        searchBox.classList.remove("active");
        burger.style.display = "grid";
        serchReset();
      }
    });

    searchCloseMobile.addEventListener("click", () => {
      searchBox.classList.remove("active");
      burger.style.display = "grid";
      serchReset();
    });
  }

  overlay.style.cssText = `
          position: fixed;
          inset: 0;   
          width: 100vw;
          height: 100vh;
          background-color: rgba(23, 23, 23, 0.4); 
          z-index: 98;
        `;

  /// поиск всплывающее окно
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (searchInput.value.length > 0) {
        searchBtnBox.classList.add("active");
        serachForm.classList.add("active-search");
        body.style.overflow = "hidden";
        document.body.appendChild(overlay);
        overlay.classList.add("overlay-header");
        searchResault.classList.add("active");
        closeMenu();
      } else {
        serchReset();
      }
    });
    if (searchReset) {
      searchReset.addEventListener("click", serchReset);
    }
  }

  function serchReset() {
    searchBtnBox.classList.remove("active");
    serachForm.classList.remove("active-search");
    body.style.overflow = "";
    if (document.querySelector(".overlay-header")) {
      document.body.removeChild(overlay);
    }
    burger.classList.remove("active");
    searchResault.classList.remove("active");
    searchInput.value = "";
  }

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
  // if (document.querySelector("#form")) {
  //   const validation = new JustValidate("#form", {
  //     errorFieldCssClass: "is-invalid",
  //     errorLabelStyle: {
  //       fontSize: "12px",
  //       color: "#F65252",
  //     },
  //     focusInvalidField: true,
  //     lockForm: true,
  //   });
  //   validation
  //     .addField("#name_input", [
  //       {
  //         rule: "required",
  //         errorMessage: "Вы не ввели имя",
  //       },
  //       {
  //         rule: "minLength",
  //         value: 3,
  //         errorMessage: "Слишком короткое имя",
  //       },
  //       {
  //         rule: "maxLength",
  //         value: 30,
  //         errorMessage: "Слишком длинное имя",
  //       },
  //     ])
  //     .addField("#tel_input", [
  //       {
  //         rule: "required",
  //         errorMessage: "Вы не ввели телефон",
  //       },
  //     ]);
  // }

  // Обработка кнопки "Показать все" в каталоге (в новой версии нет)
  // let allBtn = document.querySelector(".catalog__all-btn");
  // let allCatalog = document.querySelectorAll(".catalog__item--hidden");
  // if (allBtn) {
  //   allBtn.addEventListener("click", () => {
  //     allBtn.classList.add("d-n");
  //     allCatalog.forEach((element) => {
  //       element.classList.toggle("hidden");
  //     });
  //   });
  // }

  // Инициализация слайдера

  initializeSlider(".popular-slider", {
    default: 5,
    breakpoints: {
      1919: { perPage: 4 },
      1344: { perPage: 4 },
      1199: { perPage: 4 },
      959: { perPage: 3 },
      599: { perPage: 2 },
    },
  });
  initializeSlider(".viewed-slider", {
    default: 5,
    breakpoints: {
      1919: { perPage: 4 },
      1344: { perPage: 4 },
      1199: { perPage: 4 },
      959: { perPage: 3 },
      599: { perPage: 2 },
    },
  });
  initializeSlider(".similar-slider", {
    default: 5,
    breakpoints: {
      1919: { perPage: 4 },
      1344: { perPage: 4 },
      1199: { perPage: 4 },
      959: { perPage: 3 },
      599: { perPage: 2 },
    },
  });
  initializeSlider(".reviews-slider", {
    default: 6,
    breakpoints: {
      1919: { perPage: 4 },
      1344: { perPage: 4 },
      1199: { perPage: 4 },
      959: { perPage: 3 },
      599: { perPage: 2 },
    },
  });
  // Инициализация видео плееров
  let videoBox = document.querySelectorAll(".reviews__video-box");
  videoBox.forEach((elem) => {
    // console.log(elem);
    const videoElem = elem.querySelector(".reviews__video");
    const dataVideo = videoElem.getAttribute("data-video");
    const dataImg = videoElem.getAttribute("data-image");
    const dataId = videoElem.getAttribute("id");
    // console.log(dataVideo, dataImg, dataId);
    new Playerjs({
      id: dataId,
      file: dataVideo,
      poster: dataImg,
    });
  });

  // Обработка навигации по категориям каталога
  const categoryModalHeader = document.querySelector(".category-modal-header");
  const catalogNavBody = document.querySelector(".header__nav-mobile");
  const catalogNavBtn = catalogNavBody.querySelectorAll(".category-nav__btn");

  if (catalogNavBtn && window.innerWidth >= 1199.9) {
    catalogNavBtn.forEach((el) => {
      el.addEventListener("click", () => {
        const catalogNavItem = el.closest(".category-nav__item");
        console.log(catalogNavItem);

        catalogNavItem.classList.toggle("active");
      });
    });
  }

  if (catalogNavBtn && window.innerWidth <= 1199.9) {
    catalogNavBtn.forEach((el) => {
      el.addEventListener("click", () => {
        categoryModalHeader.classList.add("active");
        categoryModalHeader.querySelector(".sidebar-title").textContent =
          el.textContent.trim();
        categoryModalHeader
          .querySelector(".category-header__btn")
          .addEventListener("click", () => {
            categoryModalHeader.classList.remove("active");
          });
        categoryModalHeader
          .querySelector(".modal-close")
          .addEventListener("click", () => {
            categoryModalHeader.classList.remove("active");
            closeMenu();
          });
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
    const weightSpan = valueText.querySelector("span"); // ← именно внутри p.card__button-count-text

    if (
      !addToCartBtn ||
      !counterContainer ||
      !minusBtn ||
      !plusBtn ||
      !valueText ||
      !weightSpan
    )
      return;

    const baseWeight = 100; // или можно взять из span: parseInt(weightSpan.textContent)

    addToCartBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addToCartBtn.classList.add("is-hidden");
      counterContainer.classList.remove("is-hidden");
      valueText.firstChild.textContent = "1"; // меняем только цифру, не трогая span
      weightSpan.textContent = `${baseWeight} г`;
    });

    plusBtn.addEventListener("click", function (e) {
      e.preventDefault();
      let count = parseInt(valueText.firstChild.textContent.trim()) || 1;
      count++;
      valueText.firstChild.textContent = count;
      weightSpan.textContent = `${count * baseWeight} г`;
    });

    minusBtn.addEventListener("click", function (e) {
      e.preventDefault();
      let count = parseInt(valueText.firstChild.textContent.trim()) || 1;
      if (count > 1) {
        count--;
        valueText.firstChild.textContent = count;
        weightSpan.textContent = `${count * baseWeight} г`;
      } else {
        addToCartBtn.classList.remove("is-hidden");
        counterContainer.classList.add("is-hidden");
      }
    });
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

  // if (document.getElementById("mapMain")) {
  //   function he() {
  //     let centerMapX = arMap.arSettingsMap.x_coordinate;
  //     let centerMapY = arMap.arSettingsMap.y_coordinate;
  //     let zoomMap = arMap.arSettingsMap.zoom;
  //     if (
  //       centerMapX !== undefined &&
  //       centerMapY !== undefined &&
  //       zoomMap !== undefined
  //     ) {
  //       var myMap = new ymaps.Map("mapMain", {
  //         center: [centerMapX, centerMapY],
  //         zoom: zoomMap,
  //       });
  //     } else {
  //       var myMap = new ymaps.Map("mapMain", {
  //         center: [56.865595, 53.18251],
  //         zoom: 3.5,
  //       });
  //     }
  //     $.each(arMap.arItemsMap, function (index, value) {
  //       let x = value.x_coordinate;
  //       let y = value.y_coordinate;
  //       let textPopup = value.text_map_point;
  //       let settingsPopup = {};
  //       console.log(myMap);
  //       if (x != "" && y != "") {
  //         if (textPopup != "") settingsPopup = { balloonContent: textPopup };
  //         else settingsPopup = {};
  //         let myPlacemark = new ymaps.Placemark([x, y], settingsPopup, {
  //           //опции
  //           iconLayout: "default#image",
  //           iconImageHref: "/local/templates/catalog/assets/img/icon-map.svg",
  //           iconImageSize: [35, 45],
  //           iconImageOffset: [-20, -50],
  //         });
  //         myMap.geoObjects.add(myPlacemark);
  //       }
  //     });
  //   }
  //   ymaps.ready(he);
  // }

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
  initMobileSort();
  if (document.querySelector(".cart")) {
    // Проверяем при загрузке страницы
    handleScroll();
    // Добавляем обработчик события прокрутки
    document.addEventListener("scroll", handleScroll);
    // Добавляем обработчик изменения размера окна
    document.addEventListener("resize", handleScroll);
  }
  // фильтры на странице
  const filtersButton = document.querySelector(".filters-button");
  const catalogSidebar = document.querySelector(".catalog-sidebar");
  const sidebarClose = document.querySelector(".sidebar-close");
  const filterItems = document.querySelectorAll(".filter-item[data-modal]");
  const modals = {
    category: document.querySelector(".category-modal"),
    price: document.querySelector(".price-modal"),
  };

  function closeAllModals() {
    Object.values(modals).forEach((modal) => {
      modal?.classList.remove("active");
    });
  }

  function closeSidebar() {
    catalogSidebar?.classList.remove("active");
    document.body.style.overflowY = "auto";
  }

  function openSidebar() {
    catalogSidebar?.classList.add("active");
    document.body.style.overflowY = "hidden";
  }

  filtersButton?.addEventListener("click", openSidebar);
  sidebarClose?.addEventListener("click", closeSidebar);

  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      const modalType = item.getAttribute("data-modal");
      if (modals[modalType]) {
        closeSidebar();
        modals[modalType].classList.add("active");
      }
    });
  });

  const filterCategoryBody = document.querySelector(".category-modal");

  document.querySelectorAll(".apply-button").forEach((button) => {
    button.addEventListener("click", () => {
      closeAllModals();
      closeSidebar();
    });
  });

  document.querySelectorAll(".modal-close").forEach((button) => {
    button.addEventListener("click", (e) => {
      const currentModal = e.target.closest(".category-modal, .price-modal");
      currentModal?.classList.remove("active");
    });
  });

  const calatogSidebar = document.querySelector(".catalog-sidebar");

  console.log(calatogSidebar);

  if (calatogSidebar) {
    const btnCatalogSidebar =
      catalogSidebar.querySelectorAll(".category-nav__btn");

    btnCatalogSidebar.forEach((button) => {
      button.addEventListener("click", () => {
        button.closest(".category-nav__item").classList.toggle("active");
      });
    });
  }

  if (filterCategoryBody) {
    filterCategoryBody
      .querySelectorAll(".category-nav__btn")
      .forEach((button) => {
        button.addEventListener("click", () => {
          console.log(button);

          // closeAllModals();
          button.closest(".category-nav__item").classList.toggle("active");
          // openSidebar();
        });
      });

    filterCategoryBody
      .querySelector(".category-header__btn")
      .addEventListener("click", () => {
        catalogSidebar.classList.add("active");
        filterCategoryBody.classList.remove("active");
      });
  }

  /// cладейр
  const gallery = document.querySelector(".gallery-slider");
  if (gallery) {
    const slide = gallery.querySelectorAll(".splide__slide");
    if (slide.length > 1) {
      initializeProductGallery();
    } else {
      gallery.classList.remove("splide");
      document.querySelector(".video-btn").style.display = "none";
    }
  }

  /// показать все в карточке

  document.querySelectorAll(".show-more").forEach((button) => {
    button.addEventListener("click", function () {
      const detailText = this.previousElementSibling; // <p class="detail-text">
      if (!detailText || !detailText.classList.contains("detail-text")) return;

      const isExpanded = detailText.classList.contains("detail-text--expanded");

      if (isExpanded) {
        detailText.classList.remove("detail-text--expanded");
        this.textContent = "Показать полностью";
      } else {
        detailText.classList.add("detail-text--expanded");
        this.textContent = "Скрыть";
      }
    });
  });

  /// кнопка "в корзину" на мобильной версии
  if (document.querySelector(".product-section")) {
    initVisibilityHandler();
  }

  //чекбокс для страницы "оформление заказа"
  const agreePolicyCheckbox = document.getElementById("agreePolicy");
  const checkoutButton = document.getElementById("checkout-submit-btn");

  if (agreePolicyCheckbox && checkoutButton) {
    agreePolicyCheckbox.addEventListener(
      "change",
      () => (checkoutButton.disabled = !agreePolicyCheckbox.checked)
    );
  }

  if (document.querySelector(".making-order__recipient-box")) {
    const recipient = document.querySelector("#order-recipient");
    const phone = document.querySelector("#order-phone");
    const email = document.querySelector("#order-email");

    const inputs = [recipient, phone, email].filter(Boolean);

    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        validateInput(input);
      });
      input.addEventListener("focus", () => {
        hideError(input);
      });
    });
  }

  if (document.querySelector(".form")) {
    const name = document.querySelector("#name_input");
    const tel = document.querySelector("#tel_input");

    const inputs = [name, tel].filter(Boolean);

    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        validateInput(input);
      });
      input.addEventListener("focus", () => {
        hideError(input);
      });
    });
  }
});
///новая валидация

const messages = {
  required: "Это поле обязательно",
  email: "Введите корректный email",
  tel: "Введите корректный номер телефона",
  minLength: (n) => `Минимум ${n} символов`,
  maxLength: (n) => `Максимум ${n} символов`,
};

function showError(input, message) {
  input.classList.add("is-invalid");
  const id = input.id || input.name || "input";
  let errorEl = document.querySelector(`.error-message[data-for="${id}"]`);

  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.className = "error-message";
    errorEl.setAttribute("data-for", id);
    errorEl.style.cssText = `
        font-size: 12px;
        color: #F65252;
        margin-top: 4px;
        display: block;
      `;
    input.parentNode.insertBefore(errorEl, input.nextSibling);
  }
  errorEl.textContent = message;
}

function hideError(input) {
  input.classList.remove("is-invalid");
  const id = input.id || input.name || "input";
  const errorEl = document.querySelector(`.error-message[data-for="${id}"]`);
  if (errorEl) errorEl.remove();
}

function validateInput(input) {
  const value = input.value.trim();
  const type = input.type;
  const required = input.hasAttribute("required");
  const minLength = input.getAttribute("minlength")
    ? parseInt(input.getAttribute("minlength"))
    : null;
  const maxLength = input.getAttribute("maxlength")
    ? parseInt(input.getAttribute("maxlength"))
    : null;

  // Сбрасываем предыдущую ошибку
  hideError(input);

  // Проверка только если поле не пустое ИЛИ оно required
  // Но показываем ошибку, только если пользователь "трогал" поле

  if (required && !value) {
    showError(input, messages.required);
    return false;
  }

  if (type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
    showError(input, messages.email);
    return false;
  }

  if (type === "tel" && value && !/^[\d\-\+\(\)\s]{10,}$/.test(value)) {
    showError(input, messages.tel);
    return false;
  }

  if (minLength && value && value.length < minLength) {
    showError(input, messages.minLength(minLength));
    return false;
  }

  if (maxLength && value && value.length > maxLength) {
    showError(input, messages.maxLength(maxLength));
    return false;
  }

  return true;
}

/// кнопка "в корзину" на мобильной версии
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Элемент, за которым мы следим
const targetElement = document.querySelector(".add-to-cart-btn");

// Элемент, который нужно скрывать/показывать
const toggleElement = document.querySelector(".add-to-cart-btn--mobile");

// Media query для мобильных экранов
const mobileMediaQuery = window.matchMedia("(max-width: 1199.9px)");

// Функция для обработки видимости
function handleVisibility() {
  if (targetElement && toggleElement) {
    if (mobileMediaQuery.matches) {
      // Работаем только на мобильных экранах
      if (isElementInViewport(targetElement)) {
        // Если основная кнопка видна, скрываем мобильную кнопку
        toggleElement.style.display = "none";
      } else {
        // Если основная кнопка не видна, показываем мобильную кнопку
        toggleElement.style.display = "block";
      }
    } else {
      // На десктопах скрываем элемент
      toggleElement.style.display = "none";
    }
  }
}

// Функция для инициализации
function initVisibilityHandler() {
  if (targetElement && toggleElement) {
    // Слушаем события прокрутки
    window.addEventListener("scroll", handleVisibility);

    // Слушаем изменения размера экрана через media query
    mobileMediaQuery.addEventListener("change", handleVisibility);

    // Проверяем видимость при загрузке страницы
    document.addEventListener("DOMContentLoaded", handleVisibility);

    // Также проверяем после полной загрузки страницы
    window.addEventListener("load", handleVisibility);

    // Первичная проверка
    handleVisibility();
  }
}
// слайдер на странице продукта
function initializeProductGallery() {
  const splide = new Splide(".splide-gallery", {
    type: "loop",
    perPage: 1,
    perMove: 1,
  });

  splide.mount();

  const videoBtn = document.querySelector(".video-btn");

  // Скрываем кнопку видео, когда активен слайд с видео (индекс 2)
  splide.on("moved", function () {
    const currentIndex = splide.index;
    if (currentIndex === 2 && videoBtn) {
      videoBtn.style.display = "none";
    } else if (videoBtn) {
      videoBtn.style.display = "flex";
    }
  });

  // Кнопка видео
  if (videoBtn) {
    videoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      splide.go(2);
    });
  }
}

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
  const cart = document.querySelector(".cart");

  if (!cart) {
    return;
  }
  const checkoutBtn = cart.querySelector(".cart__checkout-btn");
  const summaryBox = cart.querySelector(".cart__summary-box--price");
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

// Инициализация мобильной сортировки
function initMobileSort() {
  if (window.matchMedia("(max-width: 1199.9px)").matches) {
    const mobileSortButton = document.querySelector(".mobile-sort-button");
    const sortModal = document.querySelector(".sort-modal");
    const sortModalOverlay = document.querySelector(".sort-modal-overlay");
    const sortModalClose = sortModal
      ? sortModal.querySelector(".sort-modal-close") ||
        sortModal.querySelector(".modal-close")
      : null;

    if (
      !mobileSortButton ||
      !sortModal ||
      !sortModalClose ||
      !sortModalOverlay
    ) {
      console.warn("Мобильные элементы сортировки не найдены или неполные:", {
        mobileSortButton,
        sortModal,
        sortModalClose,
        sortModalOverlay,
      });
      return;
    }

    mobileSortButton.addEventListener("click", function () {
      console.log("Клик по мобильной кнопке сортировки");
      sortModal.classList.add("active");
      sortModalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    function closeSortModal() {
      sortModal.classList.remove("active");
      sortModalOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    sortModalClose.addEventListener("click", closeSortModal);
    sortModalOverlay.addEventListener("click", closeSortModal);

    const modalMenu = sortModal.querySelector(".sort-menu-modal");
    const desktopMenu = document.querySelector(".sort-menu");
    if (!modalMenu || !desktopMenu) {
      console.warn("Один из списков сортировки не найден:", {
        modalMenu,
        desktopMenu,
      });
      return;
    }

    const modalItems = modalMenu.querySelectorAll("li");
    const desktopItems = desktopMenu.querySelectorAll("li");
    const mobileButtonText = mobileSortButton.querySelector(".selected-text");
    const mobileButtonIcon =
      mobileSortButton.querySelector(".icon-current use");

    const initialActiveDesktopItem = desktopMenu.querySelector("li.active");
    if (initialActiveDesktopItem) {
      const initialText = initialActiveDesktopItem
        .querySelector("span")
        .textContent.trim();
      const initialIcon = initialActiveDesktopItem.dataset.icon;
      if (mobileButtonText) mobileButtonText.textContent = initialText;
      if (mobileButtonIcon && initialIcon) {
        mobileButtonIcon.setAttribute("xlink:href", `#${initialIcon}`);
      }
    }

    modalItems.forEach((modalItem, index) => {
      modalItem.addEventListener("click", function () {
        const sortType = this.dataset.sort;
        const iconName = this.dataset.icon;
        const text = this.querySelector("span").textContent.trim();

        modalItems.forEach((el) => el.classList.remove("active"));
        this.classList.add("active");

        if (mobileButtonText) mobileButtonText.textContent = text;
        if (mobileButtonIcon && iconName) {
          mobileButtonIcon.setAttribute("xlink:href", `#${iconName}`);
        }

        if (desktopItems[index]) {
          desktopItems.forEach((el) => el.classList.remove("active"));
          desktopItems[index].classList.add("active");

          const desktopContainer =
            desktopItems[index].closest(".sort-container");
          if (desktopContainer) {
            const desktopText =
              desktopContainer.querySelector(".selected-text");
            const desktopIcon =
              desktopContainer.querySelector(".icon-current use");
            if (desktopText) desktopText.textContent = text;
            if (desktopIcon && iconName) {
              desktopIcon.setAttribute("xlink:href", `#${iconName}`);
            }
          }
        }

        closeSortModal();
      });
    });
  }
}

/// новая функция слайдера
function initializeSlider(sliderClass, perPageConfig) {
  console.log(sliderClass, perPageConfig);

  const slider = document.querySelector(sliderClass);

  if (!slider) {
    console.warn("Слайдер не инициализирован:", slider);
    return;
  }

  // Инициализация Splide
  const splide = new Splide(slider, {
    perPage: perPageConfig.default || 5,
    arrows: false,
    pagination: false,
    gap: 24,
    breakpoints: perPageConfig.breakpoints || {},
  });

  splide.mount();

  // Ищем стрелки рядом с слайдером
  // Берём ближайший родительский контейнер, который содержит nav кнопки
  const navBox = slider.parentElement.querySelector(".slider-nav-box");
  console.log(slider.parentElement, navBox);

  if (navBox) {
    const nextBtn = navBox.querySelector(".slider-nav--next");
    const prevBtn = navBox.querySelector(".slider-nav--prev");

    if (nextBtn) nextBtn.addEventListener("click", () => splide.go(">"));
    if (prevBtn) prevBtn.addEventListener("click", () => splide.go("<"));
  }
}
