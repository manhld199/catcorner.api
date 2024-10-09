import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    article_name: { type: String, required: true },
    article_slug: { type: String, required: true },
    article_avt: { type: String, required: true },
    article_short_description: { type: String, required: true },
    article_author_name: { type: String },
    article_published_date: { type: Date },
    article_content: { type: String, required: true },
    article_references: [
      { title: { type: String, required: true }, link: { type: String, required: true } },
    ],
    article_tags: [{ type: String }],
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", articleSchema);
export default Article;
