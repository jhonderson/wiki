
/*
Actual budget accounts and categories. Change this to use your account names and category names.
*/
const ACCOUNT_CHECKING = '💲Checking';
const ACCOUNT_SAVINGS = '💰Savings';
const ACCOUNT_CC_VISA = '💳✈️ Visa';

const CATEGORY_DINNING_OUT = '🍽 Dinning Out';
const CATEGORY_GROCERIES = '🛒 Groceries';
const CATEGORY_SHOPPING = '🛍 Shopping';
const CATEGORY_PUBLIC_TRANSPORTATION = '🚍 Public Transportation';
const CATEGORY_UBER = '🚕 Uber';
const CATEGORY_RENT = '🏡 Rent';
const CATEGORY_PHONE = '📱Phone';
const CATEGORY_INTERNET = '💻 Internet';
const CATEGORY_ELECTRICITY = '⚡️Electricity';

/*
Populate these values only if you want the system to infer categories based on payee name, otherwise let it empty:
const CATEGORIES_KEYWORDS_BY_CATEGORY = {};
*/
const CATEGORIES_KEYWORDS_BY_CATEGORY = {
  [CATEGORY_RENT]: ['rent properties'],
  [CATEGORY_ELECTRICITY]: ['bc hydro'],
  [CATEGORY_INTERNET]: ['shaw cablesystems'],
  [CATEGORY_PHONE]: ['freedom', 'mobile'],
  [CATEGORY_PUBLIC_TRANSPORTATION]: ['compass', 'shell'],
  [CATEGORY_UBER]: ['uber', 'taxi'],
  [CATEGORY_SHOPPING]: ['amazon', 'apple', 'heart of the matter', 'autonomous', 'miniso', 'air can', 'travel and leisure', 'remitly', 'icbc', 'cannabis', 'value village', 'thrift store', 'home depot', 'old navy', 'dollarama', 'miniso', 'vancouver water adventures', 'halloween', 'city of vancouver', 'staples'],
  [CATEGORY_GROCERIES]: ['shoppers', 'london', 'drug', 'skyline', 'sunshine market', 'urban fare', 'save on foods', 'tierra latina', 'mac convenience', 'thomas haas chocolates', '7-eleven', 'walmart', 'granville food market', 'h mart', 'h-mart'],
  [CATEGORY_DINNING_OUT]: ['uber eats', 'bc place', 'bbq chicken', 'freshslice', 'japadog', 'thai', 'pelicana', 'chicken', 'trees', 'masa', 'boston pizza', 'blenz', 'kelly carlos', 'rayhan', 'a&w', 'maple leaf', 'pizza', 'fresh', 'sushivan', 'starbucks', 'la place', 'silvestre gusto latino', 'cactus club cafe', 'uno beef noddles', 'artigiano', 'red robin', 'gong cha', 'macdonald', 'panago', 'redbeef noodle', 'fatburger', 'koya japan', 'gram cafe', 'pacakes', 'brownie bakers', 'denny', 'food daddy', 'legendary noodle', 'mac truck', 'the mexican', 'shawarma', 'cold tea', 'waves', 'chronic tacos', 'jollibee', 'white spot', 'passion 8 dessert', 'rasoi bar', 'falafel', 'uncle getsu', 'latin square', 'legendary noodle', 'cultured coffee', 'chatime', 'jugo juice', 'flaming wok', 'bc taco', 'twin sails', 'tacos', 'brewing', 'caffe', 'cafe', 'coffee', 'restaurant', 'liquor store', 'ice cream', 'de dutch', 'concessions', 'kitchen'],
};

/*
Populate these values only if you want the system to infer categories based on the account, otherwise let it empty:
const DEFAULT_CATEGORIES_BY_ACCOUNT = {};
*/
const DEFAULT_CATEGORIES_BY_ACCOUNT = {
  [ACCOUNT_CC_VISA]: CATEGORY_DINNING_OUT,
  [ACCOUNT_CHECKING]: CATEGORY_GROCERIES,
};

/*
Actual api config parameters
*/
const ACTUAL_API_KEY='{your-actual-api-key}';
const ACTUAL_API_ENDPOINT='https://{your-actualapi-endpoint}/v1';
const ACTUAL_BUDGET_SYNC_ID = '{your-actual-sync-id}';

/*
Account ids can be found running this in the terminal:
curl -X 'GET' \
'https://{your-actualapi-endpoint}:443/v1/budgets/{your-budget-sync-id}/accounts' \
-H 'accept: application/json' \
-H 'x-api-key: {your-api-key}'

This could be more dynamic: the code may pull the configuration from actual api and find the account ids dynamically. Feel free to contribute this part.
*/
const ACTUAL_ACCOUNTS = {
  [ACCOUNT_CHECKING]: {
    'id': 'ac65ade0-2926-4689-9cc4-b0bc19fc8126',
  },
  [ACCOUNT_SAVINGS]: {
    'id': '0cb1c2a1-1f95-4498-b629-0c3abb099592',
  },
  [ACCOUNT_CC_VISA]: {
    'id': '638aa3b7-8f28-49ed-a45a-f732aba3ca2d',
  },
};

