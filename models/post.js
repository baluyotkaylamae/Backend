const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // User reference
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }, // Commenting user
            content: {
                type: String,
                required: true
            }, // Comment content
            createdAt: {
                type: Date,
                default: Date.now
            }, // Timestamp for the comment
            replies: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    }, // Replying user
                    content: {
                        type: String
                    }, // Reply content
                    createdAt: {
                        type: Date,
                        default: Date.now
                    } // Timestamp for the reply
                }
            ]
        }
    ], // Array of comments with replies
    createdAt: {
        type: Date,
        default: Date.now
    }, // Post creation timestamp
    updatedAt: {
        type: Date,
        default: Date.now
    }, // Post update timestamp
    likes: {
        type: Number,
        default: 0
    }, // Likes count
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], // Array to track users who liked the post
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    } // Status 
});

// Update the updatedAt field before saving the post
postSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

postSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

postSchema.set('toJSON', { virtuals: true });

exports.Post = mongoose.model('Post', postSchema);
