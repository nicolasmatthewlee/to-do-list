import './reset.css';
import './style.css';

import HOME_ICON from './assets/home.svg';
import CALENDAR_ICON from './assets/calendar.svg';
import ADD_ICON from './assets/add.svg';
import CLOCK_ICON from './assets/clock.svg';
import CIRCLE_ICON from './assets/circle.svg';
import CIRCLE_CHECKED_ICON from './assets/circle_checked.svg';
import MENU_ICON from './assets/menu.svg'
import FLAG_ICON from './assets/flag.svg'

class ListItem {
    constructor(name,datetime,flag) {
        this.name=name;
        this.datetime=datetime;
        this.flag=flag;
        this.checked=false;
    }
}

class List {
    constructor(name,id,icon=CALENDAR_ICON) {
        this.name=name;
        this.id=id;
        this.icon=icon;
        this.items=[];
    }

    add(item) {
        this.items.push(item);
    }
}

// Model View Controller

class Model {

    IDGenerator=-1;
    openedList=0;
    lists=[];

    constructor() {
        this.storage=false;
        if (this.storageAvailable('localStorage')) {
            this.storage=window['localStorage'];

            let listIDs=JSON.parse(this.storage.getItem('listIDs'));
            if (listIDs) {
                for (let ID of listIDs) {
                    // localStorage only saves data, so must create new List objects
                    // for List methods can be called on subsequent launches
                    let listData=JSON.parse(this.storage.getItem(String(ID)));
                    let list = new List(listData.name,listData.id,listData.icon);
                    list.items=listData.items;
                    this.lists.push(list);
                }
            }

            if (localStorage.getItem('IDGenerator')) {
                this.IDGenerator=localStorage.getItem('IDGenerator');
            }
        }

        // if no data, add default lists
        if (this.lists.length==0) {
            this.lists=[
                new List('Today',this.generateID(),CALENDAR_ICON),
                new List('Upcoming',this.generateID(),CLOCK_ICON)
            ];
            this.lists[0].add(new ListItem('pick up groceries','2022-11-29T12:11',true));
            this.lists[0].add(new ListItem('go to the store','2022-11-29T12:11',false));
            this.lists[1].add(new ListItem('study for exams','2022-11-29T12:11',false));
        }

        //this.storage.clear() // DELETE THIS
    }

    // local storage

    storageAvailable(type) {
        try {
            let storage = window[type];
            const x = 'test';
            storage.setItem(x,x);
            storage.removeItem(x);
            return true;
        }
        catch (e) {
            return e;
        }
    }

    updateStorage() {
        if (this.storage) {

            this.storage.setItem('IDGenerator',this.IDGenerator);

            let listIDs=[];
            for (let list of this.lists) {
                this.storage.setItem(list.id,JSON.stringify(list));
                listIDs.push(list.id);
            }
            this.storage.setItem('listIDs',JSON.stringify(listIDs));
        }
    }

    // listIDGenerator

    generateID() {
        this.IDGenerator++;
        return this.IDGenerator;
    }

    // set methods

    addProject(name) {
        const newList = new List(name,this.generateID());
        this.lists.push(newList);
        this.updateStorage();
        this.onAddProject(newList.id);
    }

    addItem(name,datetime,flag,listID) {
        for (let list of this.lists) {
            if (list.id==listID) {
                list.add(new ListItem(name,datetime,flag));
            }
        }
        this.updateStorage();
        this.onAddItem(listID);
    }

    toggleFlag(listID,itemIndex) {
        for (let list of this.lists) {
            if (list.id==listID) {
                list.items[itemIndex].flag=!list.items[itemIndex].flag;
            }
        }
        this.updateStorage();
        this.onAddItem(listID);
    }

    toggleCheckbox(listID,itemIndex) {
        for (let list of this.lists) {
            if (list.id==listID) {
                list.items[itemIndex].checked=!list.items[itemIndex].checked;
            }
        }
        this.updateStorage();
        this.onAddItem(listID);
    }

    deleteItem(listID,itemIndex) {
        for (let list of this.lists) {
            if (list.id==listID) {
                list.items.splice(itemIndex,1);
            }
        }
        this.updateStorage();
        this.onAddItem(listID)
    }

    // event binding
    
