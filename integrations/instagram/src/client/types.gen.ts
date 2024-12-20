// This file is auto-generated by @hey-api/openapi-ts

export type CaptionData = {
    /**
     * Caption creation UNIX timestamp
     */
    created_time?: string;
    /**
     * User who created this caption
     */
    from?: UserShortInfo;
    /**
     * ID of this caption
     */
    id?: string;
    /**
     * Caption text
     */
    text?: string;
};

export type CommentEntry = {
    /**
     * Comment creation UNIX timestamp
     */
    created_time?: string;
    /**
     * User who posted this comment
     */
    from?: UserShortInfo;
    /**
     * ID of this comment
     */
    id?: string;
    /**
     * Text of the comment
     */
    text?: string;
};

export type CommentsCollection = {
    /**
     * Nember of comments available, data does not necessary contain all comments
     */
    count?: number;
    /**
     * Collection of comment entries; **warning:** deprecated for Apps [created on or after Nov 17, 2015](http://instagram.com/developer/changelog/)
     */
    data?: Array<CommentEntry>;
};

export type CommentsResponse = {
    /**
     * Collection of comments
     */
    data?: Array<CommentEntry>;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type CursorPaginationInfo = {
    /**
     * The cursor ID of the next page
     */
    next_cursor?: string;
    /**
     * URL to retrieve next page of entries
     */
    next_url?: string;
};

export type IdPaginationInfo = {
    /**
     * The max ID of the next page
     */
    next_max_id?: string;
    /**
     * URL to retrieve next page of entries
     */
    next_url?: string;
};

export type ImageInfo = {
    /**
     * Image/video height in pixels
     */
    height?: number;
    /**
     * URL of the image/video resource
     */
    url?: string;
    /**
     * Image/video width in pixels
     */
    width?: number;
};

export type ImagesData = {
    /**
     * Image in low resolution
     */
    low_resolution?: ImageInfo;
    /**
     * Image in standard resolution
     */
    standard_resolution?: ImageInfo;
    /**
     * Thumbnail of the image
     */
    thumbnail?: ImageInfo;
};

export type LikesCollection = {
    /**
     * Nember of likes available, data does not necessary contain all comments
     */
    count?: number;
    /**
     * Collection of users who liked; **warning:** deprecated for Apps [created on or after Nov 17, 2015](http://instagram.com/developer/changelog/)
     */
    data?: Array<UserShortInfo>;
};

export type LocationInfo = {
    /**
     * ID of this location (in some responses it has a type of 'integer')
     */
    id?: string;
    /**
     * Location latitude
     */
    latitude?: number;
    /**
     * Location longitude
     */
    longitude?: number;
    /**
     * Location name
     */
    name?: string;
};

export type LocationInfoResponse = {
    /**
     * Location brief information
     */
    data?: LocationInfo;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type LocationSearchResponse = {
    /**
     * List of found locations
     */
    data?: Array<LocationInfo>;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type MediaEntry = {
    /**
     * ??? Unknown ???
     */
    attribution?: string;
    /**
     * Describes caption of this media
     */
    caption?: CaptionData;
    /**
     * Comments of this media entry
     */
    comments?: CommentsCollection;
    /**
     * Media creation UNIX timestamp
     */
    created_time?: string;
    /**
     * Filter of this media entry
     */
    filter?: string;
    /**
     * ID of a media entry
     */
    id?: string;
    /**
     * Images data in different resolutions
     */
    images?: ImagesData;
    /**
     * Likes of this media entry
     */
    likes?: LikesCollection;
    /**
     * Fixed URL of this media entry
     */
    link?: string;
    /**
     * Location data for this media if available
     */
    location?: LocationInfo;
    /**
     * List of tags assigned to this media
     */
    tags?: Array<(string)>;
    /**
     * Type of this media entry
     */
    type?: 'image' | 'video';
    /**
     * User who posted this media
     */
    user?: UserShortInfo;
    /**
     * Indicates whether authenticated user has liked this media or not
     */
    user_has_liked?: boolean;
    /**
     * Users located on this media entry
     */
    users_in_photo?: Array<UserInPhoto>;
    /**
     * Videos data in different resolutions, applied for 'video' type
     */
    videos?: VideosData;
};

export type MediaEntryResponse = {
    /**
     * Media resource information
     */
    data?: MediaEntry;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type MediaListResponse = {
    /**
     * List of media entries
     */
    data?: Array<MediaEntry>;
    /**
     * Response meta-data
     */
    meta?: MetaData;
    /**
     * Information for pagination
     */
    pagination?: IdPaginationInfo;
};

export type MediaSearchResponse = {
    /**
     * Found media entries; some end-points do not return likes informtaion
     */
    data?: Array<MediaEntry>;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type MetaData = {
    /**
     * HTTP result code
     */
    code?: number;
};

export type Position = {
    /**
     * X position (horizontal)
     */
    x?: number;
    /**
     * Y position (vertical)
     */
    y?: number;
};

export type RelationshipInfo = {
    /**
     * Status of incoming relationship
     */
    incoming_status?: 'none' | 'followed_by' | 'requested_by';
    /**
     * Status of outgoing relationship
     */
    outgoing_status?: 'none' | 'follows' | 'requested';
    /**
     * Indicates whether target user is private or not
     */
    target_user_is_private?: boolean;
};

export type RelationshipPostResponse = {
    /**
     * Current relationship status
     */
    data?: RelationshipStatus;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type RelationshipResponse = {
    /**
     * Relationship information
     */
    data?: RelationshipInfo;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type RelationshipStatus = {
    /**
     * Status of outgoing relationship
     */
    outgoing_status?: 'none' | 'follows' | 'requested';
};

export type StatusResponse = {
    /**
     * No data - 'null'
     */
    data?: string;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type TagInfo = {
    /**
     * Overall number of media entries taged with this name
     */
    media_count?: number;
    /**
     * Tag name
     */
    name?: string;
};

export type TagInfoResponse = {
    /**
     * Tag brief information
     */
    data?: TagInfo;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type TagMediaListResponse = {
    /**
     * List of media entries with this tag
     */
    data?: Array<MediaEntry>;
    /**
     * Response meta-data
     */
    meta?: MetaData;
    /**
     * Information for pagination
     */
    pagination?: TagPaginationInfo;
};

export type TagPaginationInfo = {
    /**
     * The deprication warning, if information is available
     */
    deprecation_warning?: string;
    /**
     * The min ID of a tag for the next page
     */
    min_tag_id?: string;
    /**
     * Depricated. Use min_tag_id instead
     */
    next_max_id?: string;
    /**
     * The max ID of a tag for the next page
     */
    next_max_tag_id?: string;
    /**
     * Depricated. Use max_tag_id instead
     */
    next_min_id?: string;
    /**
     * URL to retrieve next page of entries
     */
    next_url?: string;
};

export type TagSearchResponse = {
    /**
     * List of found tags with brief statistics
     */
    data?: Array<TagInfo>;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type UserCounts = {
    /**
     * Number of followers of this user
     */
    followed_by?: number;
    /**
     * Number of users followed by this user
     */
    follows?: number;
    /**
     * Number of user media
     */
    media?: number;
};

export type UserInPhoto = {
    /**
     * Position in photo
     */
    position?: Position;
    /**
     * User who is indicated on the photo
     */
    user?: UserShortInfo;
};

export type UserInfo = {
    /**
     * User biography
     */
    bio?: string;
    /**
     * User statistics (counters)
     */
    counts?: UserCounts;
    /**
     * User full name
     */
    full_name?: string;
    /**
     * User ID
     */
    id?: string;
    /**
     * URL to user profile picture
     */
    profile_picture?: string;
    /**
     * User name, nickname
     */
    username?: string;
    /**
     * URL to user web-site
     */
    website?: string;
};

export type UserResponse = {
    /**
     * User basic information
     */
    data?: UserInfo;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type UserShortInfo = {
    /**
     * User full name
     */
    full_name?: string;
    /**
     * User ID
     */
    id?: string;
    /**
     * URL to user profile picture
     */
    profile_picture?: string;
    /**
     * User name, nickname
     */
    username?: string;
};

export type UsersInfoResponse = {
    /**
     * User short information entries
     */
    data?: Array<UserShortInfo>;
    /**
     * Response meta-data
     */
    meta?: MetaData;
};

export type UsersPagingResponse = {
    /**
     * List of user short information entries
     */
    data?: Array<UserShortInfo>;
    /**
     * Response meta-data
     */
    meta?: MetaData;
    /**
     * Information for pagination
     */
    pagination?: CursorPaginationInfo;
};

export type VideosData = {
    /**
     * Video in low resolution
     */
    low_resolution?: ImageInfo;
    /**
     * Video in standard resolution
     */
    standard_resolution?: ImageInfo;
};

export type GetGeographiesByGeoIdMediaRecentData = {
    path: {
        /**
         * The geography ID.
         */
        'geo-id': string;
    };
    query?: {
        /**
         * Max number of media to return.
         */
        count?: number;
        /**
         * Return media before this `min_id`.
         */
        min_id?: string;
    };
};

export type GetGeographiesByGeoIdMediaRecentResponse = (MediaListResponse);

export type GetGeographiesByGeoIdMediaRecentError = unknown;

export type GetLocationsSearchData = {
    query?: {
        /**
         * Default is 1000m (distance=1000), max distance is 5000.
         */
        distance?: number;
        /**
         * Returns a location mapped off of a Facebook places id. If used, a Foursquare id and `lat`, `lng` are not required.
         */
        facebook_places_id?: string;
        /**
         * Returns a location mapped off of a foursquare v1 api location id. If used, you are not required to use
         * `lat` and `lng`. Note that this method is deprecated; you should use the new foursquare IDs with V2 of their API.
         *
         */
        foursquare_id?: string;
        /**
         * Returns a location mapped off of a foursquare v2 api location id. If used, you are not required to use
         * `lat` and `lng`.
         *
         */
        foursquare_v2_id?: string;
        /**
         * Latitude of the center search coordinate. If used, `lng` is required.
         */
        lat?: number;
        /**
         * Longitude of the center search coordinate. If used, `lat` is required.
         */
        lng?: number;
    };
};

export type GetLocationsSearchResponse = (LocationSearchResponse);

export type GetLocationsSearchError = unknown;

export type GetLocationsByLocationIdData = {
    path: {
        /**
         * The location ID.
         */
        'location-id': string;
    };
};

export type GetLocationsByLocationIdResponse = (LocationInfoResponse);

export type GetLocationsByLocationIdError = unknown;

export type GetLocationsByLocationIdMediaRecentData = {
    path: {
        /**
         * The location ID.
         */
        'location-id': string;
    };
    query?: {
        /**
         * Return media after this `max_id`.
         */
        max_id?: string;
        /**
         * Return media before this UNIX timestamp.
         */
        max_timestamp?: number;
        /**
         * Return media before this `min_id`.
         */
        min_id?: string;
        /**
         * Return media after this UNIX timestamp.
         */
        min_timestamp?: number;
    };
};

export type GetLocationsByLocationIdMediaRecentResponse = (MediaListResponse);

export type GetLocationsByLocationIdMediaRecentError = unknown;

export type GetMediaPopularResponse = (MediaSearchResponse);

export type GetMediaPopularError = unknown;

export type GetMediaSearchData = {
    query: {
        /**
         * Default is 1km (distance=1000), max distance is 5km.
         */
        distance?: number;
        /**
         * Latitude of the center search coordinate. If used, `lng` is required.
         */
        lat: number;
        /**
         * Longitude of the center search coordinate. If used, `lat` is required.
         */
        lng: number;
        /**
         * A unix timestamp. All media returned will be taken earlier than this timestamp.
         */
        max_timestamp?: number;
        /**
         * A unix timestamp. All media returned will be taken later than this timestamp.
         */
        min_timestamp?: number;
    };
};

export type GetMediaSearchResponse = (MediaSearchResponse);

export type GetMediaSearchError = unknown;

export type GetMediaShortcodeByShortcodeData = {
    path: {
        /**
         * The short code of the media resource.
         */
        shortcode: string;
    };
};

export type GetMediaShortcodeByShortcodeResponse = (MediaEntryResponse);

export type GetMediaShortcodeByShortcodeError = unknown;

export type GetMediaByMediaIdData = {
    path: {
        /**
         * The ID of the media resource.
         */
        'media-id': string;
    };
};

export type GetMediaByMediaIdResponse = (MediaEntryResponse);

export type GetMediaByMediaIdError = unknown;

export type GetMediaByMediaIdCommentsData = {
    path: {
        /**
         * The ID of the media resource.
         */
        'media-id': string;
    };
};

export type GetMediaByMediaIdCommentsResponse = (CommentsResponse);

export type GetMediaByMediaIdCommentsError = unknown;

export type PostMediaByMediaIdCommentsData = {
    path: {
        /**
         * The ID of the media resource.
         */
        'media-id': string;
    };
    query: {
        /**
         * Text to post as a comment on the media object as specified in `media-id`.
         */
        text: string;
    };
};

export type PostMediaByMediaIdCommentsResponse = (StatusResponse);

export type PostMediaByMediaIdCommentsError = unknown;

export type DeleteMediaByMediaIdCommentsByCommentIdData = {
    path: {
        /**
         * The ID of the comment entry.
         */
        'comment-id': string;
        /**
         * The ID of the media resource.
         */
        'media-id': string;
    };
};

export type DeleteMediaByMediaIdCommentsByCommentIdResponse = (StatusResponse);

export type DeleteMediaByMediaIdCommentsByCommentIdError = unknown;

export type DeleteMediaByMediaIdLikesData = {
    path: {
        /**
         * The ID of the media resource.
         */
        'media-id': string;
    };
};

export type DeleteMediaByMediaIdLikesResponse = (StatusResponse);

export type DeleteMediaByMediaIdLikesError = unknown;

export type GetMediaByMediaIdLikesData = {
    path: {
        /**
         * The ID of the media resource.
         */
        'media-id': string;
    };
};

export type GetMediaByMediaIdLikesResponse = (UsersInfoResponse);

export type GetMediaByMediaIdLikesError = unknown;

export type PostMediaByMediaIdLikesData = {
    path: {
        /**
         * The ID of the media resource.
         */
        'media-id': string;
    };
};

export type PostMediaByMediaIdLikesResponse = (StatusResponse);

export type PostMediaByMediaIdLikesError = unknown;

export type GetTagsSearchData = {
    query: {
        /**
         * A valid tag name without a leading \#. (eg. snowy, nofilter)
         */
        q: string;
    };
};

export type GetTagsSearchResponse = (TagSearchResponse);

export type GetTagsSearchError = unknown;

export type GetTagsByTagNameData = {
    path: {
        /**
         * The tag name.
         */
        'tag-name': string;
    };
};

export type GetTagsByTagNameResponse = (TagInfoResponse);

export type GetTagsByTagNameError = unknown;

export type GetTagsByTagNameMediaRecentData = {
    path: {
        /**
         * The tag name.
         */
        'tag-name': string;
    };
    query?: {
        /**
         * Count of tagged media to return.
         */
        count?: number;
        /**
         * Return media after this `max_tag_id`.
         */
        max_tag_id?: string;
        /**
         * Return media before this `min_tag_id`.
         */
        min_tag_id?: string;
    };
};

export type GetTagsByTagNameMediaRecentResponse = (TagMediaListResponse);

export type GetTagsByTagNameMediaRecentError = unknown;

export type GetUsersSearchData = {
    query: {
        /**
         * Number of users to return.
         */
        count?: number;
        /**
         * A query string.
         */
        q: string;
    };
};

export type GetUsersSearchResponse = (UsersInfoResponse);

export type GetUsersSearchError = unknown;

export type GetUsersSelfFeedData = {
    query?: {
        /**
         * Count of media to return.
         */
        count?: number;
        /**
         * Return media earlier than this `max_id`.
         */
        max_id?: string;
        /**
         * Return media later than this `min_id`.
         */
        min_id?: string;
    };
};

export type GetUsersSelfFeedResponse = (MediaListResponse);

export type GetUsersSelfFeedError = unknown;

export type GetUsersSelfMediaLikedData = {
    query?: {
        /**
         * Count of media to return.
         */
        count?: number;
        /**
         * Return media liked before this id.
         */
        max_like_id?: string;
    };
};

export type GetUsersSelfMediaLikedResponse = (MediaListResponse);

export type GetUsersSelfMediaLikedError = unknown;

export type GetUsersSelfRequestedByResponse = (UsersInfoResponse);

export type GetUsersSelfRequestedByError = unknown;

export type GetUsersByUserIdData = {
    path: {
        /**
         * The ID of a user to get information about, or **self** to retrieve information about authenticated user.
         */
        'user-id': string;
    };
};

export type GetUsersByUserIdResponse = (UserResponse);

export type GetUsersByUserIdError = (unknown);

export type GetUsersByUserIdFollowedByData = {
    path: {
        /**
         * The ID of a user, or **self** to retrieve information about authenticated user.
         */
        'user-id': string;
    };
};

export type GetUsersByUserIdFollowedByResponse = (UsersPagingResponse);

export type GetUsersByUserIdFollowedByError = unknown;

export type GetUsersByUserIdFollowsData = {
    path: {
        /**
         * The ID of a user, or **self** to retrieve information about authenticated user.
         */
        'user-id': string;
    };
};

export type GetUsersByUserIdFollowsResponse = (UsersPagingResponse);

export type GetUsersByUserIdFollowsError = unknown;

export type GetUsersByUserIdMediaRecentData = {
    path: {
        /**
         * The ID of a user to get recent media of, or **self** to retrieve media of authenticated user.
         */
        'user-id': string;
    };
    query?: {
        /**
         * Count of media to return.
         */
        count?: number;
        /**
         * Return media earlier than this `max_id`.
         */
        max_id?: string;
        /**
         * Return media before this UNIX timestamp.
         */
        max_timestamp?: number;
        /**
         * Return media later than this `min_id`.
         */
        min_id?: string;
        /**
         * Return media after this UNIX timestamp.
         */
        min_timestamp?: number;
    };
};

export type GetUsersByUserIdMediaRecentResponse = (MediaListResponse);

export type GetUsersByUserIdMediaRecentError = unknown;

export type GetUsersByUserIdRelationshipData = {
    path: {
        /**
         * The ID of a user to get information about.
         */
        'user-id': string;
    };
};

export type GetUsersByUserIdRelationshipResponse = (RelationshipResponse);

export type GetUsersByUserIdRelationshipError = unknown;

export type PostUsersByUserIdRelationshipData = {
    path: {
        /**
         * The ID of the target user.
         */
        'user-id': string;
    };
    query: {
        /**
         * Type of action to apply for relationship with the user.
         */
        action: 'follow' | 'unfollow' | 'block' | 'unblock' | 'approve' | 'ignore';
    };
};

export type PostUsersByUserIdRelationshipResponse = (RelationshipPostResponse);

export type PostUsersByUserIdRelationshipError = unknown;