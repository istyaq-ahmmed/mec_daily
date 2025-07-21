import { nanoid } from "nanoid"

// models
import Blog from "../../../models/Blog.js"
import Image from "../../../models/image.js"
import User from "../../../models/User.js"
import Notification from "../../../models/Notification.js"
import Comment from "../../../models/Comment.js"
import natural from 'natural'
// configs
// import { s3 } from "../../../configs/index.js"
const tokenizer = new natural.WordTokenizer();

/**
 * generating a api url for uploading images to aws s3 bucket
 *
 */
const generateUploadUrl = async () => {
	const date = new Date()
	const imageName = `${nanoid()}-${date.getTime()}.jpeg`
	const i=new Image({
		name:imageName
	})
	await i.save()
	return '/api/v1/image/upload-image/'+imageName
}

export const getUploadUrl = async (req, res) => {
	generateUploadUrl()
		.then((url) =>
			res.status(200).json({
				status: 6000,
				uploadUrl: url,
			})
		)
		.catch((error) =>
			res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		)
}

export const createBlog = async (req, res) => {
	/**
	 * id => blogId from the frontend
	 */

	let { title, content, des, tags, banner, draft, id, authorId,originalArticleURL,ratings,ner,word_vector, frequency_vector} = req?.body
	if( originalArticleURL==null) originalArticleURL=''
	if (!title) {
		return res.status(403).json({
			status: 6001,
			message: "You must provide a title to publish the blog",
		})
	}

	if (!draft) {
		if (!des || des.length > 200) {
			return res.status(403).json({
				status: 6001,
				message:
					"You must provide blog description under 200 characters",
			})
		}

		if (!banner) {
			return res.status(403).json({
				status: 6001,
				message: "You must provide a banner to publish it",
			})
		}

		if (!content.blocks.length) {
			return res.status(403).json({
				status: 6001,
				message: "There must be some blog content to publish it",
			})
		}

		if (!tags || tags.length > 10) {
			return res.status(403).json({
				status: 6001,
				message:
					"Provide tags in order to publish the blog, Maximum 10",
			})
		}
	}

	tags = tags && tags.map((tag) => tag.toLowerCase())

	// slugify the title + unique id
	const blog_id =
		id ||
		title
			.replace(/[^a-zA-Z0-9]/g, " ")
			.replace(/\s+/g, "-")
			.trim() + nanoid()

	if (id) {
		Blog.findOneAndUpdate(
			{ blog_id },
			{ title, des, banner, content, tags, draft: draft ? draft : false }
		)
			.then(() => {
				res.status(200).json({
					status: 6000,
					message: "Successfully updated",
					blogId: blog_id,
				})
			})
			.catch((error) => {
				res.status(500).json({
					status: 6001,
					message: error?.message,
				})
			})
	} else {
		const blog = new Blog({
			title,
			originalArticleURL,
			des,
			content,
			tags,
			banner,
			author: authorId,
			blog_id,
			draft: Boolean(draft), // the boolean() will helps set correct value
			ratings,ner,word_vector, frequency_vector
		})

		blog.save()
			.then((blog) => {
				let incrementVal = draft ? 0 : 1

				/**
				 * update the User model to
				 * increment the total_posts count and
				 * push the new blog post int user blogs
				 */
				User.findOneAndUpdate(
					{ _id: authorId },
					{
						$inc: { "account_info.total_posts": incrementVal },
						$push: { blogs: blog._id },
					}
				)
					.then((user) => {
						res.status(200).json({
							status: 6000,
							message: "Successfully created",
							blogId: blog.blog_id,
						})
					})
					.catch((error) => {
						res.status(500).json({
							status: 6001,
							message: "Failed to update the total post count",
						})
					})
			})
			.catch((error) => {
				return res.status(500).json({
					status: 6001,
					message: error?.message,
				})
			})
	}
}

export const latestBlogs = async (req, res) => {
	const { page } = req.body

	const maxLimit = 5

	Blog.find({ draft: false })
		.populate(
			"author",
			"personal_info.profile_img personal_info.username personal_info.fullName -_id"
		)
		.sort({ publishedAt: -1 })
		.select("blog_id title des banner activity tags publishedAt -_id")
		.skip((page - 1) * maxLimit) // skip() will skip documents
		.limit(maxLimit)
		.then((blogs) => {
			return res.status(200).json({
				status: 6000,
				blogs,
			})
		})
		.catch((error) => {
			return res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		})
}

export const latestBlogsCount = async (req, res) => {
	/**
	 * countDocuments() will give the total count of document
	 * present in the collection
	 */
	Blog.countDocuments({ draft: false })
		.then((count) => {
			return res.status(200).json({
				status: 6000,
				totalDocs: count,
			})
		})
		.catch((error) => {
			return res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		})
}

