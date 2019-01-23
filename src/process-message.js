const fetch = require('node-fetch');
const dbConnection = require('./dbConnection')
// You can find your project ID in your Dialogflow agent settings
const projectId = 'greetings-e8c46'; //https://dialogflow.com/docs/agents#settings
const sessionId = '123456';
const languageCode = 'en-US';

const dialogflow = require('dialogflow');

const config = {
  credentials: {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
  }
};

const sessionClient = new dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

var data = {
  userID: 0,
  userQuery: '',
  queryResponse: ''
}
// Remember the Page Access Token you got from Facebook earlier?
// Don't forget to add it to your `variables.env` file.
const { FACEBOOK_ACCESS_TOKEN } = process.env;

var anxietyScore;
var stressScore;
var depressionScore;

var questionCounter = 0;
var questionArray = [];
var scoreQuestions = [];
console.log('In Process message');

function scoreCalculation()
{
  if(data.queryResponse.includes((("Question 1") || ("Question 6") || ("Question 8") || ("Question 11") || ("Question 12") || ("Question 14") || ("Question 18"))))
  {
    if(data.userQuery === 'Never')
      stressScore = stressScore + 0;
    else if(data.userQuery === 'Somtimes')
      stressScore = stressScore + 1;
    else if(data.userQuery === 'Often')
      stressScore = stressScore + 2;
    else
      stressScore = stressScore + 3;
  }
  else if(data.queryResponse.includes((("Question 2") || ("Question 3") || ("Question 7") || ("Question 9") || ("Question 15") || ("Question 19") || ("Question 20"))))
  {
    if(data.userQuery === 'Never')
      anxietyScore = anxietyScore + 0;
    else if(data.userQuery === 'Somtimes')
    anxietyScore = anxietyScore + 1;
    else if(data.userQuery === 'Often')
    anxietyScore = anxietyScore + 2;
    else
    anxietyScore = anxietyScore + 3;
  }
  else
  {
    if(data.userQuery === 'Never')
      depressionScore = depressionScore + 0;
    else if(data.userQuery === 'Somtimes')
    depressionScore = depressionScore + 1;
    else if(data.userQuery === 'Often')
    depressionScore = depressionScore + 2;
    else
    depressionScore = depressionScore + 3;
  }

  console.log('Stress Score-:'+stressScore+' Anxiety score-:'+anxietyScore+' Depression Score-:'+depressionScore)
}
const sendTextMessage = (userId, queryResult) => {
  var generate_response = {
    text: queryResult.fulfillmentText,
  }
  if (queryResult.action === "DASS21") {
    generate_response["quick_replies"] = [
      {
        "content_type": "text",
        "title": "Never",
        "payload": "Never"
      },
      {
        "content_type": "text",
        "title": "Sometimes",
        "payload": "Sometimes"
      },
      {
        "content_type": "text",
        "title": "Often",
        "payload": "Often"
      },
      {
        "content_type": "text",
        "title": "Always",
        "payload": "Always"
      }
    ]
  }
  else if (data.queryResponse.includes("Depression, Anxiety and Stress scale?")) {
    generate_response["quick_replies"] = [
      {
        "content_type": "text",
        "title": "Get Started",
        "payload": "Get Started"
      },
      {
        "content_type": "text",
        "title": "May be later",
        "payload": "May be later"
      },
    ]
  }
  else if (data.queryResponse.includes("21 questions")) {
    generate_response["quick_replies"] = [
      {
        "content_type": "text",
        "title": "Ok",
        "payload": "Ok"
      }
    ]
  }
  return fetch(
    `https://graph.facebook.com/v2.6/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        messaging_type: 'RESPONSE',
        recipient: {
          id: userId,
        },
        message: generate_response,
      }),
    }
  );
}

module.exports = (event) => {
  console.log('In process message in exported module')
  const userId = event.sender.id;
  const message = event.message.text;
  data.userID = userId;
  data.userQuery = message;
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode,
      },
    },
  };

  sessionClient
    .detectIntent(request)
    .then(responses => {
      const result = responses[0].queryResult;
      data.queryResponse = result.fulfillmentText;
      console.log('In dialogflow request');
      return sendTextMessage(userId, result);
    })
    .then(scoreCalculation())
    .then(dbConnection.executioner(data))
    .catch(err => {
      console.error('ERROR:', err);
    });
}