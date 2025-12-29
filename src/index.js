// Copyright [2021] [Allow2 Pty Ltd]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict';

// Import UI component
import TabContent from './Components/TabContent';

// Import Battle.net modules
const BrowserService = require('./BrowserService');
const TokenValidator = require('./TokenValidator');
const ParentPortalClient = require('./ParentPortalClient');

/**
 * Battle.net Plugin Factory
 * @param {Object} context - Allow2Automate plugin context
 */
function plugin(context) {
    let state = null;
    let portalClient = null;
    let tokenValidator = null;

    const battle = {};

    /**
     * onLoad - Initialize plugin when Allow2Automate starts
     * @param {Object} loadState - Persisted state from previous session
     */
    battle.onLoad = function(loadState) {
        console.log('Battle.net plugin loading...', loadState);

        // Restore persisted state
        state = loadState || {
            token: null,
            children: {},
            pairings: {}, // childId -> { allow2ChildId, battlenetChildId, enabled }
            settings: {
                headless: true,
                timeout: 30000
            },
            lastSync: null
        };

        // Initialize services
        tokenValidator = new TokenValidator();
        portalClient = new ParentPortalClient({
            headless: state.settings.headless,
            timeout: state.settings.timeout
        });

        // Setup IPC handlers
        setupIPCHandlers(context, portalClient, tokenValidator, state);

        console.log('Battle.net plugin loaded');
    };

    /**
     * newState - Handle configuration updates
     * @param {Object} newState - Updated state from UI
     */
    battle.newState = function(newState) {
        console.log('Battle.net plugin state updated:', newState);
        state = newState;
    };

    /**
     * onSetEnabled - Start/stop monitoring when plugin enabled/disabled
     * @param {boolean} enabled - Plugin enabled state
     */
    battle.onSetEnabled = function(enabled) {
        console.log(`Battle.net plugin ${enabled ? 'enabled' : 'disabled'}`);

        if (enabled) {
            // Plugin enabled - ready for use
            context.statusUpdate({
                status: 'connected',
                message: 'Battle.net plugin active',
                timestamp: Date.now()
            });
        } else {
            // Plugin disabled - cleanup browser sessions
            if (portalClient) {
                portalClient.close().catch(err => {
                    console.error('Error closing portal client:', err);
                });
            }

            context.statusUpdate({
                status: 'configured',
                message: 'Battle.net plugin inactive',
                timestamp: Date.now()
            });
        }

        // Persist state
        context.configurationUpdate(state);
    };

    /**
     * onUnload - Cleanup when plugin is removed
     * @param {Function} callback - Completion callback
     */
    battle.onUnload = function(callback) {
        console.log('Battle.net plugin unloading...');

        // Close browser sessions
        if (portalClient) {
            portalClient.close()
                .then(() => {
                    console.log('Battle.net plugin unloaded');
                    callback(null);
                })
                .catch(err => {
                    console.error('Error during unload:', err);
                    callback(err);
                });
        } else {
            callback(null);
        }
    };

    /**
     * Setup IPC handlers for renderer communication
     */
    function setupIPCHandlers(context, portalClient, tokenValidator, state) {

        // Validate token
        context.ipcMain.handle('validateToken', async (event, { input }) => {
            try {
                const result = tokenValidator.validateInput(input);
                return [null, result];
            } catch (error) {
                return [error];
            }
        });

        // Authenticate with token
        context.ipcMain.handle('authenticate', async (event, { input, parentEmail }) => {
            try {
                const result = await portalClient.authenticate(input, parentEmail);

                // Save token to state
                state.token = result.token;
                state.lastSync = Date.now();
                context.configurationUpdate(state);

                return [null, result];
            } catch (error) {
                return [error];
            }
        });

        // Get children
        context.ipcMain.handle('getChildren', async (event, { parentEmail }) => {
            try {
                const children = await portalClient.getChildren(parentEmail);

                // Update state
                state.children = children.reduce((acc, child) => {
                    acc[child.id] = child;
                    return acc;
                }, {});
                context.configurationUpdate(state);

                return [null, { children }];
            } catch (error) {
                return [error];
            }
        });

        // Enable gaming
        context.ipcMain.handle('enableGaming', async (event, { childId }) => {
            try {
                const result = await portalClient.enableGaming(childId);
                return [null, result];
            } catch (error) {
                return [error];
            }
        });

        // Disable gaming
        context.ipcMain.handle('disableGaming', async (event, { childId }) => {
            try {
                const result = await portalClient.disableGaming(childId);
                return [null, result];
            } catch (error) {
                return [error];
            }
        });

        // Update schedule
        context.ipcMain.handle('updateSchedule', async (event, { childId, schedule }) => {
            try {
                const result = await portalClient.updateSchedule(childId, schedule);
                return [null, result];
            } catch (error) {
                return [error];
            }
        });

        // Save pairing
        context.ipcMain.handle('savePairing', async (event, { battlenetChildId, allow2ChildId }) => {
            try {
                state.pairings[battlenetChildId] = {
                    allow2ChildId,
                    battlenetChildId,
                    enabled: true,
                    createdAt: Date.now()
                };

                context.configurationUpdate(state);
                return [null, { success: true }];
            } catch (error) {
                return [error];
            }
        });

        // Remove pairing
        context.ipcMain.handle('removePairing', async (event, { battlenetChildId }) => {
            try {
                delete state.pairings[battlenetChildId];
                context.configurationUpdate(state);
                return [null, { success: true }];
            } catch (error) {
                return [error];
            }
        });

        // Get status
        context.ipcMain.handle('getStatus', async (event) => {
            try {
                return [null, {
                    authenticated: portalClient.isAuthenticated(),
                    children: state.children,
                    pairings: state.pairings,
                    lastSync: state.lastSync
                }];
            } catch (error) {
                return [error];
            }
        });
    }

    return battle;
}

module.exports = {
    plugin,
    TabContent
};