export const trendingBlogs = async (req, res) => {
	Blog.find({ draft: false })
		.populate(
			"author",
			"personal_info.profile_img personal_info.username personal_info.fullName -_id"
		)
		.sort({
			"activity.total_read": -1,
			"activity.total_likes": -1,
			publishedAt: -1,
		})
		.select("blog_id title publishedAt -_id")
		.limit(5)
		.then((blogs) => {
			return res.status(200).json({
				status: 6000,
				blogs,
			})
		})
		.catch((error) => {
			return res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		})
}

// export const searchBlogs = async (req, res) => {
// 	/**
// 	 * $ne: `eliminate_blog` => this will find only blog id not equals to `eliminate_blog`
// 	 */
// 	const { tag, query, author, page, limit, eliminate_blog,interest } = req.body

// 	let findQuery

// 	if (tag) {
// 		findQuery = {
// 			tags: tag,
// 			draft: false,
// 			blog_id: { $ne: eliminate_blog },
// 		}
// 	} else if (query) {
// 		findQuery = { draft: false, title: new RegExp(query, "i") }
// 	} else if (author) {
// 		findQuery = { author, draft: false }
// 	}

// 	const maxLimit = limit ? limit : 2

// 	Blog.find(findQuery)
// 		.populate(
// 			"author",
// 			"personal_info.profile_img personal_info.username personal_info.fullName -_id"
// 		)
// 		.sort({ publishedAt: -1 })
// 		.select("blog_id title des banner activity tags publishedAt -_id")
// 		.skip((page - 1) * maxLimit)
// 		.limit(maxLimit)
// 		.then((blogs) => {
// 			return res.status(200).json({
// 				status: 6000,
// 				blogs,
// 			})
// 		})
// 		.catch((error) => {
// 			return res.status(500).json({
// 				status: 6001,
// 				message: error?.message,
// 			})
// 		})
// }
export const searchBlogs = async (req, res) => {
	/**
	 * $ne: `eliminate_blog` => this will find only blog id not equals to `eliminate_blog`
	 */
	// console.log('KKKKKK',req.body)
	let { query, page, limit,interest } = req.body
	// console.log('req.body',req.body)
	if(page==null || page==''|page=='undefined') page=1
	if(query==null) query=''
	if(query=='undefined') query=''
	const tokens=tokenizer.tokenize(query.toLowerCase()).filter(word => !natural.stopwords.includes(word)).map(natural.PorterStemmer.stem);
	// let findQuery
	if(interest==null) interest=[0.25,0.25,0.25,0.25,0.25]
	const userInterest = {
		sport: interest[0]/10,
		politics: interest[1]/10,
		entertainment: interest[2]/10,
		international: interest[3]/10,
		technology: interest[4]/10,
		};
	const interestTotal = Object.values(userInterest).reduce((a, b) => a + b, 0);
	console.log(userInterest,interestTotal)
	const maxQueryFreq=20
	const alpha=0.7;
	const nerBoostWeight = 1.5; 

	const maxLimit = limit ? limit : 5

	const match= tokens.length==0?{}:{
					word_vector: { $in: tokens }
				}
	const pipeline=[
			{
				$match: match
			},
			{
				$project: {
				blog_id: 1,
				originalArticleURL: 1,
				title: 1,
				banner: 1,
				des: 1,
				content: 1,
				tags: 1,
				draft:1,
				ratings:1,
				ner:1,
				author:{
					personal_info:{
						profile_img:"",
						username:"",
						fullName:"The Daily Star",
					}
				},
				updatedAt:1,
				publishedAt:1,
				matchedFrequencies: {
					$map: {
					input: tokens,
					as: "word",
					in: {
						$cond: [
						{ $in: ["$$word", { $ifNull: ["$word_vector", []] }]},
						{
							$arrayElemAt: [
							"$frequency_vector",
							{ $indexOfArray: ["$word_vector", "$$word"] }
							]
						},
						0
						]
					}
					}
				}
				}
			},
			{
				$addFields: {
					matchedNER: {
					$size: {
						$filter: {
						input: tokens,
						as: "word",
						cond: { $in: ["$$word", { $ifNull: ["$ner", []] }]}
						}
					}
					}
				}
			},
			{
				$addFields: {
				queryScore: { $sum: "$matchedFrequencies" },
				interestScore: {
					$add: [
					{ $multiply: ["$ratings.sport", userInterest.sport / interestTotal] },
					{ $multiply: ["$ratings.politics", userInterest.politics / interestTotal] },
					{ $multiply: ["$ratings.entertainment", userInterest.entertainment / interestTotal] },
					{ $multiply: ["$ratings.technology", userInterest.technology / interestTotal] },
					{ $multiply: ["$ratings.international", userInterest.international / interestTotal] }
					]
				}
				}
			},
			{
				$addFields: {
					normalizedQueryScore: { $divide: ["$queryScore", maxQueryFreq] },
				}
			},
			{
				$addFields: {
					finalScore: {
						$add: [
							'$normalizedQueryScore',
							{ $multiply: ["$interestScore", { $subtract: [1, alpha] }] },
							{$multiply: [ "$matchedNER", nerBoostWeight ]}
						]
					}
				}
			},
			{ $sort: { finalScore: -1 } },
			 { $skip: (page-1)*maxLimit } ,
			{ $limit: maxLimit },

	]



	Blog.aggregate(pipeline)
		// .populate(
		// 	"author",
		// 	"personal_info.profile_img personal_info.username personal_info.fullName -_id"
		// )
		// .sort({ publishedAt: -1 })
		// .select("blog_id title des banner activity tags publishedAt -_id")
		// .skip((page - 1) * maxLimit)
		// .limit(maxLimit)
		.then((blogs) => {
			console.log(blogs)
			return res.status(200).json({
				status: 6000,
				blogs:blogs.length==0?[]:blogs,
			})
		})
		.catch((error) => {
			console.log(error)
			return res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		})
}

