import './reset.css';
import './style.css';

import HOME_ICON from './assets/home.svg';
import CALENDAR_ICON from './assets/calendar.svg';
import ADD_ICON from './assets/add.svg';
import CLOCK_ICON from './assets/clock.svg';
import CIRCLE_ICON from './assets/circle.svg';
import MENU_ICON from './assets/menu.svg'
import FLAG_ICON from './assets/flag.svg'

// !!!  REMOVE count, countLabel, button

class List {
    constructor(name,id,icon=CALENDAR_ICON) {
        this.name=name;
        this.id=id;
        this.icon=icon;
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
            new List('Today',this.generateID(),CALENDAR_ICON),
            new List('Upcoming',this.generateID(),CLOCK_ICON)
        ];
    }

    generateID() {
        this.IDGenerator++;
        return this.IDGenerator;
    }

    // set methods

    addProject(name) {
        const newList = new List(name,this.generateID());
        this.lists.push(newList);
        this.onAddProject();
    }


    // event binding
    
    bindAddProject(callback) {
        this.onAddProject = callback;
    }

    // get methods

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

    getListIcons(id) {
        let listIcons = [];
        for (let list of this.lists) {
            listIcons.push(list.icon);
        }
        return listIcons;
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

        // overlay
        this.overlay = this.createElement('div','overlay');
        this.overlay.addEventListener('click',this.hideModal.bind(this));
        this.app.appendChild(this.overlay);

        // add-project modal
        this.addProjectModal = this.createElement('div','add-project-modal');
        this.addProjectModalNameInput = this.createElement('input','add-project-modal-name-input');
        this.addProjectModalNameInput.setAttribute('placeholder','Add a Project');

        const addProjectModalOptionsContainer = this.createElement('div','add-project-modal-options-container');
        const addProjectModalCancelButton = this.createElement('button','add-project-modal-cancel-button','Cancel');
        addProjectModalCancelButton.addEventListener('click',this.hideModal.bind(this));
        this.addProjectModalAddButton = this.createElement('button','add-project-modal-add-button','Add Project');
        addProjectModalOptionsContainer.append(addProjectModalCancelButton,this.addProjectModalAddButton);

        const addProjectModalFooter = this.createElement('div','add-project-modal-footer');

        this.addProjectModal.append(this.addProjectModalNameInput,addProjectModalOptionsContainer,addProjectModalFooter);
        this.app.appendChild(this.addProjectModal);
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
    
    displaySidebar(listNames,listIDs,listIcons) {

        // clear sidebar
        while (this.sidebar.firstChild) {
            this.sidebar.removeChild(this.sidebar.firstChild);
        }

        // displays sidebar given a list of item names
        for (let i=0;i<listNames.length;i++) {
            const sidebarItem = this.makeSidebarItem(listNames[i],listIDs[i],listIcons[i])
            this.sidebar.appendChild(sidebarItem); 
        }

        // add project
        const addProjectItem = this.makeSidebarItem('Add Project',null,ADD_ICON);
        addProjectItem.classList.add('add-project');
        addProjectItem.addEventListener('click',this.displayaddProjectModal.bind(this));
        this.sidebar.appendChild(addProjectItem);
    }

    displayaddProjectModal() {
        this.overlay.classList.add('active');
        this.addProjectModal.classList.add('active');

        this.addProjectModalNameInput.focus();
    }

    hideModal() {
        this.overlay.classList.remove('active');
        this.addProjectModalNameInput.value='';
        this.addProjectModal.classList.remove('active');
    }

    makeSidebarItem(name,id,icon) {
        const sidebarItem = this.createElement('button','sidebar-item');
        sidebarItem.dataset.id = id;

        const sidebarItemIcon = this.createElement('img','sidebar-item-icon');
        sidebarItemIcon.src=icon;
        const sidebarItemLabel = this.createElement('div','sidebar-item-label',name);
        sidebarItem.append(sidebarItemIcon,sidebarItemLabel);

        return sidebarItem;
    }

    displayListTitle(title) {
        this.listTitle.textContent=title;
    }

    displayList(items) {

        // clear items
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild);
        }

        // display items
        items.forEach(item => {
            const listItem = this.createElement('div','list-item');

            const listItemIcon = this.createElement('img','list-item-icon');
            listItemIcon.src = CIRCLE_ICON;
            const listItemLabel = this.createElement('div','list-item-label',item);
            const listItemSpacer = this.createElement('div','list-item-spacer');
            const listItemFlag = this.createElement('img','list-item-flag');
            listItemFlag.src = FLAG_ICON;
            const listItemMenu = this.createElement('img','list-item-menu');
            listItemMenu.src = MENU_ICON;
            const listItemDate = this.createElement('div','list-item-date','00:00 AM');
            listItemLabel.appendChild(listItemDate);
            listItem.append(listItemIcon,listItemLabel,listItemSpacer,listItemFlag,listItemMenu);

            this.todoList.append(listItem);
        })
    }

    // event binding

    bindListReferences(handler) {
        for (let listReference of document.querySelectorAll('.sidebar-item:not(.add-project)')) {
            listReference.addEventListener('click',() => handler(listReference.dataset.id))
        }
    }

    bindAddProject(handler) {
        this.addProjectModalAddButton.addEventListener('click',() => {
            handler(this.addProjectModalNameInput.value);
            this.hideModal();
        })
    }
}

class Controller {
    constructor(model,view) {
        this.model=model;
        this.view=view;

        // generate default lists
        this.onListsChanged();

        // event binding
        
        this.view.bindAddProject(this.handleAddProject.bind(this));
        this.model.bindAddProject(this.onListsChanged.bind(this));
    }

    onListsChanged() {
        this.view.displaySidebar(this.model.getListNames(),this.model.getListIDs(),this.model.getListIcons());
        this.view.bindListReferences(this.handleListClicked.bind(this));
    }

    // event handling
    handleListClicked(id) {
        this.view.displayListTitle(this.model.getListTitle(id));
        this.view.displayList(this.model.getListItems(id));
    }

    handleAddProject(name) {
        this.model.addProject(name);
    }
}

const app = new Controller(new Model(), new View());

// for testing (DELETE THIS)
app.model.lists[0].add('pick up groceries');
app.model.lists[0].add('go to the store');

// show first project
app.handleListClicked(0);