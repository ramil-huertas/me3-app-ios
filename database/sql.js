import { openDatabase } from 'react-native-sqlite-storage';
let db = openDatabase({ name: 'UserDatabase.db' });
import { logger } from '@constants/Log';

let tablelist = [
    // block chain list
    `create table if not exists tb_chain(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"chain" TEXT,
	"name" TEXT,
	"symbol" TEXT,
	"series" TEXT,
	"chainId" INTEGER,
	"node" TEXT,
	"sort" INTEGER,
	"chain_icon" TEXT,
	"symbol_icon" TEXT,
	"tx_url" TEXT,
	"support_nft" INTEGER,
	"support_dapp" INTEGER,
	"pin_status" INTEGER,
	"is_delete" INTEGER,
	"coinType" INTEGER)`,
    // wallet list
    `create table if not exists tb_wallet(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"chain" TEXT,
	"name" TEXT,
	"address" TEXT,
	"password" TEXT,
	"seed" TEXT,
	"passwordTip" TEXT,
	"privateKey" TEXT,
	"number" INTEGER,
	"timestamp" INTEGER,
	"type" TEXT,
	"is_backup" INTEGER,
	"mainId" INTEGER)`,
    // wallet currently in use
    `create table if not exists tb_default(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"chain" TEXT,
	"name" TEXT,
	"address" TEXT,
	"password" TEXT,
	"seed" TEXT,
	"passwordTip" TEXT,
	"privateKey" TEXT,
	"number" INTEGER,
	"timestamp" INTEGER,
	"type" TEXT,
	"is_backup" INTEGER,
	"mainId" INTEGER,
	"wid" INTEGER)`,
    // btc witness and common address
    `CREATE TABLE IF NOT EXISTS tb_btcMapping(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"wid" INTEGER,
	"type" TEXT,
	"P2PKH" TEXT,
	"P2WPKH" TEXT)`,
    // tx hash list
    `CREATE TABLE IF NOT EXISTS tb_hash(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"chain" TEXT,
	"hash" TEXT)`,
    // address note list
    `CREATE TABLE IF NOT EXISTS tb_address(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"chain" TEXT,
	"address" TEXT,
	"name" TEXT,
	"memo" TEXT)`,
    //
    `CREATE TABLE IF NOT EXISTS tb_backUp(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"chain" TEXT,
	"seed" TEXT,
	"privateKey" TEXT,
	"status" INTEGER)`,
    // import token list
    `CREATE TABLE IF NOT EXISTS tb_token(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"chain" TEXT,
	"symbol" TEXT,
	"address" TEXT,
	"isMain" INTEGER,
	"symbol_icon" TEXT,
	"sort" INTEGER,
	"decimal" INTEGER)`,
    // import nft list
    `CREATE TABLE IF NOT EXISTS tb_nft(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"chain" TEXT,
	"contract_name" TEXT,
	"belong_contract" TEXT,
	"nft_url" TEXT,
	"nft_name" TEXT,
	"tokenId" TEXT,
	"tokenUri" TEXT,
	"sort" INTEGER,
	"tokenType" TEXT)`,
    //address book table
    `CREATE TABLE IF NOT EXISTS tb_addressbook(
		"id" INTEGER PRIMARY KEY AUTOINCREMENT,
		"userId" TEXT,
		"chain" TEXT,
		"name" TEXT,
		"wallet_address" TEXT,
		"created_at" TEXT,
		"updated_at" TEXT)`,
];

let deleteTablesData = [
    // block chain list
    `DELETE FROM tb_chain`,
    // wallet list
    `DELETE FROM tb_wallet`,
    // wallet currently in use
    `DELETE FROM tb_default`,
    // btc witness and common address
    `DELETE FROM tb_btcMapping`,
    // address note list
    `DELETE FROM tb_address`,
    //
    `DELETE FROM tb_backUp`,
    // import token list
    `DELETE FROM tb_token`,
    // delete addressbook table
    `DELETE FROM tb_addressbook`,
];

