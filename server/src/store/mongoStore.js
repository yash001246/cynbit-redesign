import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';

const pathSchema = new mongoose.Schema(
  {
    shortId: { type: String, required: true, unique: true, index: true },
    answers: { type: mongoose.Schema.Types.Mixed, required: true },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
    lead: {
      type: new mongoose.Schema(
        { name: String, email: { type: String, index: true }, college: String, createdAt: Date },
        { _id: false },
      ),
      default: null,
    },
  },
  { timestamps: true },
);

const PathDoc = mongoose.models.Path ?? mongoose.model('Path', pathSchema);
const shape = (d) => d && ({
  id: d.shortId, answers: d.answers, result: d.result, lead: d.lead ?? null, createdAt: d.createdAt?.toISOString?.() ?? null,
});

export async function createMongoStore(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return {
    kind: 'mongo',
    async create({ answers, result }) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return shape(await PathDoc.create({ shortId: randomBytes(5).toString('hex'), answers, result }));
        } catch (err) {
          if (err?.code !== 11000) throw err; // retry only on id collision
        }
      }
      throw new Error('Could not allocate a unique path id');
    },
    async findById(id) { return shape(await PathDoc.findOne({ shortId: id }).lean({ virtuals: false }).then((d) => d && { ...d, createdAt: d.createdAt })); },
    async attachLead(id, lead) {
      const doc = await PathDoc.findOneAndUpdate({ shortId: id }, { lead: { ...lead, createdAt: new Date() } }, { new: true });
      return shape(doc);
    },
  };
}