    bindAddProject(callback) {
        this.onAddProject = callback;
    }

    bindAddItem(callback) {
        this.onAddItem = callback;
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
        this.homeButton = this.createElement('img','header-home-button');
        this.homeButton.src = HOME_ICON;
        const headerSpacer = this.createElement('div','header-spacer');
        const addButton = this.createElement('img','header-add-button');
        addButton.addEventListener('click',this.displayAddItemModal.bind(this));
        addButton.src = ADD_ICON;
        header.append(this.homeButton,headerSpacer,addButton);

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

        // add-item modal
        this.addItemModal = this.createElement('div','add-item-modal');
        this.addItemModalNameInput = this.createElement('input','add-item-modal-name-input');
        this.addItemModalNameInput.setAttribute('placeholder','Add an Item');

        this.addItemModalDateInput = this.createElement('input','add-item-modal-date-input');
        this.addItemModalDateInput.setAttribute('type','datetime-local');

        const addItemModalFlagContainer = this.createElement('div','add-item-modal-flag-container');
        const addItemModalFlagLabel = this.createElement('div','add-item-modal-flag-label','Flag');
        this.addItemModalFlagInput = this.createElement('input','add-item-modal-flag-input');
        this.addItemModalFlagInput.setAttribute('type','checkbox');
        addItemModalFlagContainer.append(this.addItemModalFlagInput,addItemModalFlagLabel);

        const addItemModalOptionsContainer = this.createElement('div','add-item-modal-options-container');
        const addItemModalCancelButton = this.createElement('button','add-item-modal-cancel-button','Cancel');
        addItemModalCancelButton.addEventListener('click',this.hideModal.bind(this));
        this.addItemModalAddButton = this.createElement('button','add-item-modal-add-button','Add Item');
        addItemModalOptionsContainer.append(addItemModalCancelButton,this.addItemModalAddButton);

        const addItemModalFooter = this.createElement('div','add-item-modal-footer');

        this.addItemModal.append(this.addItemModalNameInput,this.addItemModalDateInput,addItemModalFlagContainer,addItemModalOptionsContainer,addItemModalFooter);
        this.app.appendChild(this.addItemModal);

        // item modal
        this.itemModal = this.createElement('div','item-modal');
        this.app.appendChild(this.itemModal);

        const itemModalOptionsContainer = this.createElement('div','item-modal-options-container');
        const itemModalCancelButton = this.createElement('button','item-modal-cancel-button');
        itemModalCancelButton.textContent='Cancel';
        itemModalCancelButton.addEventListener('click',this.hideModal.bind(this));
        this.deleteItemButton = this.createElement('button','item-modal-delete-button');
        this.deleteItemButton.textContent='Delete Item';
        itemModalOptionsContainer.append(itemModalCancelButton,this.deleteItemButton);
        this.itemModal.append(itemModalOptionsContainer);
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
        addProjectItem.addEventListener('click',this.displayAddProjectModal.bind(this));
        this.sidebar.appendChild(addProjectItem);
    }

    displayAddProjectModal() {
        this.overlay.classList.add('active');
        this.addProjectModal.classList.add('active');

        this.addProjectModalNameInput.focus();
    }

    displayAddItemModal() {
        this.overlay.classList.add('active');
        this.addItemModal.classList.add('active');

        this.addItemModalNameInput.focus();
    }

    displayItemModal(index) {
        this.overlay.classList.add('active');
        this.itemModal.classList.add('active');
        this.itemModal.setAttribute('data-index',index)
    }

