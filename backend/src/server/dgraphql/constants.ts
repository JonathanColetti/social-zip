export const DqlSchema = `
Comment.commentId: string @index(exact) .
Comment.comment: string .
Comment.likes: [uid] @count .
Comment.post: uid .
Comment.username: uid @reverse .
Hashtag.hashtag: string @index(exact) .
Hashtag.posts: [uid] .
Hashtag.pinnedBy: [uid] @count .
Post.clickedOn: [uid] @count .
Post.comments: [uid] @count .
Post.hashtag: uid @reverse .
Post.likes: [uid] @count .
Post.postId: string @index(exact) .
Post.username: uid @reverse .
Post.timestamp: int .
Post.views: [uid] @reverse @count .
Profile.accent: string .
Profile.backgroundPicture: string .
Profile.blockedUsers: [uid] @reverse .
Profile.clickedOn: [uid] @reverse @count .
Profile.followers: [uid] @reverse @count .
Profile.following: [uid] @reverse @count .
Profile.isBanned: bool .
Profile.isVerified: bool .
Profile.isPrivate: string @index(exact) .
Profile.followRequests: [uid] @reverse @count .
Profile.likedComments: [uid] .
Profile.likes: [uid] .
Profile.pinnedHashtags: [uid] @reverse .
Profile.posts: [uid] @reverse .
Profile.profilePicture: string .
Profile.rname: string .
Profile.username: string @index(exact) .
Profile.viewed: [uid] @reverse .
dgraph.drop.op: string .
dgraph.graphql.p_query: string @index(sha256) .
dgraph.graphql.schema: string .
dgraph.graphql.xid: string @index(exact) @upsert .

type Comment {
	Comment.commentId
	Comment.username
	Comment.likes
	Comment.comment
}
type Hashtag {
	Hashtag.hashtag
  Hashtag.pinnedBy
  Hashtag.posts
}
type Post {
	Post.postId
	Post.username
	Post.likes
	Post.comments
	Post.hashtag
}
type Profile {
	Profile.username
	Profile.profilePicture
	Profile.rname
	Profile.posts
	Profile.accent
	Profile.isVerified
	Profile.backgroundPicture
	Profile.following
	Profile.followers
}
type dgraph.graphql {
	dgraph.graphql.schema
	dgraph.graphql.xid
}
type dgraph.graphql.persisted_query {
	dgraph.graphql.p_query
}
`;

export const MostFollowedUsersQuery = `
query findUser($o: string, $f: string) {
  topu as var(func: has(Profile.username)) {
    uid
    mfollowed as count(Profile.followers)
  }
  findUser(func: uid(topu), orderdesc: val(mfollowed), first: $f, offset: $o) {
    rname: Profile.rname
    username: Profile.username
    profilePicture: Profile.profilePicture
    isVerified: Profile.isVerified 
  }
}
`;

export const PostRecommendationQuery = `
query findProfile($a: string, $f: string) {
  var(func: eq(Profile.username, $a)) {
    Profile.username
    seen as Profile.clickedOn {
      ~Profile.clickedOn {
        uid
        co as count(Post.clickedOn)
        lc as count(Post.likes)
        cmc as count(Post.comments)
        vc as count(Post.views)
        post_score as math( (0.1 * vc) + (0.1 * cmc) + (0.1 * lc) + (0.1 * co) )
      }
    }
  }
  var(func: uid(post_score), first: 30, orderdesc: val(post_score)) {
    rated @filter(not uid(seen)) {
      fscore as math(post_score)
    }
  }
  Recommendation(func: uid(fscore), orderdesc: val(fscore), first: $f) {
    Post.postId 
  }
}
`;

