import './reset.css';
import './style.css';

// !!!  REMOVE count, countLabel, button

// Model View Controller

class Model {
    constructor() {
        this.count=0;
    }

    add() {
        this.count+=1;

        // callback
        this.onCountChanged(this.count);
    }

    // event binding

    bindCountChanged(callback) {
        this.onCountChanged = callback;
    }
}

class View {
    constructor() {
        
        this.app = this.getElement('body');

        this.button = this.createElement('button');
        this.button.textContent='click me';

        this.countLabel = this.createElement('div');
        this.countLabel.textContent='0';

        // content
        const header = this.createElement('div','header');
        header.textContent = 'to-do';

        const contentContainer = this.createElement('div','content-container');
        
        const sidebar = this.createElement('div','sidebar');
        const mainContent = this.createElement('div','main-content');

        contentContainer.append(sidebar,mainContent);

        this.app.append(header,contentContainer);

        // lists
        const todoToday = this.createElement('button','todo-today');
        todoToday.textContent = 'Today';
        const todoUpcoming = this.createElement('button','todo-upcoming');
        todoUpcoming.textContent = 'Upcoming';
        sidebar.append(todoToday,todoUpcoming);

        // todos
        this.listTitle = this.createElement('div','list-title');
        this.listTitle.textContent = 'Today';
        this.todoList = this.createElement('div','todo-list');
        mainContent.append(this.listTitle,this.todoList);
    }

    // helper methods
   
    createElement(tag,className) {
        const element = document.createElement(tag);
        if (className) {
            element.classList.add(className)
        };
        return element;
    }

    getElement(selector) {
        return document.querySelector(selector);
    }

    // view methods

    displayCount(count) {
        this.countLabel.textContent=count;
    }

    // event binding
   
    bindButton(handler) {
        this.button.addEventListener('click',handler);
    }
}

class Controller {
    constructor(model,view) {
        this.model=model;
        this.view=view;

        // event binding

        this.view.bindButton(this.handleAddCount.bind(this));

        this.model.bindCountChanged(this.onCountChanged.bind(this));
    }

    // MUST use arrow syntax so `this` is the Controller
    onCountChanged(count) {
        this.view.displayCount(count);
    }

    // MUST use arrow syntax so `this` is the Controller
    handleAddCount() {
        this.model.add();
    }
}

const app = new Controller(new Model(), new View());