/*
Category ids can be found running this in the terminal:
curl -X 'GET' \
'https://{your-actualapi-endpoint}:443/v1/budgets/{your-budget-sync-id}/categories' \
-H 'accept: application/json' \
-H 'x-api-key: {your-api-key}'

This could be more dynamic: the code may pull the configuration from actual api and find the category ids dynamically. Feel free to contribute this part.
*/
const ACTUAL_CATEGORIES = {
  [CATEGORY_DINNING_OUT]: '541836f1-e756-4473-a5d0-6c1d3f06c7fa',
  [CATEGORY_GROCERIES]: 'af375fd4-d759-46b3-bffe-74a856151d57',
  [CATEGORY_SHOPPING]: 'd4b0f075-3343-4408-91ed-fae94f74e5bf',
  [CATEGORY_PUBLIC_TRANSPORTATION]: '29ec2c58-8cd3-42fe-9187-7b5dfe0f70a6',
  [CATEGORY_UBER]: 'e3ac33a4-56c8-43ff-9ab4-4b45bf4e09a9',
  [CATEGORY_RENT]: '8550afee-8093-4372-af7a-a8914094b7cd',
  [CATEGORY_PHONE]: '7087698b-1062-4300-bf06-0aa5da14b517',
  [CATEGORY_INTERNET]: 'ee195e0e-50fd-4d27-84a1-4c21a611b194',
  [CATEGORY_ELECTRICITY]: 'ec842c25-3e20-40f5-b4bd-5d6b9e880c5c',
};

/*
You shouldn't need to change the code after this point 🤞
*/

function doGet(e) {
  const action = e.parameter.action;
  const api = Api(AppleWalletImporter(ActualApi()));
  if (action in api) {
    return api[action](e);
  }
  return jsonResponse_({'error': 'Unsupported action'});
}

function Api(appleWalletImporter) {
  return {
    postAppleWalletTransaction: function(e) {
      const appleWalletTransaction = {
        payee: e.parameter.payee || '',
        account: e.parameter.account || '',
        amount: e.parameter.amount
      };
      return jsonResponse_(appleWalletImporter.importAppleWalletTransaction(appleWalletTransaction));
    }
  };
}

function AppleWalletImporter(actualApi) {
  function inferInternalAccountFromAccount(account) {
    if (account.includes('checkin')) {
      return ACCOUNT_CHECKING;
    } else if (account.includes('savings')) {
      return ACCOUNT_SAVINGS;
    } else if (account.includes('visa')) {
      return ACCOUNT_CC_VISA;
    }
    return undefined;
  }

  function inferCategoryFromPayee(internalAccount, payee) {
    for (const [category, keywords] of Object.entries(CATEGORIES_KEYWORDS_BY_CATEGORY)) {
      for (const keyword of keywords) {
        if (payee.includes(keyword)) {
          return category;
        }
      }
    }
    if (internalAccount in DEFAULT_CATEGORIES_BY_ACCOUNT) {
      return DEFAULT_CATEGORIES_BY_ACCOUNT[internalAccount];
    }
    return null;
  }

  return {
    importAppleWalletTransaction: function({payee, account, amount: amountAsString}) {
      const amount = Number(amountAsString);

      let internalAccount = inferInternalAccountFromAccount(account.toLowerCase());
      if (internalAccount === undefined) {
        return {
          'error': 'Account not found'
        };
      }
      if (amount == 0) {
        return {
          'error': 'Amount must be different than 0'
        };
      }
      if (payee == null || payee == '') {
        return {
          'error': 'Payee information is required'
        };
      }

      const category = inferCategoryFromPayee(internalAccount, payee.toLowerCase());

      const transaction = {
        date: currentLocalDate_(),
        amount,
        category,
        account: internalAccount,
        name: payee,
        pending: true
      };

      actualApi.addTransactions([transaction]);

      return {
        'data': transaction
      };
    }
  }
}

function ActualApi() {
  function addTransactions_(transactions) {
    if (transactions.length === 0) {
      return;
    }
    const transactionsByAccount = {};
    transactions.forEach(transaction => {
      const accountId = ACTUAL_ACCOUNTS[transaction.account].id;
      transactionsByAccount[accountId] = transactionsByAccount[accountId] || [];
      transactionsByAccount[accountId].push({
        "account": ACTUAL_ACCOUNTS[transaction.account].id,
        "date": formatDateToISOString_(transaction.date),
        "amount": convertTransactionAmountToActualFormat_(transaction.amount),
        "payee": null,
        "payee_name": transaction.name,
        "category": ACTUAL_CATEGORIES[transaction.category] || null,
        "cleared": !transaction.pending
      });
    });
    for (const [accountId, accountTransactions] of Object.entries(transactionsByAccount)) {
      addTransactionsHttpCall_(accountId, accountTransactions);
    }
  }

  function addTransactionsHttpCall_(accountId, transactions) {
    const requestInput = {
      "transactions": transactions
    };

    const options = {
      "method" : "POST",
      "contentType" : "application/json",
      "payload" : JSON.stringify(requestInput),
      "headers" : {
        "Accept": 'application/json',
        "Content-Type": 'application/json',
        "Connection": 'keep-alive',
        "x-api-key": ACTUAL_API_KEY
      }
    };

    const response = UrlFetchApp.fetch(`${ACTUAL_API_ENDPOINT}/budgets/${ACTUAL_BUDGET_SYNC_ID}/accounts/${accountId}/transactions/import`, options);
    return JSON.parse(response.getContentText());
  }

  function convertTransactionAmountToActualFormat_(amount) {
    return +((amount).toFixed(2) * -100).toFixed(2);
  }

  return {
    addTransactions: function (transactions) {
      try {
        addTransactions_(transactions);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

function currentLocalDate_() {
  return new Date(new Date().toLocaleString( 'us', { timeZoneName: 'short' } ).split(' ')[0]);
}

function formatDateToISOString_(date) {
  return date.toISOString().split('T')[0];
}

function jsonResponse_(content) {
  return ContentService.createTextOutput(JSON.stringify(content)).setMimeType(ContentService.MimeType.JSON);
}