function createTables() {
    for (const item of tablelist) {
        executeQuery(item, []);
    }
}

//address book functions
async function getAllAddressBooks() {
    let result = await executeQuery('SELECT * FROM tb_addressbook', []);
    return result;
}

async function insertAddressIntoBook(Obj) {
    let sql = `INSERT INTO tb_addressbook ("userId","chain","name","wallet_address","created_at","updated_at") VALUES ("${Obj.uid}","${Obj.chain}",
	"${Obj.name}","${Obj.wallet_address}","${Obj.created_at}","${Obj.updated_at}")`;
    let result = executeQuery(sql, []);
    return result;
}
async function updateAddressInBook(Obj) {
    const query =
        `UPDATE tb_addressbook set chain="${Obj.chain}",name="${Obj.name}", wallet_address="${Obj.wallet_address}", updated_at="${Obj.updated_at}" where id=` +
        Obj.id;
    let result = await executeQuery(query);
    return result;
}

async function deleteAddressInBook(id) {
    const query = 'DELETE from tb_addressbook where id=' + id;
    let result = await executeQuery(query);
    return result;
}

// wallet table functions
function insertWallet(walletObj) {
    let sql = `INSERT INTO tb_wallet (
        "chain","name","address","password","seed","passwordTip",
        "privateKey","number","timestamp","type","mainId","is_backup") 
        VALUES (
        "${walletObj.chain}","${walletObj.name}","${walletObj.address}","${walletObj.password}","${walletObj.seed}","${walletObj.passwordTip}",
        "${walletObj.privateKey}",${walletObj.number},${walletObj.timestamp},"${walletObj.type}",
        ${walletObj.mainId},${walletObj.is_backup})`;
    let result = executeQuery(sql, []);
    return result;
}

async function getAllWallets() {
    let result = await executeQuery('SELECT * FROM tb_wallet', []);
    return result;
}

async function getAllWalletsWithchainDetail() {
    let result = await executeQuery(
        'SELECT DISTINCT TBW.*, TBC.*, TBW.name AS walletname FROM tb_wallet AS TBW INNER JOIN tb_chain AS TBC on UPPER(TBC.chain) == UPPER(TBW.chain) group by TBC.chain order by id asc',
        [],
    );
    return result;
}

async function getAllNotBackedUpWallets() {
    let result = await executeQuery(
        'SELECT * FROM tb_wallet where is_backup=0',
    );
    return result;
}
// get particular chain wallet
async function getWalletForChain(chain) {
    let query = `SELECT * FROM tb_wallet where UPPER(chain)=UPPER("` + chain + `")`;
    let result = await executeQuery(query);
    return result;
}
async function getWalletForChainWithCDetail(chain) {
    let query =
        `SELECT DISTINCT TBW.*, TBC.*, TBW.name as walletname FROM tb_wallet AS TBW INNER JOIN tb_chain as TBC on UPPER(TBC.chain) == UPPER(TBW.chain) where TBW.chain="` +
        chain +
        `" LIMIT 1`;
    let result = await executeQuery(query);
    return result;
}
async function updateBackupStatus(id) {
    const query = 'UPDATE tb_wallet set is_backup=1 where id=' + id;
    let result = await executeQuery(query);
    return result;
}
async function checkAddressExist(address, chain) {
    let query =
        `SELECT * FROM tb_wallet where address="` +
        address +
        `" and chain="` +
        chain +
        `"`;
    return await executeQuery(query);
}

async function getFirstWalletfromTable() {
    let query = `SELECT * FROM tb_wallet LIMIT 1`;
    return await executeQuery(query);
}
// chain table functions
function InsertChain(Obj) {
    let sql = `INSERT INTO tb_chain (
	"chain","name","symbol","series","chainId",
	"node","coinType","sort","symbol_icon","tx_url","chain_icon","support_nft","support_dapp","pin_status","is_delete") 
	VALUES (
	"${Obj.chain.trim()}","${Obj.name.trim()}","${Obj.symbol.trim()}","${Obj.series.trim()}",${Obj.chainId
        },
	"${Obj.node.trim()}",${Obj.coinType},${Obj.sort},"${Obj.symbol_icon
        }","${Obj.tx_url.trim()}","${Obj.chain_icon.trim()}",
	${Obj.support_nft},${Obj.support_dapp},${Obj.pin_status},${Obj.is_delete})`;
    let result = executeQuery(sql, []);
    return result;
}
async function getAllChains() {
    let result = await executeQuery('SELECT * FROM tb_chain', []);
    return result;
}