export const CollaborativeFilteringQuery = `
query findProfile($a: string, $f: string) {
  test(func: eq(Profile.username, $a)) {
    a as math(1)
    Profile.blockedUsers {
      uid
      blocked as Profile.posts {
        uid
      }
    }
    viewed as Profile.viewed @facets {
      uid
    }
    seen as Profile.clickedOn @facets(c as clickedOnCount) {
      ~Profile.clickedOn @facets(sc as clickedOnCount) {
        user_score as math((sc + c)/a)
      }
    }
  }
  var(func: uid(user_score), first: 30, orderdesc: val(user_score)) {
    norm as math(1)
    Profile.clickedOn @filter(not uid(seen) and not uid(viewed)) @facets(uc as clickedOnCount) {
      fscore as math(uc/norm)
    }
  }
  recommendation(func: uid(fscore), orderdesc: val(fscore), first: 35) @filter(not uid(blocked)) {
    uid
    postId: Post.postId
    likes: count(Post.likes)
    comments: count(Post.comments)
    views: count(Post.views)
    clicks: count(Post.clickedOn)
    timestamp: Post.timestamp
    user: Post.username {
      rname: Profile.rname
      profilePicture: Profile.profilePicture
      isVerified: Profile.isVerified
    }
    
  }
}
`;

export const IsBlockedQuery = `
query findProfile($a: string, $b: string) {
  findProfile(func: eq(Profile.username, $a)) {
    blocked: Profile.blockedUsers @filter(eq(Profile.username, $b)) {
      uid
    }
  }
}
`;

export const GetUserUidQuery = `
query findProfile($a: string) {
  findProfile(func: eq(Profile.username, $a)) {
        Profile.username
        uid
  }
}
`;

export const GetNewestHashtagPostsQuery = `
query findHashtag($a: string, $o: string, $f: string) {
  findPosts(func: eq(Hashtag.hashtag, $a)) {
    Hashtag.hashtag
    getPosts: Hashtag.posts(orderdesc: Post.timestamp, first: $f, offset: $o) {
      uid
      postId: Post.postId
      likes: count(Post.likes)
      comments: count(Post.comments)
      views: count(Post.views)
      clicks: count(Post.clickedOn)
      timestamp: Post.timestamp
      user: Post.username {
        username: Profile.username
        rname: Profile.rname
        profilePicture: Profile.profilePicture
        isVerified: Profile.isVerified
      }
    }
  }
}
`;

export const DidLikePostQuery = `
query findProfile($a: string, $b: string) {
  findProfile(func: eq(Profile.username, $a)) {
    liked: Profile.likes @filter(eq(Post.postId, $b)) {
      uid
    }
  }
}
`;

export const GetBlockedUsersQuery = `
query findProfile($a: string, $o: string, $f: string) {
  findProfile(func: eq(Profile.username, $a)) {
    blocked: Profile.blockedUsers(offset: $o, first: $f) {
      username: Profile.username
    }
  }
}
`;

export const GetFollowRequestsQuery = `
query findProfile($a: string, $o: string, $f: string) {
  followRequests(func: eq(Profile.username, $a)) {
    followRequsts: Profile.followRequests(offset: $o, first: $f) {
      username: Profile.username
      rname: Profile.rname
      profilePicture: Profile.profilePicture
      isVerified: Profile.isVerified
    }
  }
}

`;

export const GetUserQuery = `
query findProfile($a: string) {
  findProfile(func: eq(Profile.username, $a), first: 1 ) {
    uid
    username: Profile.username 
    accent: Profile.accent
    rname: Profile.rname
    isVerified: Profile.isVerified
    profilePicture: Profile.profilePicture
    backgroundPicture: Profile.backgroundPicture
    isBanned: Profile.isBanned
    followers: count(Profile.followers)
    following: count(Profile.following)
  }
} 
`;

export const IsFollowingQuery = `
query findProfile($a: string, $b: string) {
  findProfile(func: eq(Profile.username, $a)) {
    Profile.following @filter(eq(Profile.username, $b)) {
      uid
    }
  }
}
`;

export const GetPostQuery = `
query findPost($a: string) {
  findPost(func: eq(Post.postId, $a)) {
    uid
    postId: Post.postId
    likes: count(Post.likes)
    comments: count(Post.comments)
    views: count(Post.views)
    clicks: count(Post.clicks)
    timestamp: Post.timestamp
    user: Post.username {
      username: Profile.username
      profilePicture: Profile.profilePicture
      rname: Profile.rname
      isVerified: Profile.isVerified
    }
  }
}
`;

export const GetHashtagUidQuery = `
query findHashtag($a: string) {
  findHashtag(func: eq(Hashtag.hashtag, $a)) {
    uid
  }
}
`;

