import './reset.css';
import './style.css';

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

        this.app.append(this.button,this.countLabel);
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
        this.button.addEventListener('click', () => {
            handler();
        })
    }
}

class Controller {
    constructor(model,view) {
        this.model=model;
        this.view=view;

        // event binding

        this.view.bindButton(this.handleAddCount);

        this.model.bindCountChanged(this.onCountChanged);
    }

    onCountChanged = (count) => {
        this.view.displayCount(count);
    }

    handleAddCount = () => {
        this.model.add();
    }
}

const app = new Controller(new Model(), new View());