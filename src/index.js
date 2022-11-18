import './reset.css';
import './style.css';

import HOME_ICON from './assets/home.svg';
import CALENDAR_ICON from './assets/calendar.svg';
import ADD_ICON from './assets/add.svg';

// !!!  REMOVE count, countLabel, button

class List {
    constructor(name,id) {
        this.name=name;
        this.id=id;
        this.items=[];
    }

    add(todo) {
        this.items.push(todo);
    }
}

// Model View Controller

class Model {

    IDGenerator=-1;

    constructor() {

        this.lists=[
            new List('Today',this.generateID()),
            new List('Upcoming',this.generateID())];
    }

    generateID() {
        this.IDGenerator++;
        return this.IDGenerator;
    }

    getListNames() {
        let listNames = [];
        for (let list of this.lists) {
            listNames.push(list.name);
        }
        return listNames;
    }

    getListIDs() {
        let listIDs = [];
        for (let list of this.lists) {
            listIDs.push(list.id);
        }
        return listIDs;
    }

    getListTitle(id) {
        for (let list of this.lists) {
            if (list.id==id) {
                return list.name;
            }
        }
        return 'list not found';
    }

    getListItems(id) {
        for (let list of this.lists) {
            if (list.id==id) {
                return list.items;
            }
        }
    }
}

class View {
    constructor() {
        
        this.app = this.getElement('body');

        const header = this.createElement('div','header');
        const homeButton = this.createElement('img','header-home-button');
        homeButton.src = HOME_ICON;
        const headerSpacer = this.createElement('div','header-spacer');
        const addButton = this.createElement('img','header-add-button');
        addButton.src = ADD_ICON;
        header.append(homeButton,headerSpacer,addButton);

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
    
    displaySidebar(listNames,listIDs) {
        // displays sidebar given a list of item names
        for (let i=0;i<listNames.length;i++) {
            const sidebarItem = this.createElement('button','sidebar-item');
            sidebarItem.dataset.id = listIDs[i];
            this.sidebar.appendChild(sidebarItem);

            const sidebarItemIcon = this.createElement('img','sidebar-item-icon');
            sidebarItemIcon.src=CALENDAR_ICON;
            const sidebarItemLabel = this.createElement('div','sidebar-item-label',listNames[i]);
            sidebarItem.append(sidebarItemIcon,sidebarItemLabel);
        }
    }

    displayListTitle(title) {
        this.listTitle.textContent=title;
    }

    displayList(items) {
        // clear todos
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild);
        }

        items.forEach(item => {
            const itemNode = this.createElement('div','list-item',item);
            this.todoList.append(itemNode);
        })
    }

    // event binding

    bindListReferences(handler) {
        for (let listReference of document.querySelectorAll('.sidebar-item')) {
            listReference.addEventListener('click',() => handler(listReference.dataset.id))
        }
    }
}

class Controller {
    constructor(model,view) {
        this.model=model;
        this.view=view;

        // generate default lists
        this.onListsChanged();

        // event binding
        this.view.bindListReferences(this.handleListClicked.bind(this));

        // event binding DELETE THIS
        //this.view.bindButton(this.handleAddCount.bind(this));
        //this.model.bindCountChanged(this.onCountChanged.bind(this));
    }

    onListsChanged() {
        this.view.displaySidebar(this.model.getListNames(),this.model.getListIDs());
    }

    // event handling
    handleListClicked(id) {
        this.view.displayListTitle(this.model.getListTitle(id));
        this.view.displayList(this.model.getListItems(id));
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

// for testing (DELETE THIS)
app.model.lists[0].add('pick up groceries');
app.model.lists[0].add('go to the store');