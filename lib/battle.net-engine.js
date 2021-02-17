export default class battledotnetengine {

    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('allow2-allow2automate-battle.net');

        // Create message element
        const message = document.createElement('div');
        message.textContent = 'The YourNameWordCount package is Alive! It\'s ALIVE!';
        message.classList.add('message');
        this.element.appendChild(message);
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }

}