export const GetUserLikedPostsQuery = `
query findProfile($a: string, $o: string, $f: string) {
  findProfile(func: eq(Profile.username, $a)) {
    liked: Profile.likes(offset: $o, first: $f) {
      uid
      postId: Post.postId
    }
  }
}
`;

export const GetUserViewedPostsQuery = `
query findProfile($a: string, $o: string, $f: string) {
  findProfile(func: eq(Profile.username, $a)) {
    viewed: Profile.viewed(offset: $o, first: $f) {
      uid
      postId: Post.postId
    }
  }
}
`;

export const GetPostUidQuery = `
query findPost($a: string) {
  findPost(func: eq(Post.postId, $a)) {
    uid
  }
}
`;

export const GetCommentUidQuery = `
query findComment($a: string) {
  findComment(func: eq(Comment.commentId, $a)) {
    uid
  }
}
`;

export const GetCommentQuery = `
query findComment($a: string) {
  findComment(func: eq(Comment.commentId, $a)) {
    uid
    commentId: Comment.commentId
    comment: Comment.comment
    likes: count(Comment.likes)
    timestamp: Comment.timestamp
    user: Comment.username {
      username: Profile.username
      profilePicture: Profile.profilePicture
      rname: Profile.rname
      isVerified: Profile.isVerified
    }
  }
}
`;

export const GetUserPostsQuery = `
query findProfile($a: string, $o: string, $f: string) {
  findProfile(func: eq(Profile.username, $a)) {
    Profile.posts(offset: $o, first: $f, orderdesc: Post.timestamp) {
      postId: Post.postId
      likes: count(Post.likes)
      comments: count(Post.comments)
      views: count(Post.views)
      timestamp: Post.timestamp
      clicks: count(Post.clickedOn)
    }
  }
}
`;

export const GetPopularPostsFilterUserViewedQuery = `
query findPost($a: string, $o: string, $f: string) {
  findUser(func: eq(Profile.username, $a)) {
    Profile.blockedUsers {
      blocked as Profile.posts {
        uid
      }  
    }
    viewed as Profile.viewed {
      uid
    }
  }
  posts as tempPosts(func: has(Post.postId)) {
    uid
    likes as count(Post.likes)
    comments as count(Post.comments)
    views as count(Post.views)
    clicks as count(Post.clickedOn)
    score as math( (0.1 * clicks) + (0.1 * views) + (0.1 * comments) + (0.1 * likes) )
  }
  findPost(func: uid(posts), orderdesc: val(score), first: $f, offset: $o) @filter(not uid(blocked) and not uid(viewed)) {
    uid
    postId: Post.postId
    likes: count(Post.likes)
    comments: count(Post.comments)
    username: Post.username
    views: count(Post.views)
    clicks: count(Post.clickedOn)
    timestamp: Post.timestamp
    user: Post.username  {
      rname: Profile.rname
      profilePicture: Profile.profilePicture
      isVerified: Profile.isVerified
      username: Profile.username
    }
  }
}
`;

export const GetPopularPostsQuery = `
query findPost($o: string, $f: string) {
  posts as tempPosts(func: has(Post.postId)) {
    uid
    likes as count(Post.likes)
    comments as count(Post.comments)
    views as count(Post.views)
    clicks as count(Post.clickedOn)
    score as math( (0.1 * clicks) + (0.1 * views) + (0.1 * comments) + (0.1 * likes) )
  }
  findPost(func: uid(posts), orderdesc: val(score), first: $f, offset: $o) {
    uid
    postId: Post.postId
    likes: count(Post.likes)
    comments: count(Post.comments)
    views: count(Post.views)
    clicks: count(Post.clickedOn)
    timestamp: Post.timestamp
    user: Post.username {
      rname: Profile.rname
      profilePicture: Profile.profilePicture
      isVerified: Profile.isVerified
      username: Profile.username
    }
  }
}
`;

export const GetPinnedHashtagsQuery = `
query findProfile($a: string, $o: string, $f: string) {
  findProfile(func: eq(Profile.username, $a)) {
    Profile.username
    phashtags: Profile.pinnedHashtags(offset: $o, first: $f) {
      uid
      hashtag: Hashtag.hashtag
    }
  }
}
`;

