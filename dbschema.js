//this file is just a reference for db schema
let db = {
  users: [
    {
      userId: "ksdoa912ejdwqijoijwqoi",
      email: "user@email.com",
      handle: "user",
      createdAt: "2019-07-10T03:52:32.227Z",
      imageUrl: "image/dsfsdfkasjfk/fsaasfswq",
      bio: "hello my name is user , nice to meet you ",
      website: "https://user.com",
      location: "London,UK"
    }
  ],
  roars: [
    {
      userHandle: "user",
      body: "this is the roar body ",
      createdAt: "2019-07-10T03:52:32.227Z",
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: "user",
      roarId: "kdjsfgdksuufhgkdsufky",
      body: "nice one mate!",
      createdAt: "2019-03-15T10:59:52.798Z"
    }
  ],
  notifications: [
    {
      recipient: "user",
      sender: "john",
      read: "true | false",
      roarId: "kdjsfgdksuufhgkdsufky",
      type: "like | comment",
      createdAt: "2019-03-15T10:59:52.798Z"
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: [
    {
      userId: "N43KJ5H43KJHREW4J5H3JWMERHB",
      email: "user@email.com",
      handle: "user",
      createdAt: "2019-03-15T10:59:52.798Z",
      imageUrl: "image/dsfsdkfghskdfgs/dgfdhfgdh",
      bio: "Hello, my name is user, nice to meet you",
      website: "https://user.com",
      location: "Lonodn, UK"
    }
  ],
  likes: [
    {
      userHandle: "user",
      roarId: "hh7O5oWfWucVzGbHH2pa"
    },
    {
      userHandle: "user",
      roarId: "3IOnFoQexRcofs5OhBXO"
    }
  ]
};
