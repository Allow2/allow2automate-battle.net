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

var React = require('react');
var createReactClass = require('create-react-class');

//const React, { Component } = require('react');
// import Avatar from 'material-ui/Avatar';
// import FlatButton from 'material-ui/FlatButton';
// import { sortedVisibleConfigurationsByPluginSelector } from '../selectors';
// import { allow2Request, allow2AvatarURL } from '../util';
// import Dialogs from 'dialogs';
// import Checkbox from './Checkbox';
// import path from 'path';
// import { remote, ipcRenderer as ipc } from 'electron';
// import {
//     Table,
//     TableBody,
//     TableHeader,
//     TableHeaderColumn,
//     TableRow,
//     TableRowColumn,
// } from 'material-ui/Table';
// import {Tabs, Tab} from 'material-ui/Tabs';

//var dialogs = Dialogs({});

exports = module.exports = createReactClass({

    // handleChange = (event) => {
    //     this.setState({
    //         pluginName: event.target.value
    //     });
    // };

    getInitialState: function() {
        return {
            device: null
        };
    },

    // messageDevices = {};

    // toggleCheckbox = (device, isChecked) => {
    //     this.props.onDeviceActive( device.device.UDN, true );
    //     ipc.send('setBinaryState', {
    //         UDN: device.device.UDN,
    //         state: isChecked ? 1 : 0
    //     });
    // };

    // componentDidMount = () => {
    //     ipc.on('setBinaryStateResponse', function (event, UDN, err, response) {
    //         let device = this.props.devices[UDN];
    //         this.props.onDeviceActive(UDN, false);
    //         if (err || ( response.BinaryState == undefined )) {
    //             return;
    //         }
    //         device.active = false;
    //         device.state = ( response.BinaryState != '0' );
    //         this.props.onDeviceUpdate({[UDN]: device});
    //     }.bind(this));
    // };


    render: function() {
        //let plugins = sortedVisibleConfigurationsByPluginSelector(this.props);
        return (
            React.createElement(div, {}, 'kudglidg;ie battle.net')
        );
    }
});