export const HashtagRecomendationPinsQuery = `
query findProfile($a: string, $o: string, $f: string) {
  findProfile(func: eq(Profile.username, $a)) {
    Profile.username
    phashtags as Profile.pinnedHashtags {
      uid
      hashtag: Hashtag.hashtag
    }
  }
  var(func: uid(phashtags)) {
    rated @filter(not uid(phashtags)) {
      fscore as math(1)
    }
  }
  hashtags(func: uid(fscore), orderdesc: val(fscore), first: $f) {
    hashtag: Hashtag.hashtag
  }
}
`;

export const HashtagRecomendationByClickedPostsQuery = `
query findProfile($a: string, $o: string, $f: string) {
  findProfile(func: eq(Profile.username, $a)) {
    Profile.username
    phashtags as Profile.pinnedHashtags {
      uid
      hashtag: Hashtag.hashtag
    }
    clicked_posts as Profile.clickedOn {
      ~Profile.clickedOn {
        uid
        hashtag: Post.hashtag {
          uid
          hashtag: Hashtag.hashtag
        }
      }
    }
  }
  var(func: uid(clicked_posts)) {
    rated @filter(not uid(phashtags)) {
      fscore as math(1)
    }
  }
  hashtags(func: uid(fscore), orderdesc: val(fscore), first: $f) {
    hashtag: Hashtag.hashtag
  }
}
`;

export const GetHashtagPostsQuery = `
query findHashtag($h: string, $o: string, $f: string) {
  findHashtag(func: eq(Hashtag.hashtag, $h)) {
    uid
    Hashtag.hashtag
    theHashtags as Hashtag.posts {
      lc as count(Post.likes)
      cmc as count(Post.comments)
      vc as count(Post.views)
      cc as count(Post.clicks)
      score as math( (0.1 * vc) + (0.1 * cc) + (0.1 * cmc) + (0.1 * lc) )
    }
  }
  getPosts(func: uid(theHashtags), orderdesc: val(score), first: $f, offset: $o) {
    uid
    postId: Post.postId
    likes: count(Post.likes)
    views: count(Post.views)
    comments: count(Post.comments)
    clicks: count(Post.clicks)
    timestamp: Post.timestamp
    user: Post.username {
      username: Profile.username
      rname: Profile.rname
      profilePicture: Profile.profilePicture
      isVerified: Profile.isVerified
    } 
  }
}
`;

export const GetHashtagPostsFilterViewedQuery = `
query findHashtag($a: string, $h: string, $o: string, $f: string) {
  findUser(func: eq(Profile.username, $a)) {
    Profile.blockedUsers {
      uid
      blocked as Profile.posts {
        uid
      }
    }
    viewed as Profile.viewed {
      uid
    }
  }
  findHashtag(func: eq(Hashtag.hashtag, $h)) {
    uid
    Hashtag.hashtag
    theHashtags as Hashtag.posts @filter(not uid(viewed)) {
      uid
      lc as count(Post.likes)
      cmc as count(Post.comments)
      vc as count(Post.views)
      cc as count(Post.clicks)
      score as math( (0.1 * vc) + (0.1 * cc) + (0.1 * cmc) + (0.1 * lc) )
    }
  }
  getPosts(func: uid(theHashtags), orderdesc: val(score), first: $f, offset: $o) @filter(not uid(blocked)) {
    uid
    postId: Post.postId
    likes: count(Post.likes)
    views: count(Post.views)
    comments: count(Post.comments)
    clicks: count(Post.clicks)
    timestamp: Post.timestamp
    user: Post.username {
      username: Profile.username
      rname: Profile.rname
      profilePicture: Profile.profilePicture
      isVerified: Profile.isVerified
    } 
  }
}
`;

