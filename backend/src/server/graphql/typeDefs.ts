const TypeDefs = `#graphql
    enum CacheControlScope {
        PUBLIC
        PRIVATE
    }


    directive @cacheControl(
        maxAge: Int
        scope: CacheControlScope
        inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
    type Query {
        getUser(username: String): SingleUser
        getFollowingPosts(pageNum: Int): [Post]
        getUserPosts(username: String, pageNum: Int): [UserPosts]
        similarPosts(postId: String, pageNum: Int): [TiniPost]
        getComments(postId: String, pageNum: Int): [Comment]
        getHashtags(pageNum: Int): [Hashtag]
        getFriendSuggestions(pageNum: Int): [MiniUser]
        getPost(postId: String): Post
        getPostsByHashtag(hashtag: String, pageNum: Int): [Post]
        getPosts(pageNum: Int): [Post]
        getLikedPosts(pageNum: Int): [MiniPost]
        getPinnedHashtags(pageNum: Int): [Hashtag]
        getHistoryPosts(pageNum: Int): [MiniPost]
        getNotifications(lastSortKey: String): [Notification]
        getPopularPosts(pageNum: Int): [Post]
        getPostsBySearch(query: String, pageNum: Int): [MiniPost]
        getUsersBySearch(query: String, pageNum: Int): [MiniUser]
        getHashtagsBySearch(query: String, pageNum: Int): [String]
        getPostsByHashtagSearch(search: String, pageNum: Int): [Post]
        getBlockedUsers(pageNum: Int): [String]
        getFollowRequests(pageNum: Int): [MiniUser]
    }
    type Mutation {
        createPost(uri: String, hashtag: String): String 
        deletePost(postId: String): Boolean
        
        followUser(toFollow: String): Boolean
        unfollowUser(toUnFollow: String): Boolean
        
        likePost(postId: String): Boolean
        unlikePost(postId: String): Boolean

        likeComment(commentId: String): Boolean
        unlikeComment(commentId: String): Boolean

        createComment(postId: String, comment: String): String 
        deleteComment(postId: String, commentId: String): Boolean

        followHashtag(hashtag: String): Boolean 
        unfollowHashtag(hashtag: String): Boolean

        editUser(rname: String, profilePicture: String, backgroundPicture: String, accent: String): Boolean 
        deleteUser: Boolean

        

        blockUser(username: String, unblock: Boolean): Boolean

        makePrivate(makePrivate: Boolean): Boolean
    }

    type MiniUser @cacheControl(maxAge: 240) {
        username: String
        profilePicture: String
        rname: String
        isVerified: Boolean
    }
    type Hashtag {
        hashtag: String
        isPinned: Boolean
    }
    type UserPosts {
        comments: Int
        likes: Int
        timestamp: String
        uri: String
        views: Int
        postId: String
    }
    type Notification {
        username: String
        profilePicture: String
        stimestamp: String
        message: String
        commentId: String
        postId: String
    }
    type MiniPost @cacheControl(maxAge: 500) {
        postId: String
        uri: String
    }
    type TiniPost @cacheControl(maxAge: 120) {
        postId: String
        uri: String
    }
    type Post {
        postId: String 
        rname: String
        username: String
        uri: String
        profilePicture: String
        timestamp: String
        likes: Int
        comments: Int
        views: Int
        isLiked: Boolean
    }
    type User  {
        isBanned: Boolean
        username: String
        rname: String
        profilePicture: String
        accent: String
        backgroundPicture: String
        followers: Int
        following: Int
        isFollowing: Boolean
        isVerified: Boolean
    }
    type Comment {
        commentId: String
        comment: String
        postId: String
        username: String
        profilePicture: String
        timestamp: String
        likes: Int
    }
    type SingleUser {
        username: String
        rname: String
        profilePicture: String
        accent: String
        backgroundPicture: String
        followers: Int
        following: Int
        isFollowing: Boolean
        isVerified: Boolean
    }
    input MakePostInput {
        uri: String
        postType: Int
        waveformUrl: String
        title: String
        hashtag: String
    }
    input MakeUserInput {
        username: String
        rname: String
    }
    input EditUserInput {
        rname: String
        profilePicture: String
        accentColor: String
        backgroundPicture: String
    }

`;

export default TypeDefs;