    hideModal() {
        // used to reset and hide all modals
        this.overlay.classList.remove('active');

        this.addProjectModalNameInput.value='';
        this.addProjectModal.classList.remove('active');

        this.addItemModalNameInput.value='';
        this.addItemModalDateInput.value='';
        this.addItemModalFlagInput.checked=false;
        this.addItemModal.classList.remove('active');

        this.itemModal.classList.remove('active');
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

        // index
        let n=0;

        // display items
        items.forEach(item => {
            const listItem = this.createElement('div','list-item');

            const listItemIcon = this.createElement('img','list-item-icon');
            listItemIcon.setAttribute('data-index',n);
            item.checked? listItemIcon.src = CIRCLE_CHECKED_ICON : listItemIcon.src = CIRCLE_ICON ;

            const listItemLabel = this.createElement('div','list-item-label',item.name);
            const listItemSpacer = this.createElement('div','list-item-spacer');
            const listItemFlag = this.createElement('img','list-item-flag');
            listItemFlag.src = FLAG_ICON;
            listItemFlag.setAttribute('data-index',n);
            if (item.flag) {
                listItemFlag.classList.add('active');
            }
            const listItemMenu = this.createElement('img','list-item-menu');
            listItemMenu.src = MENU_ICON;
            let index=n; // necessary as parameters of a function are passed by reference
            listItemMenu.addEventListener('click',() => {this.displayItemModal(index)});
            const listItemDate = this.createElement('div','list-item-date',item.datetime);
            listItemLabel.appendChild(listItemDate);
            listItem.append(listItemIcon,listItemLabel,listItemSpacer,listItemFlag,listItemMenu);

            this.todoList.append(listItem);

            n++;
        })

        // add item
        const addListItem = this.createElement('button','add-list-item');
        addListItem.addEventListener('click',this.displayAddItemModal.bind(this));
        const addListItemIcon = this.createElement('img','add-list-item-icon');
        addListItemIcon.src = ADD_ICON;
        const addListItemLabel = this.createElement('div','add-list-item-label','Add Item');
        addListItem.append(addListItemIcon,addListItemLabel);
        this.todoList.appendChild(addListItem);
    }

    // event binding

    bindHomeButton(handler) {
        this.homeButton.addEventListener('click',handler);
    }

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

    bindAddItem(handler) {
        this.addItemModalAddButton.addEventListener('click', () => {
            handler(this.addItemModalNameInput.value,this.addItemModalDateInput.value,this.addItemModalFlagInput.checked);
            this.hideModal();
        })
    }

    bindDeleteItem(handler) {
        this.deleteItemButton.addEventListener('click',() => {
            handler(this.itemModal.dataset.index)
            this.hideModal();
        })
    }

    bindFlags(handler) {
        for (let flag of document.querySelectorAll('.list-item-flag')) {
            flag.addEventListener('click',() => handler(flag.dataset.index))
        }
    }

    bindCheckboxes(handler) {
        for (let checkbox of document.querySelectorAll('.list-item-icon')) {
            checkbox.addEventListener('click',() => handler(checkbox.dataset.index))
        }
    }
}

class Controller {
    constructor(model,view) {
        this.model=model;
        this.view=view;

        // generate default lists
        this.onListsChanged(0);

        // event binding
        this.view.bindHomeButton(this.handleHomeButtonClicked.bind(this));
        this.view.bindAddProject(this.handleAddProject.bind(this));
        this.view.bindAddItem(this.handleAddItem.bind(this));

        this.model.bindAddProject(this.onListsChanged.bind(this));
        this.model.bindAddItem(this.handleListClicked.bind(this));
        this.view.bindDeleteItem(this.handleDeleteItem.bind(this));
    }

    onListsChanged(newProjectID) {
        this.view.displaySidebar(this.model.getListNames(),this.model.getListIDs(),this.model.getListIcons());
        this.view.bindListReferences(this.handleListClicked.bind(this));
        this.handleListClicked(newProjectID);
    }

    // event handling
    handleHomeButtonClicked() {
        this.handleListClicked(0);
    }

    handleListClicked(id) {
        this.view.displayListTitle(this.model.getListTitle(id));
        this.view.displayList(this.model.getListItems(id));
        this.view.bindFlags(this.handleToggleFlag.bind(this));
        this.view.bindCheckboxes(this.handleToggleCheckbox.bind(this));
        this.model.openedList=id;
    }

    handleAddProject(name) {
        this.model.addProject(name);
    }

    handleAddItem(name,datetime,flag) {
        this.model.addItem(name,datetime,flag,this.model.openedList);
    }

    handleToggleFlag(itemIndex) {
        this.model.toggleFlag(this.model.openedList,itemIndex);
    }

    handleToggleCheckbox(itemIndex) {
        this.model.toggleCheckbox(this.model.openedList,itemIndex);
    }

    handleDeleteItem(itemIndex) {
        this.model.deleteItem(this.model.openedList,itemIndex);
    }

}

// create application
const app = new Controller(new Model(), new View());

// show first project
app.handleListClicked(0);