export const FriendSuggestionQuery = `
query findProfile($a: string, $o: string, $f: string) {
  me as var(func: eq(Profile.username, $a)) {
    blocked as Profile.blockedUsers {
      uid
    }
    sc as math(1) # Give a score of 1 to the user
    fr as Profile.following {
      Profile.following {
        fscore as math(sc)  # This will be the number of common friends
      }
    }
  }

  TopRecommendations(func: uid(fscore), orderdesc: val(fscore), first: $f, offset: $o) @filter(not uid(fr,me) AND not uid(blocked)) { # Remove the user, his friends, and blocked users
    rname: Profile.rname
    username: Profile.username
    profilePicture: Profile.profilePicture
    isVerified: Profile.isVerified
  }
}
`;

export const GetCommentsQuery = `
query findPost($a: string, $o: string, $f: string) {
  tempPosts(func: eq(Post.postId, $a)) {
    comments as Post.comments {
      uid
      likes as count(Comment.likes)
    }
  }
  getComments(func: uid(comments), orderdesc: val(likes), first: $f, offset: $o) {
    uid
    commentId: Comment.commentId
    comment: Comment.comment
    likes: count(Comment.likes)
    timestamp: Comment.timestamp
    user: Comment.username {
      username: Profile.username
      profilePicture: Profile.profilePicture
      rname: Profile.rname
      isVerified: Profile.isVerified
    }
  }
}
`;

export const GetCommentsQueryFilterBlocked = `
query findPost($a: string, $o: string, $f: string) {
  findUser(func: eq(Profile.username, $a)) {
    Profile.blockedUsers {
      uid
      blockedComments as Profile.comments {
        uid
      }
    }
  }
  tempPosts(func: eq(Post.postId, $a)) {
    comments as Post.comments @filter(not uid(blockedComments)) {
      uid
      likes as count(Comment.likes)
    }
  }
  getComments(func: uid(comments), orderdesc: val(likes), first: $f, offset: $o) {
    uid
    commentId: Comment.commentId
    comment: Comment.comment
    likes: count(Comment.likes)
    timestamp: Comment.timestamp
    user: Comment.username {
      username: Profile.username
      profilePicture: Profile.profilePicture
      rname: Profile.rname
      isVerified: Profile.isVerified
    }
  }  
}
`;

export const GetMostFollowedWithLoginQuery = `
query findProfile($a: string, $o: string, $f: string) {
  var(func: eq(Profile.username, $a)) {
    theuser as uid
    blocked as Profile.blockedUsers {
      uid
    }
  }
  topu as var(func: has(Profile.username)) {
    uid
    mfollowed as count(Profile.followers)
  }
  findUser(func: uid(topu), orderdesc: val(mfollowed), first: $f, offset: $o) @filter( not uid(theuser) AND not uid(blocked) ) {
    rname: Profile.rname
    username: Profile.username
    profilePicture: Profile.profilePicture
    isVerified: Profile.isVerified 
    isFollowing: count(Profile.followers)
  }
}
`;

// export const HashtagRecommendationQuery = `

// `;

export const GetMostPinnedHashtagsQuery = `
query findHashtag($o: string, $f: string) {
  hashtags as var(func: has(Hashtag.hashtag)) {
    uid
    pcount as count(Hashtag.pinnedBy)
    posts as count(Hashtag.posts)
    orderby as math( (0.5 * pcount) + (0.5 * posts) )
  }
  topHashtags(func: uid(hashtags), first: $f, offset: $o, orderdesc: val(orderby)) {
    hashtag: Hashtag.hashtag
    pcount: val(pcount)
    posts: val(posts)

  }
}
`;

export const GetFollowingPostsQuery = `
query findProfilePosts($a: string, $o: string, $f: string) {
  findProfile(func: eq(Profile.username, $a)) {
    Profile.following {
      posted_posts as Profile.posts {
        post_timestamp as Post.timestamp 
      }
    }
  }
  
  posts(func: uid(posted_posts), orderdesc: val(post_timestamp), first: $f, offset: $o) {
    postId: Post.postId
    post_timestamp: val(post_timestamp)
    likes: count(Post.likes)
    comments: count(Post.comments)
    views: count(Post.views)
    clicks: count(Post.clickedOn)
    timestamp: Post.timestamp
    user: Post.username {
      rname: Profile.rname
      profilePicture: Profile.profilePicture
      isVerified: Profile.isVerified
      username: Profile.username
    }
  }
}
`;
