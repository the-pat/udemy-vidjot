import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const IdeaSchema = new Schema({
    title: { type: String, required: true },
    details: { type: String, require: true },
    user: { type: Schema.Types.ObjectId, ref: 'Users', required: true }
}, { timestamps: true });
mongoose.model('Ideas', IdeaSchema);

export default mongoose.model('Ideas');