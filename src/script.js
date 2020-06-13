const ipc = require('electron').ipcRenderer;
var i;

function sendEdit(){
    ipc.send('message','edit');
}
//DOMの取得
var title = document.getElementsByTagName('title')[0];
var miiName = document.getElementById('miiName');
var creatorName = document.getElementById('creatorName');
var height = document.getElementById('height');
var weight = document.getElementById('weight');
var heightNum = document.getElementById('heightNum');
var weightNum = document.getElementById('weightNum');
var month = document.getElementById('month');
var day = document.getElementById('day');
var gender = document.getElementById('gender');
var mingles = document.getElementById('mingles');
var favorite = document.getElementById('favorite');
var specialMii =  document.getElementById('specialMii');
var miiId = [ID_LENGTH];
var consoleId = [ID_LENGTH];
var colorButton = [12];
for(i = 0;i < ID_LENGTH;i++){
    miiId[i] = document.getElementById('m' + i);
    consoleId[i] = document.getElementById('c' + i);
}

for(i = 0;i < 12;i++){
    colorButton[i] = document.getElementById('colorButton' + i);
}
//DOMにイベント追加

for(i = 0;i < ID_LENGTH;i++){
    miiId[i].addEventListener('change',(event) => {
        var id = Number(event.target.getAttribute('id').replace('m',''));
        var tmp = stoh(event.target.value);
        if(tmp < 0 || tmp > 255 || (tmp !== 0 && !tmp)){
            setUI();
            return;
        }
        editMii.miiID[id] = tmp;
        setUI();
        sendEdit();
    });
    consoleId[i].addEventListener('change',(event) => {
        var id = Number(event.target.getAttribute('id').replace('c',''));
        var tmp = stoh(event.target.value);
        if(tmp < 0 || tmp > 255 || (tmp !== 0 && !tmp)){
            setUI();
            return;
        }
        editMii.consoleID[id] = tmp;
        setUI();
        sendEdit();
    });
}

gender.addEventListener('click',(event) => {
    if(editMii.isGirl){
        editMii.isGirl = false;
    }else{
        editMii.isGirl = true;
    }
    setUI();
    sendEdit();
});

mingles.addEventListener('click',(event) => {
    if(editMii.mingleOff){
        editMii.mingleOff = false;
    }else{
        editMii.mingleOff = true;
    }
    setUI();
    sendEdit();
});

favorite.addEventListener('click',(event) => {
    if(editMii.isFavorite){
        editMii.isFavorite = false;
    }else{
        editMii.isFavorite = true;
    }
    setUI();
    sendEdit();
});

specialMii.addEventListener('click',(event) => {
    if(editMii.miiID[0] & 0x80){
        editMii.miiID[0] &= 0x7f;
    }else{
        editMii.miiID[0] |= 0x80;
    }
    setUI();
    sendEdit();
});

miiName.addEventListener('change',(event) => {
    editMii.name = miiName.value;
    setUI();
    sendEdit();
});

creatorName.addEventListener('change',(event) => {
    editMii.creatorName = creatorName.value;
    setUI();
    sendEdit();
});

height.addEventListener('change',(event) => {
    editMii.height = height.value;
    setUI();
    sendEdit();
});

heightNum.addEventListener('change',(event) => {
    var tmp = ston(heightNum.value);
    if(tmp < 0 || tmp > 127 || (tmp !== 0 && !tmp)){
        setUI();
        return;
    }
    editMii.height = tmp;
    setUI();
    sendEdit();
});

weight.addEventListener('change',(event) => {
    editMii.weight = weight.value;
    setUI();
    sendEdit();
});

weightNum.addEventListener('change',(event) => {
    var tmp = ston(weightNum.value);
    if(tmp < 0 || tmp > 127 || (tmp !== 0 && !tmp)){
        setUI();
        return;
    }
    editMii.weight = tmp;
    setUI();
    sendEdit();
});

for(i = 0;i < 12;i++){
    colorButton[i].addEventListener('click',(event) => {
        editMii.favColor = Number(event.target.getAttribute('id').replace('colorButton',''));
        setUI();
        sendEdit();
    });
}
month.addEventListener('change',(event) => {
    var tmp = ston(month.value);
    if(tmp < 0 || tmp > 12 || (tmp !== 0 && !tmp)){
        setUI();
        return;
    }
    editMii.month = tmp;
    setUI();
    sendEdit();
});

