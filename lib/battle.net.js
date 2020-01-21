import battledotnetengine from './battle.net-engine';
import { CompositeDisposable } from 'allow2automate';

export default {

    allow2BattleDotNetEngine: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.allow2BattleDotNetEngine = new battledotnetengine(state.yourNameWordCountViewState);
        // this.modalPanel = allow2automate.workspace.addModalPanel({
        //     item: this.allow2BattleDotNetEngine.getElement(),
        //     visible: false
        // });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(allow2automate.commands.add('allow2automate', {
            'your-name-word-count:toggle': () => this.toggle()
        }));
    },

    deactivate() {
        //this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.allow2BattleDotNetEngine.destroy();
    },

    serialize() {
        return {
            allow2BattleDotNetEngineState: this.allow2BattleDotNetEngineState.serialize()
        };
    },

    toggle() {
        console.log('allow2BattleDotNet was toggled!');
        return (
            this.modalPanel.isVisible() ?
                this.modalPanel.hide() :
                this.modalPanel.show()
        );
    }

};