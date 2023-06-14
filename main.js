/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/Modals.js
class Modals {
  static showError(text, input) {
    const popoverDiv = document.createElement("div");
    popoverDiv.className = "popover";
    const arrowDiv = document.createElement("div");
    arrowDiv.className = "arrow";
    const popoverContent = document.createElement("div");
    popoverContent.className = "popover-body";
    popoverContent.textContent = text;
    popoverDiv.append(arrowDiv);
    popoverDiv.append(popoverContent);
    input.after(popoverDiv);
    popoverDiv.style.top = `${input.getBoundingClientRect().height + 8}px`;
    popoverDiv.style.left = `${input.getBoundingClientRect().width / 2 - popoverDiv.getBoundingClientRect().width / 2}px`;
    arrowDiv.style.left = `${popoverDiv.getBoundingClientRect().width / 2 - arrowDiv.getBoundingClientRect().width + 3}px`;
    popoverDiv.classList.add("popover-visible");
  }
  static hideError() {
    const popover = document.querySelector(".popover");
    if (popover) popover.remove();
  }
}
;// CONCATENATED MODULE: ./src/js/TicketsMove.js
class TicketsMove {
  constructor() {
    this.clearVars();
  }
  clearVars() {
    this.draggedEl = null;
    this.draggedElCoords = null;
    this.ghostEl = null;
    this.ghostElEmpty = null;
    this.cursX = null;
    this.cursY = null;
    this.insertItem = null;
    this.insertPosition = null;
  }
  emptyGhostElement(e) {
    const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
    const closestColumnItems = elemBelow.closest(".column-items");
    if (!elemBelow.closest(".column") || !closestColumnItems || elemBelow.closest(".column-item.empty")) return;
    if (closestColumnItems.innerHTML === "") {
      closestColumnItems.append(this.ghostElEmpty);
      this.insertItem = {
        column: closestColumnItems.dataset.id
      };
      return;
    }
    if (!elemBelow.closest(".column-item")) return;
    if (e.pageY === elemBelow.getBoundingClientRect().top + elemBelow.getBoundingClientRect().height / 2) {
      return;
    }
    if (e.pageY < elemBelow.getBoundingClientRect().top + elemBelow.getBoundingClientRect().height / 2) {
      elemBelow.closest(".column-item").before(this.ghostElEmpty);
      this.insertPosition = "before";
    }
    if (e.pageY > elemBelow.getBoundingClientRect().top + elemBelow.getBoundingClientRect().height / 2) {
      elemBelow.closest(".column-item").after(this.ghostElEmpty);
      this.insertPosition = "after";
    }
    this.insertItem = {
      id: +elemBelow.closest(".column-item").dataset.id,
      column: closestColumnItems.dataset.id,
      position: this.insertPosition
    };
  }
  ticketGrab(e, item) {
    e.preventDefault();
    if (!item) return;
    this.draggedEl = item;
    this.draggedElCoords = this.draggedEl.getBoundingClientRect();
    this.ghostEl = item.cloneNode(true);
    this.ghostEl.classList.add("dragged");
    this.ghostElEmpty = item.cloneNode(false);
    this.ghostElEmpty.classList.add("empty");
    this.ghostElEmpty.style.height = `${this.draggedElCoords.height - 16}px`;
    this.ghostElEmpty.style.backgroundColor = "#d5dbde";
    document.body.append(this.ghostEl);
    this.ghostEl.style.left = `${this.draggedElCoords.left - 8}px`;
    this.ghostEl.style.top = `${this.draggedElCoords.top - 8}px`;
    this.cursX = e.pageX - this.draggedElCoords.left + 8;
    this.cursY = e.pageY - this.draggedElCoords.top + 8;
    this.emptyGhostElement(e);
    item.remove();
  }
  ticketMove(e) {
    e.preventDefault();
    if (!this.draggedEl) return;
    this.ghostEl.style.left = `${e.pageX - this.cursX}px`;
    this.ghostEl.style.top = `${e.pageY - this.cursY}px`;
    this.emptyGhostElement(e);
    e.target.classList.add("grabbing");
  }
  ticketLeave() {
    if (!this.draggedEl) return false;
    TicketsMove.grabbingRemove();
    this.ghostEl.remove();
    this.clearVars();
    return true;
  }
  ticketDrop() {
    if (!this.draggedEl) return false;
    this.ghostEl.remove();
    this.ghostElEmpty.remove();
    const draggedElResult = {
      draggedElDiv: this.draggedEl,
      insertItemObj: this.insertItem
    };
    this.clearVars();
    TicketsMove.grabbingRemove();
    return draggedElResult;
  }
  static grabbingRemove() {
    const deleteGrabbing = Array.from(document.querySelectorAll(".grabbing"));
    if (deleteGrabbing) deleteGrabbing.forEach(tag => tag.classList.remove("grabbing"));
  }
}
;// CONCATENATED MODULE: ./src/js/Tickets.js


