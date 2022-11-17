import './reset.css';
import './style.css';

// !!!  REMOVE count, countLabel, button

class Todo {
    constructor(name) {
        this.name=name;
    }
}

class List {
    constructor(name) {
        this.name=name;
    }
}

// Model View Controller

class Model {
    constructor() {
        this.lists=[
            new List('Today'),
            new List('Upcoming')];
    }
}

class View {
    constructor() {
        
        this.app = this.getElement('body');

        const header = this.createElement('div','header');
        header.textContent = 'to-do';

        const contentContainer = this.createElement('div','content-container');
        this.sidebar = this.createElement('div','sidebar');
        const mainContent = this.createElement('div','main-content');
        contentContainer.append(this.sidebar,mainContent);

        this.app.append(header,contentContainer);

        // todo-content
        this.listTitle = this.createElement('div','list-title');
        this.todoList = this.createElement('div','todo-list');
        mainContent.append(this.listTitle,this.todoList);
    }

    // helper methods
   
    createElement(tag,className,textContent) {
        const element = document.createElement(tag);
        if (className) {
            element.classList.add(className)
        };

        if (textContent) {
            element.textContent=textContent;
        }

        return element;
    }

    getElement(selector) {
        return document.querySelector(selector);
    }

    // view methods

    displayLists(lists) {
        for (let list of lists) {
            const listTitle = this.createElement('button','sidebar-item',list.name);
            this.sidebar.appendChild(listTitle);
        }
    }

    // event binding DELETE THISs
    bindButton(handler) {
        //this.button.addEventListener('click',handler);
    }
}

class Controller {
    constructor(model,view) {
        this.model=model;
        this.view=view;

        // generate default lists
        this.onListsChanged();

        // event binding DELETE THIS
        this.view.bindButton(this.handleAddCount.bind(this));
        //this.model.bindCountChanged(this.onCountChanged.bind(this));
    }

    onListsChanged() {
        this.view.displayLists(this.model.lists);
    }

    // DELETE THIS
    // MUST use arrow syntax so `this` is the Controller
    onCountChanged(count) {
        this.view.displayCount(count);
    }

    // DELETE THIS
    // MUST use arrow syntax so `this` is the Controller
    handleAddCount() {
        this.model.add();
    }
}

const app = new Controller(new Model(), new View());