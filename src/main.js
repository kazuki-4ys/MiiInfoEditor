const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const fs = require('fs');
const MII_FILE_SIZE = 0x4A;
const MII_DATA_OFFSET = 0x3C;
const RKG_HEAD_SIZE = 4;
var isEdited = false;      //編集されたかどうか
var currentPath = null;    //現在のパス
var mainWindow = null;
var characterTable = null;
var cmdPath = null;

var mainMenu = Menu.buildFromTemplate([
    {
        label:'File',
        submenu:[
            {label:'Open',click:miiOpen},
            {label:'Save',click:save},
            {label:'Save As',click:saveAs},
            {label:'Import from RKG',click:ImportFromRKG},
            {label:'Exit',click:Exit}
        ]
    },
    {
        label: "Edit",
        submenu: [
            { role: 'cut'},
            { role: 'copy'},
            { role: 'paste'},
            { role: 'selectAll'}
        ]
    },
    {
        label:'Other',
        submenu:[
            {label:'mkwii special character table',click:OpenCharacterTable}
        ]
    }
]);

var characterTableMenu = Menu.buildFromTemplate([
{
    label: "Edit",
    submenu: [
        { role: 'copy'},
        { role: 'selectAll'}
    ]
}]);

function createWindow(){
    //mainWindowを作成(windowの大きさや、Kioskモードにするかどうかなどもここで定義できる)
     mainWindow = new BrowserWindow({width: 500, height: 500,minWidth:500,minHeight:500,webPreferences:{nodeIntegration:true}});
     if(process.platform === 'darwin'){
        Menu.setApplicationMenu(mainMenu);
     }else{
        mainWindow.setMenu(mainMenu);
     }
    // Electronに表示するhtmlを絶対パスで指定（相対パスだと動かない）
     mainWindow.loadURL('file://' + __dirname + '/index.html');
    // ChromiumのDevツールを開く
    //mainWindow.webContents.openDevTools();
    
    mainWindow.on('closed', function() {
    mainWindow = null;
    });
}

function OpenCharacterTable(){
    if(characterTable){
        characterTable.focus();
    }else{
        characterTable = new BrowserWindow({width: 500, height: 500,resizable:false});
        if(process.platform !== 'darwin'){
            characterTable.setMenu(characterTableMenu);
        }
        characterTable.loadURL('file://' + __dirname + '/characterTable.html');
        characterTable.on('closed', function() {
            characterTable = null;
        });
    }
}

//コマンドライン引数を取得
if(process.argv.length === 2){
    cmdPath = process.argv[1];
}

//Dockにファイルがドロップされたときの処置(MacOSのみ)
app.on('open-file',(event,path) => {
    cmdPath = path;
});

ipc.on('message',(event,arg) =>{
    if(arg === 'ready'){
        //コマンドラインから渡されたファイルを開く
        if(cmdPath){
            openFile(cmdPath);
        }
    }else if(arg === 'edit'){
        isEdited = true;
        mainWindow.webContents.send('change-title',makeTitle());
    }
});

app.on('ready',() => {
    createWindow();
});
// 全てのウィンドウが閉じたときの処理
app.on('window-all-closed', () => {
    // macOSのとき以外はアプリケーションを終了させます
    if (process.platform !== 'darwin') {
        app.quit();
    }else{
        isEdited = false;
        currentPath = null;
    }
});
// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on('activate', () => {
    // メインウィンドウが消えている場合は再度メインウィンドウを作成する
    if (mainWindow === null) {
        createWindow();
    }
});

function openFile(path){
    var buf = Buffer.alloc(MII_FILE_SIZE);
    var headBuf = Buffer.alloc(RKG_HEAD_SIZE);
    var stat = fs.statSync(path);
    var fd = fs.openSync(path,'r');
    if(!fd){
        dialog.showMessageBoxSync(mainWindow,{type:'error',message:'cannot open file',title:'Error'});
        return;
    }
    if(path.slice(-4) !== '.rkg'){
        if(stat.size !== MII_FILE_SIZE){
            dialog.showMessageBoxSync(mainWindow,{type:'error',message:'invalid file',title:'Error'});
            fs.closeSync(fd);
            return;
        }
        fs.readSync(fd,buf,0,MII_FILE_SIZE,0);
        currentPath = path;
    }else{
        if(stat.size < MII_FILE_SIZE + MII_DATA_OFFSET){
            dialog.showMessageBoxSync(mainWindow,{type:'error',message:'invalid file',title:'Error'});
            fs.closeSync(fd);
            return;
        }
        fs.readSync(fd,headBuf,0,RKG_HEAD_SIZE,0);
        if(headBuf[0] !== 0x52 || headBuf[1] !== 0x4b || headBuf[2] !== 0x47 || headBuf[3] !== 0x44){
            dialog.showMessageBoxSync(mainWindow,{type:'error',message:'invalid file',title:'Error'});
            fs.closeSync(fd);
            return;
        }
        fs.readSync(fd,buf,0,MII_FILE_SIZE,MII_DATA_OFFSET);
        currentPath = null;
    }
    fs.closeSync(fd);
    //読み込んだデータをレンダラープロセスに送信
    mainWindow.webContents.send('open',buf);
    isEdited = false;
    mainWindow.webContents.send('change-title',makeTitle());
}