class Tickets {
  constructor(tickets) {
    this.ticketsArr = [];
    if (tickets) this.ticketsArr = tickets;
    this.ticketsMove = new TicketsMove();
    console.log(tickets);
  }
  init() {
    this.tasks = document.querySelector(".main__inner");
    this.columnItems = document.querySelectorAll(".column-items");
    if (localStorage.getItem("cards")) this.ticketsArr = JSON.parse(localStorage.getItem("cards"));
    const sortArr = this.ticketsArr.slice();
    this.lastTicketId = sortArr.sort((a, b) => a.id - b.id).at(-1).id;
    this.events();
    this.updateList();
  }
  events() {
    this.tasks.addEventListener("pointerdown", e => this.clickEvents(e));
    this.tasks.addEventListener("pointermove", e => this.ticketsMove.ticketMove(e));
    this.tasks.addEventListener("pointerleave", () => {
      if (this.ticketsMove.ticketLeave()) {
        this.ticketsMove.ticketLeave();
        this.updateList();
      }
    });
    this.tasks.addEventListener("pointerup", () => {
      const draggedEl = this.ticketsMove.ticketDrop();
      if (!draggedEl) return;
      this.insertTicket(draggedEl);
    });
  }
  clickEvents(e) {
    if (e.target.closest(".add-item")) {
      Tickets.addAnotherTicketCancel();
      this.addAnotherTicket(e);
      return;
    }
    if (e.target.closest(".delete-btn")) {
      e.preventDefault();
      Tickets.addAnotherTicketCancel();
      return;
    }
    if (e.target.closest(".ticket-form")) return;
    if (e.target.closest(".column-item__delete")) {
      this.deleteCard(e);
      return;
    }
    if (e.target.closest(".column-item")) {
      Tickets.addAnotherTicketCancel();
      this.ticketsMove.ticketGrab(e, e.target.closest(".column-item"));
    }
  }
  addAnotherTicket(e) {
    const colItems = e.target.closest(".column").querySelector(".column-items");
    const form = document.createElement("form");
    form.classList.add("ticket-form");
    form.name = "ticketForm";
    form.noValidate = true;
    form.innerHTML = `
            <textarea name="ticketFormValue" class="add-area" placeholder="Enter a text for this card" required></textarea>
            <div class="buttons">
                <button class="add-btn" type="submit">Add card</button>
                <button class="delete-btn" type="reset">&#10005;</button>
            </div>            
        `;
    colItems.after(form);
    const addAnotherCard = e.target.closest(".add-item");
    addAnotherCard.classList.add("hidden");
    form.addEventListener("submit", evt => {
      evt.preventDefault();
      if (form.ticketFormValue.value.trim() === "") {
        Modals.showError("The field cannot be empty", form.ticketFormValue);
        return;
      }
      this.addCard(colItems.dataset.id, form.ticketFormValue.value);
    });
    setTimeout(() => form.ticketFormValue.focus(), 10);
    form.ticketFormValue.addEventListener("focus", () => Modals.hideError());
    form.ticketFormValue.addEventListener("keydown", event => {
      if (event.code === "Enter") {
        event.preventDefault();
        // form.submit(); // Не срабатывает обработка submit, заданная выше
        document.querySelector(".add-btn").click(); // А вот так срабатывает
      }
    });
  }

  static addAnotherTicketCancel() {
    const form = document.querySelector(".ticket-form");
    if (!form) return;
    form.remove();
    const addAnotherCardButtonHidden = document.querySelector(".add-item.hidden");
    addAnotherCardButtonHidden.classList.remove("hidden");
  }
  addCard(column, text) {
    this.lastTicketId += 1;
    this.ticketsArr.push({
      id: this.lastTicketId,
      column,
      text
    });
    Tickets.addAnotherTicketCancel();
    this.updateList();
  }
  deleteCard(e) {
    const deleteItemId = +e.target.closest(".column-item").dataset.id;
    const deleteItemIndex = this.ticketsArr.findIndex(item => item.id === deleteItemId);
    this.ticketsArr.splice(deleteItemIndex, 1);
    this.updateList();
  }
  insertTicket(draggedEl) {
    const draggedElRes = draggedEl.draggedElDiv;
    const insertItemRes = draggedEl.insertItemObj;
    const travelerTicket = this.ticketsArr.find(ticket => ticket.id === +draggedElRes.dataset.id);
    if (insertItemRes.id === travelerTicket.id) {
      this.updateList();
      return;
    }
    travelerTicket.column = insertItemRes.column;
    const travelerTicketIndex = this.ticketsArr.findIndex(ticket => ticket.id === +draggedElRes.dataset.id);
    this.ticketsArr.splice(travelerTicketIndex, 1);
    if (!insertItemRes.id && !insertItemRes.position) {
      this.ticketsArr.push(travelerTicket);
    } else {
      const insertTicketIndex = this.ticketsArr.findIndex(ticket => ticket.id === +insertItemRes.id);
      if (insertItemRes.position === "before") this.ticketsArr.splice(insertTicketIndex, 0, travelerTicket);
      if (insertItemRes.position === "after") this.ticketsArr.splice(insertTicketIndex + 1, 0, travelerTicket);
    }
    this.updateList();
  }
  updateList() {
    Array.from(this.columnItems).forEach(column => {
      const col = column;
      col.innerHTML = "";
    });
    this.ticketsArr.forEach(ticket => {
      const col = Array.from(this.columnItems).find(column => ticket.column === column.dataset.id);
      const ticketDiv = document.createElement("div");
      ticketDiv.className = "column-item";
      ticketDiv.dataset.id = ticket.id;
      ticketDiv.innerHTML = `
                <div class="column-item__text">${ticket.text}</div>
                <div class="column-item__delete"></div>           
            `;
      col.append(ticketDiv);
    });
    localStorage.setItem("cards", JSON.stringify(this.ticketsArr));
  }
}
;// CONCATENATED MODULE: ./src/js/app.js

const demoContent = [{
  id: 10,
  column: "todo",
  text: "Hello world"
}, {
  id: 2,
  column: "todo",
  text: 'Нажми "+ Add another card", чтобы добавить задачу'
}, {
  id: 18,
  column: "todo",
  text: "Как удалить задачу: наведи на поле, нажми на появившийся крестик"
}, {
  id: 5,
  column: "in-progress",
  text: "Задачи, которые находятся в работе"
}, {
  id: 7,
  column: "done",
  text: "Для выполненных задач"
}];
const tickets = new Tickets(demoContent);
tickets.init();
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;