// ==UserScript==
// @name        Gates of Survival - Lucky Spider
// @namespace   https://www.gatesofsurvival.com/
// @match       https://www.gatesofsurvival.com/game/index.php
// @author      dang
// @homepage    https://github.com/dang-nabbit/gos-lucky-spider/gos-lucky-spider.user.js
// @description Scrape data from all the users in the clan members page
// @version     1.0
// @icon        https://www.google.com/s2/favicons?domain=https://www.gatesofsurvival.com/
// @downloadURL https://github.com/dang-nabbit/gos-lucky-spider/raw/master/gos-lucky-spider.user.js
// @grant       none
// ==/UserScript==
var spiderLog = {
    logging: true,
    log: function(msg, fun) {
        if (spiderLog.logging === true) {
            var funPrefix = '';
            if (fun !== undefined) {
                funPrefix = fun + ' > ';
            }

            console.log('dang.gos-lucky-spider: ' + funPrefix + msg);
        }
    }
}
var log = spiderLog.log;

var defaultEyes = {
    skitterButton: {
        urlRegEx: /^view_members\.php/i,
        callback: addSpiderControlPanel,
        skitterBtnTextPrefix: [
            'Release',
            'Retrieve'
        ]
    },
    skitter: {
        urlRegEx: /^view_members\.php/i,
        callback: skitterNext,
        skittering: false,
        selector: '#page input[type="image"]',
        length: 0,
        index: 0,
        data: []
    },
    grabData: {
        urlRegEx: /^user3\.php/i,
        callback: grabData,
        grabbing: false
    }
};
var spiderEyes = spiderEyes || defaultEyes;

function initialize(keepData) {
    shutEyes();

    var skitter = JSON.parse(JSON.stringify(spiderEyes.skitter));
    spiderEyes = defaultEyes;

    if (keepData === true) {
        spiderEyes.skitter.length = skitter.length;
        spiderEyes.skitter.index = skitter.index;
        spiderEyes.skitter.data = skitter.data;
    }

    openEyes();
}

function shutEyes() {
    log('shutting eyes...', 'shutEyes');

    var eyes = Object.keys(spiderEyes);
    var eyesCount = eyes.length;

    for (var i = 0; i < eyesCount; i++) {
        var eyeI = eyes[i];
        var eye = spiderEyes[eyeI];

        if (eye.callback !== undefined) {
            $(document).unbind('ajaxSuccess', eye.beholder);
            log('spiderEyes.' + eyeI  + ' shut.', 'shutEyes');
        } else {
            log('spiderEyes.' + eyeI  + ' is not a beholder.', 'shutEyes');
        }
    }

    log('eyes wide shut.', 'shutEyes');
}

function openEyes() {
    log('opening eyes...', 'openEyes');

    var eyes = Object.keys(spiderEyes);
    var eyesCount = eyes.length;

    for (var i = 0; i < eyesCount; i++) {
        var eyeI = eyes[i];
        var eye = spiderEyes[eyeI];

        if (eye.callback !== undefined) {
            openEye(eyeI);
        } else {
            log('spiderEyes.' + eyeI  + ' is not a beholder.', 'openEyes');
        }
    }

    log('spider eyes are open.', 'openEyes');
}

function openEye(eyeName) {
    var eye = spiderEyes[eyeName];

    var beholder = function(event, xhr, settings) {
        var urlRegEx = eye.urlRegEx;
        var result = urlRegEx.exec(settings.url);
        if(result !== null) {
            log(eyeName + ' beheld ' + urlRegEx.toString() + ', calling ' + eye.callback.name + '.', 'openEye');

            // Wait 250 milliseconds before calling the function so that the page has hopefully had time to update.
            window.setTimeout(eye.callback, 250);
        }
    };

    $(document).ajaxSuccess(beholder);

    eye.beholder = beholder;

    log(eyeName + ' open.', 'openEye');
}

function addSpiderControlPanel() {
    var titleBoxes = document.querySelectorAll('#page .alert-backpack_box');

    if (titleBoxes.length !== 1) {
        log('title box not found, unable to add spider control panel.', 'addSpiderControlPanel');
        return;
    }

    var titleBox = titleBoxes[0];
    var regExClanMembers = /Clan Members/;
    var result = regExClanMembers.exec(titleBox.innerHTML);

    if (result === null) {
        log('"Clan Members" title not found, unable to add spider control panel.', 'addSpiderControlPanel');
        return;
    }

    log('clan member list page identified.', 'addSpiderControlPanel');

    var spiderDiv = $('<div id="lucky-spider-div">').insertBefore(titleBox);;

    appendSkitterButton(spiderDiv);
    appendSkitterTextArea(spiderDiv);
    appendCopyButton(spiderDiv);
    appendResetButton(spiderDiv);
}

function appendSkitterButton(spiderDiv) {
    var eye = spiderEyes.skitterButton;
    var btn = $('<span>');
    btn.attr('id', 'lucky-spider');
    btn.attr('class', 'btn2');
    updateSkitterBtnText(btn);
    btn.click(toggleSkitter);

    btn.appendTo(spiderDiv);
}