export const searchBlogsCount = async (req, res) => {
	let { tag, author, query } = req.body

	let findQuery
	
	if (tag) {
		findQuery = { tags: tag}
	} else if (query) {
		if(query==null) query=''
		if(query=='undefined') query=''
		const tokens=tokenizer.tokenize(query.toLowerCase()).filter(word => !natural.stopwords.includes(word)).map(natural.PorterStemmer.stem);
		findQuery= tokens.length==0?{}:{
						word_vector: { $in: tokens }
					}
	} else if (author) {
		findQuery = { author,  }
	}
	console.log(findQuery)
	Blog.countDocuments(findQuery)
		.then((count) => {
			return res.status(200).json({
				status: 6000,
				totalDocs: count,
			})
		})
		.catch((error) => {
			return res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		})
}

export const getBlog = async (req, res) => {
	/**
	 * `$inc => incrementing something`
	 */

	const { blog_id, draft, mode } = req.body

	const incrementVal = mode !== "edit" ? 1 : 0

	Blog.findOneAndUpdate(
		{ blog_id },
		{ $inc: { "activity.total_reads": incrementVal } }
	)
		.populate(
			"author",
			"personal_info.fullName personal_info.username personal_info.profile_img"
		)
		.select("title des content banner activity publishedAt originalArticleURL blog_id tags")
		.then((blog) => {
			/**
			 * updating the `total_reads` count from the author details
			 *
			 * `findOneAndUpdate` is a promise so should need the catch method.
			 */
			User.findOneAndUpdate(
				{
					"personal_info.username":
						blog.author.personal_info.username,
				},
				{ $inc: { "account_info.total_reads": incrementVal } }
			).catch((error) => {
				return res.status(500).json({
					status: 6001,
					message: error?.message,
				})
			})

			if (blog.draft && !draft) {
				return res.status(500).json({
					status: 6001,
					message: "You can not access draft blogs",
				})
			}

			return res.status(200).json({
				status: 6000,
				blog,
			})
		})
		.catch((error) => {
			return res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		})
}

export const likeBlog = async (req, res) => {
	const user_id = req.user

	const { _id, isUserLiked } = req.body

	const incrementVal = !isUserLiked ? 1 : -1

	Blog.findOneAndUpdate(
		{ _id },
		{ $inc: { "activity.total_likes": incrementVal } }
	).then((blog) => {
		if (!isUserLiked) {
			const like = new Notification({
				type: "like",
				blog: _id,
				notification_for: blog.author,
				user: user_id,
			})

			like.save().then((notification) => {
				return res.status(200).json({
					status: 6000,
					liked_by_user: true,
				})
			})
		} else {
			Notification.findOneAndDelete({
				user: user_id,
				blog: _id,
				type: "like",
			})
				.then((data) => {
					return res.status(200).json({
						status: 6000,
						liked_by_user: false,
					})
				})
				.catch((error) => {
					return res.status(500).json({
						status: 6001,
						message: error?.message,
					})
				})
		}
	})
}

export const isUserLiked = async (req, res) => {
	/**
	 * request for sending information about currently logged
	 * user is liked the blog post or not
	 */

	const user_id = req.user

	const { _id } = req.body

	Notification.exists({ user: user_id, type: "like", blog: _id })
		.then((result) => {
			return res.status(200).json({
				status: 6000,
				result,
			})
		})
		.catch((error) => {
			return res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		})
}

export const deleteBlog = (req, res) => {
	const user_id = req.user

	const { blog_id } = req.body

	Blog.findOneAndDelete({ blog_id })
		.then((blog) => {
			/**
			 * deleting all of the notifications and
			 * comments based on the blog
			 */

			Notification.deleteMany({ blog: blog._id }).then((data) =>
				console.log("Notification deleted")
			)

			Comment.deleteMany({ blog_id: blog._id }).then((data) =>
				console.log("Comment deleted")
			)

			User.findOneAndUpdate(
				{ _id: user_id },
				{
					$pull: { blog: blog._id },
					$inc: { "account_info.total_posts": -1 },
				}
			).then(() => {
				console.log("Blog deleted")
			})

			return res.status(200).json({
				status: 6000,
				message: "Deleted",
			})
		})
		.catch((error) => {
			return res.status(500).json({
				status: 6001,
				message: error?.message,
			})
		})
}
