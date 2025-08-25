import os
from pymongo import MongoClient
from bson import ObjectId
import time



blocks_data = [
    {
      "_id": ObjectId("5f9d1b9b8c6d4e1f9c3e1b1a"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Универсальное"],
      "title": "Приветствие",
      "location": "Средний зал",
      "roles": ["speaker", "technician"],
      "start_time": 1754902800,
      "duration": 1800000,
      "description": "Встречаем гостей. Бейджики, проверка, фейс контроль, проверка QR кодов. Спикер развлекает собравшихся гостей, техники встречают гостей",
      "comments": [],
      "color": "#8B0000"
    },
    {
      "_id": ObjectId("5f9d1b9b8c6d4e1f9c3e1b1b"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Универсальное"],
      "title": "Фуршет",
      "location": "Малый зал",
      "roles": ["speaker"],
      "start_time": 1754904600,
      "duration": 900000,
      "description": "Спикер приглашает гостей в малый зал, где сервированы столы с канапе, мини десертами и прохладительными напитками на 120 человек",
      "comments": [],
      "color": "#008B8B"
    },
    {
      "_id": ObjectId("5f9d1b9b8c6d4e1f9c3e1b1c"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Универсальное"],
      "title": "Речь по сценарию",
      "location": "Средний зал",
      "roles": ["speaker", "screenWriter"],
      "start_time": 1754906400,
      "duration": 900000,
      "description": "Про историю Школ и зачем это бизнесу. Впервые мы провели Школу менеджеров Яндекса в...",
      "comments": [],
      "color": "#FF4500"
    },
    {
      "_id": ObjectId("5f9d1b9b8c6d4e1f9c3e1b1d"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Для техника", "Развлечения", "Фест"],
      "title": "Выступление музыкальной группы",
      "location": "Концертный зал",
      "roles": ["technician", "speaker"],
      "start_time": 1754908200,
      "duration": 900000,
      "description": "Спикер объявляет название группы. Техники выключают большой свет и включают прожекторы. Группа исполняет 5 песен.",
      "comments": [],
      "color": "#000080"
    },
    {
      "_id": ObjectId("5f9d1b9b8c6d4e1f9c3e1b1e"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Для техника", "Развлечения", "Фест"],
      "title": "Интерактив с публикой",
      "location": "Внутренний двор",
      "roles": ["technician", "speaker"],
      "start_time": 1754910000,
      "duration": 900000,
      "description": "Спикер задает 10 вопросов по теме лекции и принимает ответы из зала. За верные ответы техники раздают мерч (поготовить 10 одинаковых предметов)",
      "comments": [],
      "color": "#4B0082"
    },
    {
      "_id": ObjectId("5e9d1b9b8c6d4e1f9c3e1b2a"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Для техника", "Образовательное", "Фест"],
      "title": "Лекция эксперта",
      "location": "Северный атриум",
      "roles": ["technician", "speaker"],
      "start_time": 1754911800,
      "duration": 1800000,
      "description": "Спикер объявляет гостя. Техники выводят презентацию (ссылка: ). Эксперт выступает с лекцией на тему \"Применение фреймворка userver для написания клиентов GPT API\". Спикер снова выходит на сцену, задает вопросы из QA-секции.",
      "comments": [],
      "color": "#800000"
    },
    {
      "_id": ObjectId("5f9d1b9b8c6d4e1f9c3e1b2b"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Для техника", "Образовательное", "Фест"],
      "title": "Лекторий",
      "location": "Центральный атриум",
      "roles": ["technician", "speaker"],
      "start_time": 1754911800,
      "duration": 1800000,
      "description": "Спикер объявляет начало лектория и рассказывает о темах и лекторах каждой из 4 сцен (Frontend, Backend, DL, non-tech)",
      "comments": [],
      "color": "#800000",
      "children": [
        {
          "_id": "5f9d1b9b8c6d4e1f9c3e1b2a",
          "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
          "is_template": True,
          "tags": ["Для спикера", "Для техника", "Образовательное", "Фест"],
          "title": "Лекция эксперта",
          "location": "Северный атриум",
          "roles": ["technician", "speaker"],
          "start_time": 1754911800,
          "duration": 1800000,
          "description": "Спикер объявляет гостя. Техники выводят презентацию (ссылка: ). Эксперт выступает с лекцией на тему \"Применение фреймворка userver для написания клиентов GPT API\". Спикер снова выходит на сцену, задает вопросы из QA-секции.",
          "comments": [],
          "color": "#800000"
        },
        {
          "_id": "5f9d1b9b8c6d4e1f9c3e1b2a",
          "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
          "is_template": True,
          "tags": ["Для спикера", "Для техника", "Образовательное", "Фест"],
          "title": "Лекция эксперта",
          "location": "Северный атриум",
          "roles": ["technician", "speaker"],
          "start_time": 1754911800,
          "duration": 1800000,
          "description": "Спикер объявляет гостя. Техники выводят презентацию (ссылка: ). Эксперт выступает с лекцией на тему \"Применение фреймворка userver для написания клиентов GPT API\". Спикер снова выходит на сцену, задает вопросы из QA-секции.",
          "comments": [],
          "color": "#800000"
        },
        {
          "_id": "5f9d1b9b8c6d4e1f9c3e1b2a",
          "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
          "is_template": True,
          "tags": ["Для спикера", "Для техника", "Образовательное", "Фест"],
          "title": "Лекция эксперта",
          "location": "Северный атриум",
          "roles": ["technician", "speaker"],
          "start_time": 1754911800,
          "duration": 1800000,
          "description": "Спикер объявляет гостя. Техники выводят презентацию (ссылка: ). Эксперт выступает с лекцией на тему \"Применение фреймворка userver для написания клиентов GPT API\". Спикер снова выходит на сцену, задает вопросы из QA-секции.",
          "comments": [],
          "color": "#800000"
        },
        {
          "_id": "5f9d1b9b8c6d4e1f9c3e1b2a",
          "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
          "is_template": True,
          "tags": ["Для спикера", "Для техника", "Образовательное", "Фест"],
          "title": "Лекция эксперта",
          "location": "Северный атриум",
          "roles": ["technician", "speaker"],
          "start_time": 1754911800,
          "duration": 1800000,
          "description": "Спикер объявляет гостя. Техники выводят презентацию (ссылка: ). Эксперт выступает с лекцией на тему \"Применение фреймворка userver для написания клиентов GPT API\". Спикер снова выходит на сцену, задает вопросы из QA-секции.",
          "comments": [],
          "color": "#800000"
        }
      ]
    },
    {
        "_id": ObjectId("5f9d1b9b8c6d4e1f9c3e1b2a"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Для спикера", "Для техника", "Образовательное", "Фест"],
        "title": "Лекция эксперта",
        "location": "Северный атриум",
        "roles": ["technician", "speaker"],
        "start_time": 1754911800,
        "duration": 1800000,
        "description": "Спикер объявляет гостя. Техники выводят презентацию (ссылка: ). Эксперт выступает с лекцией на тему \"Применение фреймворка userver для написания клиентов GPT API\". Спикер снова выходит на сцену, задает вопросы из QA-секции.",
        "comments": [],
        "color": "#800000"
    },
    {
      "_id": ObjectId("66c9aa000000000000000001"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Универсальное", "Официальная часть"],
      "title": "Вступление ведущего (Выпускной)",
      "location": "Главная сцена",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 300000,
      "description": "Ведущий приветствует гостей, кратко вводит в легенду события (YoungLand), приветствует онлайн-аудиторию.",
      "comments": [],
      "color": "#8B0000"
    },
    {
      "_id": ObjectId("66c9aa000000000000000002"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Для техника", "Официальная часть"],
      "title": "Анонс адженды и правила награждения",
      "location": "Главная сцена",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 240000,
      "description": "Ведущий объясняет порядок награждения, {сертификаты у сцены → выход на сцену → колесо поз → фото → возврат на места}.",
      "comments": [],
      "color": "#B22222"
    },
    {
      "_id": ObjectId("66c9aa000000000000000003"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Официальная часть"],
      "title": "Вызов руководителей Школ (соведущие)",
      "location": "Главная сцена",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 300000,
      "description": "Ведущий приглашает руководителей Школ/треков, каждый даёт короткий спич/совет перед началом блока награждения.",
      "comments": [],
      "color": "#CD5C5C"
    },
    {
      "_id": ObjectId("66c9aa000000000000000004"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Для техника", "Официальная часть", "Награждение"],
      "title": "Награждение команды (итерация)",
      "location": "Перед сценой / Главная сцена",
      "roles": ["speaker", "technician", "screenWriter"],
      "start_time": 0,
      "duration": 150000,
      "description": "1) Команда получает именные сертификаты у сцены. 2) Поднимается на сцену — рукопожатия. 3) Предыдущая команда крутит колесо поз и фотографируется. 4) Ведущий направляет команду на места.",
      "comments": [],
      "color": "#DAA520"
    },
    {
      "_id": ObjectId("66c9aa000000000000000005"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Для техника", "Официальная часть", "Награждение"],
      "title": "Награждение — блок из 10 команд",
      "location": "Главная сцена",
      "roles": ["speaker", "technician", "screenWriter"],
      "start_time": 0,
      "duration": 1800000,
      "description": "Циклическое награждение десяти команд по отработанному паттерну с колесом поз и фотосессией.",
      "comments": [],
      "color": "#FFD700",
      "children": [
        ObjectId("66c9aa00000000000000a001"),
        ObjectId("66c9aa00000000000000a002"),
        ObjectId("66c9aa00000000000000a003"),
        ObjectId("66c9aa00000000000000a004"),
        ObjectId("66c9aa00000000000000a005"),
        ObjectId("66c9aa00000000000000a006"),
        ObjectId("66c9aa00000000000000a007"),
        ObjectId("66c9aa00000000000000a008"),
        ObjectId("66c9aa00000000000000a009"),
        ObjectId("66c9aa00000000000000a00a")
      ]
    },
    {
        "_id": ObjectId("66c9aa00000000000000a001"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 1",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Первая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a002"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 2",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Вторая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a003"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 3",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Третья команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a004"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 4",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Четвёртая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a005"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 5",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Пятая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a006"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 6",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Шестая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a007"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 7",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Седьмая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a008"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 8",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Восьмая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a009"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 9",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Девятая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
        "_id": ObjectId("66c9aa00000000000000a00a"),
        "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
        "is_template": True,
        "tags": ["Награждение"],
        "title": "Награждение команды — слот 10",
        "location": "Главная сцена",
        "roles": ["speaker", "technician"],
        "start_time": 0,
        "duration": 150000,
        "description": "Десятая команда: сертификаты → сцена → колесо → фото.",
        "comments": [],
        "color": "#FFE066"
    },
    {
      "_id": ObjectId("66c9aa000000000000000006"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для техника", "Медиа"],
      "title": "Показ видеоролика (от студентов)",
      "location": "Главная сцена / Экран",
      "roles": ["technician", "speaker"],
      "start_time": 0,
      "duration": 180000,
      "description": "Проиграть заранее подготовленный ролик на большом экране, ведущий делает подводку и вывод.",
      "comments": [],
      "color": "#000080"
    },
    {
      "_id": ObjectId("66c9aa000000000000000007"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Официальная часть", "Фото"],
      "title": "Общая фотография всех команд",
      "location": "Главная сцена / Партер",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 300000,
      "description": "Сбор всех команд у сцены, построение, общая фотография, расстановка света.",
      "comments": [],
      "color": "#4B0082"
    },
    {
      "_id": ObjectId("66c9aa000000000000000008"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Анонсы", "Фест"],
      "title": "Анонс вечерней программы и прощание",
      "location": "Главная сцена",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 240000,
      "description": "Ведущий анонсирует розыгрыш, перформансы и концерты, прощается с офлайн и онлайн-аудиторией.",
      "comments": [],
      "color": "#008B8B"
    },
    {
      "_id": ObjectId("66c9aa000000000000000009"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Онлайн", "Трансляция"],
      "title": "Пре-ролл: разговор ведущих до эфира",
      "location": "Студия / Площадка",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 60000,
      "description": "Камера пишет лёгкий диалог ведущих перед стартом, создаём настроение и живость эфира.",
      "comments": [],
      "color": "#2F4F4F"
    },
    {
      "_id": ObjectId("66c9aa00000000000000000a"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для техника", "Онлайн", "Трансляция"],
      "title": "Заставка шоу",
      "location": "Студия / Экран",
      "roles": ["technician"],
      "start_time": 0,
      "duration": 20000,
      "description": "Короткая графическая заставка с муз.брендом.",
      "comments": [],
      "color": "#000000"
    },
    {
      "_id": ObjectId("66c9aa00000000000000000b"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Онлайн", "Трансляция"],
      "title": "Приветствие ведущих",
      "location": "Студия / Стойка",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 180000,
      "description": "Представление ведущих и проекта Y&&Y, призыв писать вопросы в чат, тизер QR-кода для регистрации.",
      "comments": [],
      "color": "#1E90FF"
    },
    {
      "_id": ObjectId("66c9aa00000000000000000c"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Интервью", "Образовательное"],
      "title": "Интервью: Что такое Young&&Yandex (гость)",
      "location": "Студия / Кресла",
      "roles": ["speaker", "technician", "screenWriter"],
      "start_time": 0,
      "duration": 240000,
      "description": "Интервью с гостем об экосистеме Y&&Y, аудиториях и входных точках для студентов.",
      "comments": [],
      "color": "#20B2AA"
    },
    {
      "_id": ObjectId("66c9aa00000000000000000d"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Развлечения", "Онлайн"],
      "title": "Прогноз погоды (юмористический)",
      "location": "Студия / Экран",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 120000,
      "description": "Короткий развлекательный сегмент с «погодой» по городам присутствия и шутками.",
      "comments": [],
      "color": "#7B68EE"
    },
    {
      "_id": ObjectId("66c9aa00000000000000000e"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Интервью", "Анонсы"],
      "title": "Интервью: Young Con и Баттл вузов (гость)",
      "location": "Студия / Кресла",
      "roles": ["speaker", "technician", "screenWriter"],
      "start_time": 0,
      "duration": 360000,
      "description": "Анонсы фестиваля и баттла: ролик прошлого года, ключевые цифры, призы, дата проведения.",
      "comments": [],
      "color": "#FF8C00"
    },
    {
      "_id": ObjectId("66c9aa00000000000000000f"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Развлечения", "Контент"],
      "title": "Дайджест мемов",
      "location": "Студия / Экран",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 120000,
      "description": "Просмотр подборки мемов от стажёров с короткими комментариями ведущих.",
      "comments": [],
      "color": "#DB7093"
    },
    {
      "_id": ObjectId("66c9aa000000000000000010"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Анонсы", "Образовательное"],
      "title": "Сюжет: Экскурсии в офисы",
      "location": "Студия / Экран",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 120000,
      "description": "Рассказываем про экскурсии: какие локации, зачем, как зарегистрироваться.",
      "comments": [],
      "color": "#3CB371"
    },
    {
      "_id": ObjectId("66c9aa000000000000000011"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Интервью", "Образовательное"],
      "title": "Интервью: Летние Школы и CodeRun (гость)",
      "location": "Студия / Кресла",
      "roles": ["speaker", "technician", "screenWriter"],
      "start_time": 0,
      "duration": 360000,
      "description": "Обновления Летних Школ, CodeRun как тренировочный сервис, подводка к отдельному эфиру про Школы.",
      "comments": [],
      "color": "#8A2BE2"
    },
    {
      "_id": ObjectId("66c9aa000000000000000012"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для техника", "Медиа", "Реклама"],
      "title": "Рекламная вставка: Тренировки по алгоритмам и ML",
      "location": "Студия / Экран",
      "roles": ["technician"],
      "start_time": 0,
      "duration": 90000,
      "description": "Презаписанный ролик с анонсом новых потоков по алгоритмам и ML.",
      "comments": [],
      "color": "#696969"
    },
    {
      "_id": ObjectId("66c9aa000000000000000013"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Презентация", "Образовательное"],
      "title": "Презентация: Проекты для олимпиадников",
      "location": "Студия / Экран",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 150000,
      "description": "Короткая дуэтная презентация проектов для олимпиадного комьюнити.",
      "comments": [],
      "color": "#DC143C"
    },
    {
      "_id": ObjectId("66c9aa000000000000000014"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Презентация", "Карьерное"],
      "title": "Блок: Стажировки (обзор возможностей)",
      "location": "Студия / Стойка",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 300000,
      "description": "Обзор стажёрских направлений, как попасть, чем отличаются, где стартовать.",
      "comments": [],
      "color": "#FF1493"
    },
    {
      "_id": ObjectId("66c9aa000000000000000015"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Онлайн", "Q&A"],
      "title": "Q&A из чата",
      "location": "Студия / Стойка",
      "roles": ["speaker", "technician", "screenWriter"],
      "start_time": 0,
      "duration": 420000,
      "description": "Ведущий зачитывает вопросы из онлайн-чата, гость отвечает; при нехватке вопросов — заготовленные.",
      "comments": [],
      "color": "#2E8B57"
    },
    {
      "_id": ObjectId("66c9aa000000000000000016"),
      "block_id": ObjectId("689f0afbf44e2e29060dfab2"),
      "is_template": True,
      "tags": ["Для спикера", "Анонсы", "Онлайн"],
      "title": "Финал: QR/ссылки и расписание эфиров",
      "location": "Студия / Экран",
      "roles": ["speaker", "technician"],
      "start_time": 0,
      "duration": 180000,
      "description": "Вывод QR-кода и ссылок для регистрации, проговор расписания следующих эфиров, прощание.",
      "comments": [],
      "color": "#4169E1"
    }
]

scenarios_data = [
    {
        "_id": ObjectId("1f9d1b9b8c6d4e1f9c3e1b10"),
        "is_template": True,
        "name": "Конференция",
        "description": "Приветствие, лекции и фуршет",
        "location": "Красная роза", 
        "category": "business",
        "is_popular": False,
        "blocks": [
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b1a"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b1c"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b2a"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b2a"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b2a"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b1b")
        ]
    },
    {
        "_id": ObjectId("1f9d1b9b8c6d4e1f9c3e1b11"),
        "is_template": True,
        "name": "Образовательно-развлекательное мероприятие",
        "description": "Концерты, интерактивы, лекции",
        "location": "Красная роза", 
        "category": "entertainment",
        "is_popular": True,
        "blocks": [
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b1a"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b1c"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b1e"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b2a"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b1d")
        ]
    },
    {
        "_id": ObjectId("1f9d1b9b8c6d4e1f9c3e1b12"),
        "is_template": True,
        "name": "Открытый Лекторий",
        "location": "Красная роза", 
        "description": "Приветствие и лекторий с делением по сценам",
        "category": "education",
        "is_popular": True,
        "blocks": [
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b1a"),
            ObjectId("5f9d1b9b8c6d4e1f9c3e1b2b")
        ]
    },
    {
      "_id": ObjectId("66c9aa000000000000000101"),
      "is_template": True,
      "name": "Выпускной Летних школ",
      "description": "Официальная часть с приветствием, трёхчастным награждением, показом ролика и общей фотографией.",
      "location": "YoungLand / Главная сцена",
      "category": "education",
      "is_popular": True,
      "blocks": [
        ObjectId("66c9aa000000000000000001"),
        ObjectId("66c9aa000000000000000002"),
        ObjectId("66c9aa000000000000000003"),
        ObjectId("66c9aa000000000000000005"),
        ObjectId("66c9aa000000000000000006"),
        ObjectId("66c9aa000000000000000007"),
        ObjectId("66c9aa000000000000000008")
      ]
    },
    {
      "_id": ObjectId("66c9aa000000000000000102"),
      "is_template": True,
      "name": "Утреннее шоу Y&&Y (45 мин)",
      "description": "Живой эфир: приветствие, интервью, ролики, мем-дайджест, анонсы, Q&A и финал с QR.",
      "location": "Студия / Красная Роза",
      "category": "education",
      "is_popular": True,
      "blocks": [
        ObjectId("66c9aa000000000000000009"),
        ObjectId("66c9aa00000000000000000a"),
        ObjectId("66c9aa00000000000000000b"),
        ObjectId("66c9aa00000000000000000c"),
        ObjectId("66c9aa00000000000000000d"),
        ObjectId("66c9aa00000000000000000e"),
        ObjectId("66c9aa00000000000000000f"),
        ObjectId("66c9aa000000000000000010"),
        ObjectId("66c9aa000000000000000011"),
        ObjectId("66c9aa000000000000000012"),
        ObjectId("66c9aa000000000000000013"),
        ObjectId("66c9aa000000000000000014"),
        ObjectId("66c9aa000000000000000015"),
        ObjectId("66c9aa000000000000000016")
      ]
    }
]

def connect_to_mongo():
    #mongo_uri = os.getenv("MONGO_URI", "mongodb://admin:secret@mongodb:27017/scenariosus?authSource=admin")
    mongo_uri = "mongodb://admin1:admin123@rc1d-tntk53cdf8q2dklg.mdb.yandexcloud.net:27018/scenariousus?replicaSet=rs01"
    max_retries = 5
    retry_delay = 5
    
    for i in range(max_retries):
        try:
            client = MongoClient(mongo_uri)
            client.admin.command('ping')
            print("Successfully connected to MongoDB")
            return client
        except Exception as e:
            print(f"Attempt {i+1} failed: {e}")
            if i < max_retries - 1:
                time.sleep(retry_delay)
    
    raise Exception("Could not connect to MongoDB after several attempts")

def load_initial_data():
    global blocks_data, scenarios_data
    client = connect_to_mongo()
    db = client["scenariosus"]
    
    collection = db["blocks"]
    result = collection.insert_many(blocks_data)
    print(f"Inserted {len(result.inserted_ids)} documents into blocks coll")

    collection = db["scenarios"]
    result = collection.insert_many(scenarios_data)
    print(f"Inserted {len(result.inserted_ids)} documents into scenarios coll")

if __name__ == "__main__":
    print(len(blocks_data))
    # load_initial_data()