day.addEventListener('change',(event) => {
    var tmp = ston(day.value);
    if(tmp < 0 || tmp > 31 || (tmp !== 0 && !tmp)){
        setUI();
        return;
    }
    editMii.day = tmp;
    setUI();
    sendEdit();
});
//空白削除
function deleteSpace(string){
    return string.replace(/\s+/g, "");
}
//文字列を10進数に変換
function ston(a){
    var string = deleteSpace(a);
    var i,dec,num = 0;
    for(i = 0;i < string.length;i++){
        dec = getDec(string.charAt(i));
        if(dec === -1)return null;
        num = num * 10 + dec;
    }
    return num;
}

function getDec(char){
    switch(char){
        case '0':
        case '０':
            return 0;
        case '1':
        case '１':
            return 1;
        case '2':
        case '２':
            return 2;
        case '3':
        case '３':
            return 3;
        case '4':
        case '４':
            return 4;
        case '5':
        case '５':
            return 5;
        case '6':
        case '６':
            return 6;
        case '7':
        case '７':
            return 7;
        case '8':
        case '８':
            return 8;
        case '9':
        case '９':
            return 9;
        default:
            return -1;
    }
}
//文字列を16進数に変換
function stoh(a){
    var string = deleteSpace(a);
    var i,hex,num = 0;
    for(i = 0;i < string.length;i++){
        hex = getHex(string.charAt(i));
        if(hex === -1)return null;
        num = num * 16 + hex;
    }
    return num;
}
function getHex(char){
    switch(char){
        case '0':
        case '０':
            return 0;
        case '1':
        case '１':
            return 1;
        case '2':
        case '２':
            return 2;
        case '3':
        case '３':
            return 3;
        case '4':
        case '４':
            return 4;
        case '5':
        case '５':
            return 5;
        case '6':
        case '６':
            return 6;
        case '7':
        case '７':
            return 7;
        case '8':
        case '８':
            return 8;
        case '9':
        case '９':
            return 9;
        case 'a':
        case 'A':
        case 'ａ':
        case 'Ａ':
            return 10;
        case 'b':
        case 'B':
        case 'ｂ':
        case 'Ｂ':
            return 11;
        case 'c':
        case 'C':
        case 'ｃ':
        case 'Ｃ':
            return 12;
        case 'd':
        case 'D':
        case 'ｄ':
        case 'Ｄ':
            return 13;
        case 'e':
        case 'E':
        case 'ｅ':
        case 'Ｅ':
            return 14;
        case 'f':
        case 'F':
        case 'ｆ':
        case 'Ｆ':
            return 15;
        default:
            return -1;
    }
}

function getString(int){
    var str = int.toString(16);
    if(str.length < 2)str = '0' + str;
    return str;
}

function setUI(){
    miiName.value = editMii.name;
    creatorName.value = editMii.creatorName;
    for(i = 0;i < ID_LENGTH;i++){
        miiId[i].value = getString(editMii.miiID[i]);
        consoleId[i].value = getString(editMii.consoleID[i]);
    }
    height.value = editMii.height;
    heightNum.value = editMii.height;
    weight.value = editMii.weight;
    weightNum.value = editMii.weight;
    if(editMii.month !== 0){
        month.value = editMii.month;
    }else{
        month.value = '';
    }
    if(editMii.day !== 0){
        day.value = editMii.day;
    }else{
        day.value = '';
    }
    if(editMii.isGirl){
        gender.innerHTML = 'Female';
    }else{
        gender.innerHTML = 'Male';
    }
    if(editMii.mingleOff){
        mingles.innerHTML = 'No';
    }else{
        mingles.innerHTML = 'Yes';
    }
    if(editMii.isFavorite){
        favorite.innerHTML = '<img src=\"img/favorite.png\">';
    }else{
        favorite.innerHTML = '<img src=\"img/none.png\">';
    }
    if(editMii.miiID[0] & 0x80){
        specialMii.checked = false;
    }else{
        specialMii.checked = true;
    }
    for(i = 0;i < 12;i++){
        if(i === editMii.favColor){
            colorButton[i].setAttribute('class','selectColor');
        }else{
            colorButton[i].setAttribute('class','notSelectColor');
        }
    }
};

setUI();

ipc.on('open',(event,arg) => {
    console.log(arg);
    miiFileRead(arg);
    console.log(editMii);
    setUI();
});

ipc.on('sendBuf',(event,arg) => {
    ipc.send('fileBuf-send',miiFileWrite());
});

ipc.on('change-title',(event,arg) => {
    title.innerHTML = arg;
});

//レンダラープロセスの準備ができたら、メインプロセスにそれを通知
ipc.send('message','ready');