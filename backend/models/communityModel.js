const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    messages: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Message",
    }],
    tags: [{ 
        type: String 
    }],
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Community = mongoose.model("Community", CommunitySchema);
module.exports = Community;