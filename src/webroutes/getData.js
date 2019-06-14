//Requires
const xss = require("xss");
const prettyBytes = require('pretty-bytes');
const prettyMs = require('pretty-ms');
const { dir, log, logOk, logWarn, logError, cleanTerminal } = require('../extras/console');
const context = 'WebServer:getData';


/**
 * Getter for all the log/server/process data
 * @param {object} res
 * @param {object} req
 */
module.exports = async function action(res, req) {
    res.send({
        meta: await prepareMeta(),
        status: await prepareServerStatus(),
        players: await preparePlayers(),
        log: await sendLog()
    })
};


//==============================================================
async function prepareServerStatus(){
    let dataServer = globals.monitor.statusServer; //shorthand much!?

    let out = '<pre>';
    let statusClass = (dataServer.online)? 'text-success bold' : 'text-danger';
    let statusText = (dataServer.online)? 'Online' : 'Offline';
    let ping = (dataServer.online && typeof dataServer.ping !== 'undefined')? dataServer.ping+'ms' : '--';
    let players = (dataServer.online && typeof dataServer.players !== 'undefined')? dataServer.players.length : '--';
    out += `<b>Status:</b> <strong class="${statusClass}">${statusText}</strong>\n`;
    out += `<b>Ping (localhost):</b> ${ping}\n`;
    out += `<b>Players:</b> ${players}\n`;
    out += `<hr>`;

    let dataHost = await globals.monitor.getHostStatus();
    let children = (typeof dataHost.children !== 'undefined' && dataHost.children)? dataHost.children : '--';
    let hitches = (typeof dataHost.hitches !== 'undefined' && dataHost.hitches)? dataHost.children+'ms/min' : '--';
    let cpu = (typeof dataHost.cpu !== 'undefined' && dataHost.cpu)? dataHost.cpu+'%' : '--';
    let memory = (typeof dataHost.memory !== 'undefined' && dataHost.memory)? dataHost.memory+'%' : '--';

    out += `<b>Child Processes:</b> ${children}\n`;
    out += `<b>Hitches:</b> ${hitches}\n`;
    out += `<b>Host CPU:</b> ${cpu}\n`;
    out += `<b>Host Memory:</b> ${memory}\n`;

    return out;
}


//==============================================================
function preparePlayers(){
    let dataServer = globals.monitor.statusServer; //shorthand much!?
    let out = '<pre>';

    if(!dataServer.players.length) return '<pre>No players Online</pre>';

    out += `<b>Ping\tNick</b>\n`;
    dataServer.players.forEach(player => {
        out += ` ${player.ping}\t`;
        if(player.steam){
            out += `<a href="${player.steam}" target="_blank">${xss(player.name)}</a>\n`;
        }else{
            out += `${player.name}\n`;
        }
    });
    out += '</pre>';
    return out;
}


//==============================================================
async function sendLog(){
    let log = await globals.logger.get();
    return `<pre>${xss(log)}</pre>`;
}


//==============================================================
async function prepareMeta(){
    let dataServer = globals.monitor.statusServer; //shorthand much!?
    return {
        favicon: (dataServer.online)? 'favicon_on' : 'favicon_off',
        title: (dataServer.online)? `(${dataServer.players.length}) FXAdmin` : 'FXAdmin'
    };
}
