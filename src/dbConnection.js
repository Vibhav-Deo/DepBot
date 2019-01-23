var mongoose = require('mongoose');
 // define Schema
 var userconversation = mongoose.Schema({
    UserID: Number,
    userquery:String,
    queryresponse:String
});

// compile schema to model
var conversation_model = mongoose.model('Query', userconversation, 'conversation_data');
module.exports.executioner = function execute_everything(data)
{

    console.log('In db connection');
    // make a connection
    mongoose.connect( 'mongodb://chatbot:lilly1234@ds161074.mlab.com:61074/chatbot');
    
    // get reference to database
    var db = mongoose.connection;
    
    db.on('error', console.error.bind(console, 'connection error:'));
    
    db.once('open', function() {
        console.log("Connection Successful!");
        
       
    
        // a document instance
        var user1 = new conversation_model({ UserID: data.userID, userquery: data.userQuery, queryresponse: data.queryResponse });
        // save model to database
        user1.save(function (err, conversation_model) {
        if (err) return console.error(err);
        console.log(user1.UserID + " saved to user collection.");
        });
        
    });
};