function appendSkitterTextArea(spiderDiv) {
    var skitter = spiderEyes.skitter;
    var textarea = $('<textarea>');
    textarea.attr('id', 'lucky-spider-data');
    textarea.css({
        width: '100%',
        'font-size': '0.7em',
        resize: 'vertical'
    });
    textarea.val(spitData());

    textarea.appendTo(spiderDiv);
}

function appendCopyButton(spiderDiv) {
    var btn = $('<span>');
    btn.attr('id', 'lucky-spider-data-copy');
    btn.attr('class', 'btn3');
    btn.click(copyData);
    btn.text('Copy data');
    btn.appendTo(spiderDiv);
}

function appendResetButton(spiderDiv) {
    var btn = $('<span>');
    btn.attr('id', 'lucky-spider-reset');
    btn.attr('class', 'btn5');
    btn.text('Reset spider');
    btn.click(resetSkitter);

    btn.appendTo(spiderDiv);
}

function updateSkitterBtnText(btn) {
    var skitter = spiderEyes.skitter;
    var skitterLength = skitter.length || document.querySelectorAll(skitter.selector).length;
    var prefix = spiderEyes.skitterButton.skitterBtnTextPrefix[(skitter.skittering ? 1 : 0)];

    btn.text(prefix + ' Lucky Spider (done: ' + skitter.index + '/' + skitterLength + ')');
}

function toggleSkitter() {
    var eye = spiderEyes.skitterButton;
    var skitter = spiderEyes.skitter;
    skitter.skittering = !skitter.skittering;
    updateSkitterBtnText($('#lucky-spider'));

    if (skitter.skittering === true) {
        log('skittering started', 'toggleSkitter');

        skitter.length = document.querySelectorAll(skitter.selector).length;
        skitter.index = 0;
        skitterNext();
    } else {
        log('skittering stopped. Spitting grabbed data.', 'toggleSkitter');
        spitData();
    }
}

function skitterNext() {
    var skitter = spiderEyes.skitter;
    spiderEyes.grabData.grabbing = false;

    if (skitter.index >= skitter.length) {
        toggleSkitter();
    }

    if (skitter.skittering === true) {
        log('skittering === true, opening user at index ' + skitter.index + '.', 'skitterNext');
        document.querySelectorAll(skitter.selector)[skitter.index].click();
    } else {
        log('skittering === false, the spider rests.', 'skitterNext');
    }
}

function grabData() {
    var skitter = spiderEyes.skitter;
    var grabData = spiderEyes.grabData;

    if (skitter.skittering === true) {
        if (grabData.grabbing === false) {
            log('skitter.skittering === true, grabbing data...', 'grabData');

            grabData.grabbing = true;
            skitter.data[skitter.index] = getData();

            skitter.index++;

            log('data grabbed, returning to clan members page.', 'grabData');
            document.querySelector('#return_to_clan_page').click();
        } else {
            log('grabbing === true, waiting to return to clan members page...', 'grabData');
        }
    } else {
        log('skittering === false, the spider rests.', 'grabData');
    }
}

function getData() {
    var name = document.querySelector('#page center b').innerHTML;

    var textNodes = $("#page > center table[width='80%'] tr").children('*').contents();
    var nodeCount = textNodes.length;
    var data = [name,,,];

    log(nodeCount + ' text nodes spotted.', 'getData');

    for (var i = 0; i < nodeCount; i++) {
        var node = textNodes[i];
        var $node = $(node);
        var text = $node.text().trim().replace(/,/g, '');

        if (node.nodeType === 3 && text !== '' && text !== '\n'){
            log('$node ' + i + ' content: ' + text, 'getData');

            var numberRegEx = /\s\d+\s(?!\/)/;
            var numberMatch = text.match(numberRegEx);
            if (numberMatch !== null){
                text = numberMatch[0];
            }

            data.push(text.replace(": ","").trim());
        }
    }

    $node = $("#page > center i");
    text = $node.first().text();
    if (text === 'Total Logins') {
        text = '';
    }
    data.push(text);
    log('$node ' + i + ' content: ' + text, 'getData');

    log(data, 'getData');

    return data;
}

function spitData() {
    var data = spiderEyes.skitter.data;
    console.log(data);

    var playerNumber = data.length;
    var output = '';
    for (var i = 0; i < playerNumber; i++) {
        output += data[i].join('\t') + '\n';
    }

    return output;
}

function copyData() {
    var copyTextarea = document.querySelector('#lucky-spider-data');
    copyTextarea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        log('Copying spider data was ' + msg + '.', 'copyData');
    } catch (err) {
        log('Unable to copy spider data', 'copyData');
    }
}

function resetSkitter() {
    if (window.confirm('Are you sure you want to reset the Lucky Spider data?')) {
        initialize();
        document.querySelector('#lucky-spider-div').remove();
        addSpiderControlPanel();
    }
}

initialize();
