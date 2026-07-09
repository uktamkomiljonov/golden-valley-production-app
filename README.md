# Golden Valley Production Console

Локальная веб-программа для подготовки production run по свежим фруктам и овощам.

## Как открыть

Откройте файл `index.html` в браузере.

Сервер не нужен. Приложение работает офлайн.

## Deployment

Проект подготовлен как frontend-only static app для Vercel.

- Install command: `echo "No install step required"`
- Build command: `node scripts/build.js`
- Output directory: `dist`
- Test command: `node scripts/check.js`

Supabase на текущем этапе не требуется: в приложении нет backend API, auth, database reads/writes или storage calls. Все генерации работают в браузере.

## Что генерирует

- SVG full die-line для выбранной коробки.
- PNG preview для упаковки.
- PDF handoff preview для упаковки.
- AI-named handoff файл для открытия/доработки через Adobe Illustrator workflow.
- Индивидуальную SVG/PNG-иллюстрацию товара.
- Carton label SVG.
- Traceability QR SVG.
- 3D web preview HTML с вращаемой коробкой и SVG-текстурами текущего дизайна.
- 3D preview PNG.
- Print-ready handoff PDF с bleed/crop marks/layer/spot metadata.
- Prepress Pack HTML со спецификацией, full dieline SVG и отдельными панелями.
- Packing List HTML.
- Commercial Invoice HTML.
- CSV с данными партии.
- Product card HTML для сайта или каталога.
- Marketplace JSON.
- Trace / production manifest JSON.

## Фото товара

В секции `Товар` можно загрузить реальное фото товара в PNG/JPG/WEBP. После загрузки фото автоматически используется:

- на full dieline;
- на carton label;
- в карточке товара;
- в 3D web preview.

Если фото не загружено, приложение автоматически генерирует индивидуальную векторную иллюстрацию товара. Ее можно скачать кнопками `Illustration SVG` и `Illustration PNG`.

## Packing List и Invoice

Документы могут работать в двух режимах:

- одиночный товар: используется текущий выбранный продукт;
- мульти-товарная отгрузка: настройте продукт, нажмите `Add product`, затем настройте следующий продукт и снова нажмите `Add product`.

Packing List, Commercial Invoice и CSV автоматически суммируют cartons, net kg и invoice amount по всем добавленным товарам.

Каждая строка отгрузки сохраняет свой формат упаковки: master carton, plastic clamshell, punnet in carton, plastic crate, tray + film, doypack, vacuum bag или bulk sack. Это позволяет смешивать, например, Pink Paradise tomatoes в plastic crate и Cherry Tomatoes в clamshell/master carton внутри одного Packing List и Commercial Invoice.

По умолчанию:

- отправитель / exporter: `UTUMS GROUP LLC`;
- получатель / buyer: `BFG FIVE STAR FOODSTUFF TRADING LLC`.

Оба поля можно изменить в форме.

## Design Templates

Доступны 5 шаблонов:

- Minimal Premium
- Export Classic
- UAE Retail
- Wholesale Carton
- Organic Sustainable

Шаблон влияет на SVG artwork, 3D-текстуры и prepress metadata.

## 3D Preview

Вкладка `3D` показывает конкретную коробку выбранного размера. Каждая грань получает SVG-текстуру из текущего packaging generator: front, back, left, right, top и bottom. Коробку можно вращать мышкой или touch-жестом. Export `3D HTML` сохраняет отдельный интерактивный файл.

## Production files

В секции `Production files` можно прикрепить существующие материалы:

- `.ai`
- `.pdf`
- `.svg`
- `.png`
- `.jpg`

Файлы попадают в production manifest как attached assets.

## Коробки

- S: 300 x 200 x 100 mm / 2 KG / черешня, ягоды.
- M: 400 x 300 x 100 mm / 4 KG / персик, абрикос.
- L: 400 x 300 x 120 mm / 5 KG / виноград, персик, нектарин.
- XL: 500 x 300 x 180 mm / 8-10 KG / дыня, арбуз, крупные овощи.
- CUSTOM: ручные W/D/H для plastic crate, clamshell, tray + film, doypack, vacuum bag, bulk sack и других нестандартных экспортных упаковок.

## Товары

В базе 160+ товаров: fresh fruits, vegetables, tomato variants, herbs, leafy greens, tropical fruits, dried fruits, raisins, dates, candied fruits, nuts, kernels, seeds, pulses and mixed snack packs.

## QR

QR payload включает:

- Brand
- Product
- Variety
- Box size
- Dimensions
- Weight
- Grade
- Caliber
- Batch
- Packing date
- Harvest date
- Origin
- Exporter
- SSCC

Если выбран Apricot, QR содержит `P=Apricots`. Если выбран Cherry, QR содержит `P=Cherries`.

## SSCC

SSCC генерируется по GS1-логике:

- extension digit
- GS1 company prefix
- serial reference
- Mod-10 check digit

GS1 prefix можно изменить в форме.

## Prepress note

Браузерные SVG-экспорты остаются редактируемыми и используют live text. Если загружено реальное фото товара, SVG/PDF/PNG будут содержать raster image. Для финальной печатной формы в Adobe Illustrator выполните `Type > Create Outlines`, проверьте CMYK swatches, image links/embedded raster, resolution, bleed, dieline spot colors и замените тестовые/примерные коды на утвержденные производственные данные.

Настоящий Adobe Illustrator `.ai` является закрытым форматом. Кнопка AI handoff создает PDF-compatible файл с расширением `.ai` для handoff workflow; финальный production `.ai` рекомендуется сохранять из Adobe Illustrator после проверки SVG/PDF.