async function getSymbolForChain(chain) {
    const query =
        `SELECT symbol FROM tb_chain where UPPER(chain)=UPPER("` + chain + `")`;
    return await executeQuery(query);
}

async function getSeriesOfChain(chain) {
    const query =
        `SELECT series FROM tb_chain where UPPER(chain)=UPPER("` + chain + `")`;
    return await executeQuery(query);
}

async function getNameFromChainId(chainId) {
    const query = `SELECT * FROM tb_chain where chainId=` + chainId + ``;
    return await executeQuery(query);
}
async function getChainDetail(chain) {
    const query =
        `SELECT * FROM tb_chain where UPPER(chain)=UPPER("` + chain + `")`;
    return await executeQuery(query);
}
async function getIconFromSymbol(symbol) {
    const query =
        `SELECT chain_icon FROM tb_chain where UPPER(symbol)=UPPER("` +
        symbol +
        `")`;
    return await executeQuery(query);
}
async function deleteAllChains() {
    let query = 'DELETE FROM tb_chain';
    return await executeQuery(query);
}

async function getFirstWalletFromMainnetChainsForSwap(chainlist) {
    let query = `SELECT tbw.*, tbc.* from tb_wallet as tbw inner join tb_chain as tbc on UPPER(tbc.chain) = UPPER(tbw.chain) where UPPER(tbc.chain) in (` + chainlist + `) LIMIT 1`
    logger("query ", query)
    return await executeQuery(query);
}

async function getFirstWalletWhoseSeriesIsETH() {
    let query =
        `SELECT * FROM tb_wallet AS TBW INNER JOIN tb_chain as TBC on UPPER(TBC.chain) == UPPER(TBW.chain) where TBC.series="eth" LIMIT 1`;
    let result = await executeQuery(query);
    return result;
}
// mapping table functions

function insertMapping(Obj) {
    let sql = `INSERT INTO tb_btcMapping ("wid","type","P2PKH","P2WPKH") VALUES ("${Obj.wid}","${Obj.type}","${Obj.P2PKH}","${Obj.P2WPKH}")`;
    let result = executeQuery(sql, []);
    return result;
}
async function getBTCMapping(id) {
    let result = await executeQuery(
        `SELECT * FROM tb_btcMapping where wid=` + id,
        [],
    );
    return result;
}

function clearDatabase() {
    for (const item of deleteTablesData) {
        executeQuery(item, []);
    }
}
const executeQuery = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.transaction(trans => {
            trans.executeSql(
                sql,
                params,
                (trans, results) => {
                    resolve(results);
                },
                error => {
                    logger('Error');
                    reject(error);
                },
            );
        });
    });

export {
    executeQuery,
    createTables,
    insertWallet,
    clearDatabase,
    getAllWallets,
    deleteAllChains,
    InsertChain,
    getAllChains,
    getSymbolForChain,
    getAllNotBackedUpWallets,
    updateBackupStatus,
    getWalletForChain,
    getSeriesOfChain,
    getChainDetail,
    insertMapping,
    getBTCMapping,
    checkAddressExist,
    getNameFromChainId,
    getAllAddressBooks,
    insertAddressIntoBook,
    updateAddressInBook,
    deleteAddressInBook,
    getFirstWalletfromTable,
    getIconFromSymbol,
    getWalletForChainWithCDetail,
    getAllWalletsWithchainDetail,
    getFirstWalletFromMainnetChainsForSwap,
    getFirstWalletWhoseSeriesIsETH
};