function saveFile(path,buf){
    var fd = fs.openSync(path,'w');
        if(!fd){
            dialog.showMessageBoxSync(mainWindow,{type:'error',message:'cannot open file',title:'Error'});
            return false;
        }
    fs.writeSync(fd,buf,0,MII_FILE_SIZE,0);
    fs.closeSync(fd);
    return true;
}

function miiOpen(){
    if(isEdited){
        var answer = dialog.showMessageBoxSync(mainWindow,{type:'question',
        message:'changes are not saved.\nopen new file?',title:'',
        buttons:['Yes','No']});
        if(answer === 1){
            return;
        }
    }
    var buf = Buffer.alloc(MII_FILE_SIZE);
    var headBuf = Buffer.alloc(RKG_HEAD_SIZE);
    //開くファイルのタイプを定義
    var fileFilter = [{name:'mii data',extensions:['mae','MII','miigx']},
    {name:'all files',extensions:['*']}];
    //ファイルを開くダイアログの表示
    var tmpPath = dialog.showOpenDialogSync(mainWindow,{filters:fileFilter});
    if(!tmpPath)return;
    openFile(tmpPath[0]);
}

var saveTmp = {
    path:null,
    type:null,
}
var fileFilterMii = [{name:'mii data',extensions:['mae','MII','miigx']},
    {name:'all files',extensions:['*']}];
function saveAs(){
    var tmp = dialog.showSaveDialogSync(mainWindow,{filters:fileFilterMii});
    if(!tmp)return;
    saveTmp.path = tmp;
    saveTmp.type = 'saveAs';
    mainWindow.webContents.send('sendBuf',null);
}    
function save(){
    if(!currentPath){
        saveAs();
    }else{
    saveTmp.path = currentPath;
    saveTmp.type = 'save';
    mainWindow.webContents.send('sendBuf',null);
    }
}

function ImportFromRKG(){
    if(isEdited){
        var answer = dialog.showMessageBoxSync(mainWindow,{type:'question',
        message:'changes are not saved.\nopen new file?',title:'',
        buttons:['Yes','No']});
        if(answer === 1){
            return;
        }
    }
    //開くファイルのタイプを定義
    var fileFilter = [{name:'mkwii ghost data',extensions:['rkg']},
    {name:'all files',extensions:['*']}];
    //ファイルを開くダイアログの表示
    var tmpPath = dialog.showOpenDialogSync(mainWindow,{filters:fileFilter});
    if(!tmpPath)return;
    openFile(tmpPath[0]);
}

function OverWriteToRKG(){
    var fileFilterRKG = [{name:'mkwii ghost data',extensions:['rkg']}];
    var tmp = dialog.showOpenDialogSync(mainWindow,{filters:fileFilterRKG});
    if(!tmp)return;
    saveTmp.path = tmp[0];
    saveTmp.type = 'saveAs';
    mainWindow.webContents.send('sendBuf',null);
}

function Exit(){
    if(isEdited){
        var answer = dialog.showMessageBoxSync(mainWindow,{type:'question',
        message:'changes are not saved.\nwould you exit?',title:'',
        buttons:['Yes','No']});
        if(answer === 1){
            return;
        }
    }
    app.quit();
}

//タイトルに表示させる文字列の作成
function makeTitle(){
    var fn,i = 0,size,saveStat;
    if(currentPath){
        fn = currentPath.replace('\'','');
        fn = fn.replace('\"','');
        size = fn.length;
        while(fn[size - i - 1] !== '\\' && fn[size - i - 1] !== '\/'){
        i++;
        }
        fn = fn.slice(-1 * i);
    }else{
        fn = '';
    }
    if(isEdited){
        saveStat = ' (unsaved)';
    }else{
        saveStat = '';
    }
    return 'Mii Info Editor ' + fn + saveStat;
}

ipc.on('fileBuf-send',(event,arg) =>{
    if(saveFile(saveTmp.path,arg)){
        switch(saveTmp.type){
            case 'saveAs':
                currentPath = saveTmp.path;
            case 'save':
                isEdited = false;
                mainWindow.webContents.send('change-title',makeTitle());
            default:
        }
    }
});