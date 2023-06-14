import Tickets from "./Tickets";

const demoContent = [
  {
    id: 10,
    column: "todo",
    text: "Hello world",
  },
  {
    id: 2,
    column: "todo",
    text: 'Нажми "+ Add another card", чтобы добавить задачу',
  },
  {
    id: 18,
    column: "todo",
    text: "Как удалить задачу: наведи на поле, нажми на появившийся крестик",
  },
  {
    id: 5,
    column: "in-progress",
    text: "Задачи, которые находятся в работе",
  },
  {
    id: 7,
    column: "done",
    text: "Для выполненных задач",
  },
];

const tickets = new Tickets(demoContent);
tickets.init();
