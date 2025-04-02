import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true 
});

// Indexes for faster queries
sessionSchema.index({ student: 1, status: 1 });
sessionSchema.index({ mentor: 1, status: 1 });
sessionSchema.index({ scheduledAt: -1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
