"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionDB = exports.formatAnsTransaction = exports.formatTransaction = exports.transactionFields = void 0;
const lodash_1 = require("lodash");
const utils_1 = require("../utils/utils");
const encoding_1 = require("../utils/encoding");
const order_1 = require("../utils/order");
exports.transactionFields = [
    'format',
    'id',
    'signature',
    'owner',
    'owner_address',
    'target',
    'reward',
    'last_tx',
    'height',
    'tags',
    'quantity',
    'content_type',
    'data_size',
    'data_root',
    'bundledIn',
];
function formatTransaction(transaction) {
    try {
        const indexFields = {};
        for (const index of order_1.indices) {
            const value = utils_1.Utils.tagValue(transaction.tags, index);
            if (value) {
                indexFields[index] = value;
            }
        }
        return (0, lodash_1.pick)(Object.assign(Object.assign(Object.assign({}, transaction), indexFields), { content_type: utils_1.Utils.tagValue(transaction.tags, 'content-type'), format: transaction.format || 0, data_size: transaction.data_size || (transaction.data ? (0, encoding_1.fromB64Url)(transaction.data).byteLength : undefined), tags: JSON.stringify(transaction.tags), owner_address: (0, encoding_1.sha256B64Url)((0, encoding_1.fromB64Url)(transaction.owner)), last_tx: transaction.last_tx || '' }), exports.transactionFields.concat(order_1.indices));
    }
    catch (error) {
        console.error({ error });
    }
}
exports.formatTransaction = formatTransaction;
function formatAnsTransaction(ansTransaction) {
    const indexFields = {};
    for (const index of order_1.indices) {
        const value = utils_1.Utils.tagValue(ansTransaction.tags, index);
        if (value) {
            indexFields[index] = value;
        }
    }
    return (0, lodash_1.pick)(Object.assign(Object.assign({}, indexFields), { id: ansTransaction.id, owner: ansTransaction.owner, content_type: 'ANS-102', target: ansTransaction.target, tags: JSON.stringify(ansTransaction.tags) }), exports.transactionFields.concat(order_1.indices));
}
exports.formatAnsTransaction = formatAnsTransaction;
class TransactionDB {
    constructor(connection) {
        this.connection = connection;
    }
    getById(txId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = (yield this.connection.queryBuilder().select('*').from('transactions').where('id', '=', txId).limit(1))[0];
            try {
                tx.tags = JSON.parse(tx.tags);
            }
            catch (e) { }
            return tx;
        });
    }
    getUnminedTxs() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.connection('transactions').where({ block: '' })).map(({ id }) => id);
        });
    }
    getUnminedTxsRaw() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connection('transactions').where({ block: '' });
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connection('transactions').where({ id }).del();
        });
    }
    mineTxs(block, unverifiedBundleTxs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connection('transactions')
                .whereNotIn('id', unverifiedBundleTxs)
                .andWhere({ block: '' })
                .update({ block });
        });
    }
}
exports.TransactionDB = TransactionDB;
//# sourceMappingURL=transaction.js.map