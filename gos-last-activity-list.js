/*
    Gonna incorporate this code into the spider at some point.
    For now, copy paste into the console while in member list screen.
*/

var lastList = [];
var regExpLastAct = new RegExp('Last Activity: (.*)\\n');
var lastActString = '';

$('form').each(function(i, el){
    lastActString = regExpLastAct.exec(el.innerText)[1];
	lastList.push([
		$(el).find('input[type="submit"]').val(),
		new Date(lastActString.replace('@ ', ''))
	]);
});

lastList.sort(function(a, b) {
    return a[1] - b[1];
});

var lastListTextArea = $('textarea#last-active-list');
if (lastListTextArea.length === 0) {
    lastListTextArea = $('<textarea>');
    lastListTextArea.attr('id', 'last-active-list');
    lastListTextArea.attr('readonly', 'readonly');
    lastListTextArea.css({
        width: '100%',
        'font-size': '0.7em',
        resize: 'vertical'
    });
    lastListTextArea.insertBefore(document.querySelectorAll('#page .alert-backpack_box')[0]);
}

var textAreaContent = '';
lastList.forEach(function(item) {
    textAreaContent += item[0];
    textAreaContent += '\t';
    textAreaContent += item[1].toISOString();
    textAreaContent += '\n';
});
lastListTextArea.val(textAreaContent);
