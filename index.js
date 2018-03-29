const TelegramBot = require('node-telegram-bot-api');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const request = require('request');

const token = '576266413:AAEgn7HYQFIQBz98QgihBgSDDq1d_4koQvU';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];

  console.log(resp == 'кінь');

  if(resp == 'кінь') bot.sendMessage(chatId, 'У нас немає коня...');
  else bot.sendMessage(chatId, resp);
});

bot.on('photo', (img) => {
  const chatId = img.chat.id;
  console.log(chatId);
  var file_id = img.photo[3].file_id;
  
  var url = 'https://api.telegram.org/bot' + token + '/getFile?file_id=' + file_id;

  request(url, (error, response, body)=> {
    if (!error && response.statusCode === 200) {
      const response = JSON.parse(body)
      console.log("Got a response: ", response.result.file_path);

      var img_url = 'https://api.telegram.org/file/bot' + token + '/' + response.result.file_path;

      var filename = 'pic.jpg'
      
      var writeFile = fs.createWriteStream(filename)
 
      request(img_url).pipe(writeFile).on('close', function() {
        console.log(img_url, 'saved to', filename)
        Tesseract.recognize(filename, {
          lang: 'ukr'
        })
        .progress(function  (p) { console.log('progress', p)  })
        .catch(err => console.error(err))
        .then(function (result) {
          console.log(result.text)
          bot.sendMessage(chatId, ''+result.text);
          // process.exit(0)
        })
      });
    } else {
      console.log("Got an error: ", error, ", status code: ", response.ok)
    }
  })
});

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Дякую1');
// });