const MII_FILE_SIZE = 0x4A;
const MII_NAME_LENGTH = 10;
const ID_LENGTH = 0x4;
const UNEDIT1_SIZE = 2;
const UNEDIT2_SIZE = 0x14;
var editMii = {
	//0x0
	invalid:false,
    isGirl:false,
    month:0,
	day:0,
    favColor:0,
	isFavorite:false,
	//0x2
	name:'',
	//0x16
    height:0x40,
	//0x17
	weight:0x40,
	//0x18
    miiID:[0x86,0xb4,0x03,0xf0],
	//0x1C
    consoleID:[0xec,0xff,0x82,0xd2],
	//0x20
	unEdit1:[0x00,0x00],
	mingleOff:true,
	//0x22
　　unEdit2:[0x42,0x40,0x31,0xbd,0x28,0xa2,0x08,0x8c,0x08,0x40,0x14,0x49,0xb8,0x8d,0x00,0x8a,0x00,0x8a,0x25,0x04,0x00],
	//0x36
	creatorName:''
};

function getBoolean(int){
	if(int === 1)return true;
	return false;
}

function getInt(boolean){
	if(boolean === true)return 1;
	return 0;
}

function bufToUtf16String(buf){
	var tmpU16,i,string;
	string = '';
	for(i = 0;i < MII_NAME_LENGTH;i++){
		tmpU16 = buf[i * 2] * 256 + buf[i * 2 + 1];
		if(tmpU16 === 0)break;
		string += String.fromCharCode(tmpU16);
	}
	return string;
}

function miiFileRead(buf){
	editMii.invalid = getBoolean(buf[0] >>> 7);
	editMii.isGirl = getBoolean((buf[0] >>> 6) & 1);
	editMii.month = (buf[0] >>> 2) &　0xf;
	editMii.day = ((buf[0] & 3) << 3) + (buf[1] >>> 5);
	editMii.favColor = (buf[1] >>> 1) & 0xf;
	editMii.isFavorite = getBoolean(buf[1] & 1);
	var i;
	var stringBuf = Buffer.alloc(MII_NAME_LENGTH * 2);
	for(i = 0;i < MII_NAME_LENGTH;i++){
		stringBuf[i * 2] = buf[i * 2 + 0x2];
		stringBuf[i * 2 + 1] = buf[i * 2 + 0x2 + 1];
	}
	editMii.name = bufToUtf16String(stringBuf);
	editMii.height = buf[0x16];
	editMii.weight = buf[0x17];
	for(i = 0;i < ID_LENGTH;i++){
		editMii.miiID[i] = buf[0x18 + i];
		editMii.consoleID[i] = buf[0x1C + i];
	}
	editMii.unEdit1[0] = buf[0x20];
	editMii.mingleOff = getBoolean((buf[0x21] >>> 2) & 1);
	editMii.unEdit1[1] = buf[0x21] & 0xfb;
	for(i = 0;i < UNEDIT2_SIZE;i++){
        editMii.unEdit2[i] = buf[0x22 + i];
	}
	for(i = 0;i < MII_NAME_LENGTH;i++){
		stringBuf[i * 2] = buf[i * 2 + 0x36];
		stringBuf[i * 2 + 1] = buf[i * 2 + 0x36 + 1];
	}
	editMii.creatorName = bufToUtf16String(stringBuf);
}

function miiFileWrite(){
	var i;
	var buf = Buffer.alloc(MII_FILE_SIZE);
	buf[0] = (getInt(editMii.invalid) << 7) + (getInt(editMii.isGirl) << 6) + (editMii.day >>> 3) + (editMii.month << 2);
	buf[1] = ((editMii.day & 7) << 5) + (editMii.favColor << 1) + getInt(editMii.isFavorite);
	for(i = 0;i < MII_NAME_LENGTH;i++){
        if(editMii.name.length <= i){
			buf[2 + i * 2] = 0;
			buf[2 + i * 2 + 1] = 0;
		}else{
			buf[2 + i * 2] = Math.floor(editMii.name.charCodeAt(i) / 256);
			buf[2 + i * 2 + 1] = editMii.name.charCodeAt(i) % 256;
		}
		if(editMii.creatorName.length <= i){
			buf[0x36 + i * 2] = 0;
			buf[0x36 + i * 2 + 1] = 0;
		}else{
			buf[0x36 + i * 2] = Math.floor(editMii.creatorName.charCodeAt(i) / 256);
			buf[0x36 + i * 2 + 1] = editMii.creatorName.charCodeAt(i) % 256;
		}
	}
	buf[0x16] = editMii.height;
	buf[0x17] = editMii.weight;
	for(i = 0;i < ID_LENGTH;i++){
		buf[0x18 + i] = editMii.miiID[i];
		buf[0x1C + i] = editMii.consoleID[i];
	}
	buf[0x20] = editMii.unEdit1[0];
	buf[0x21] = editMii.unEdit1[1] + (getInt(editMii.mingleOff) << 2);
	for(i = 0;i < UNEDIT2_SIZE;i++){
        buf[0x22 + i] = editMii.unEdit2[i];
	}
	console.log(buf);
	return buf;
}