Meteor.startup(() ->
  Evernote = Meteor.require('evernote').Evernote
  Future = Meteor.require('fibers/future')

  Meteor.methods(
    'listNotebooks': (token) ->
      client = new Evernote.Client(
        token: token,
        sandbox: Meteor.settings.sandbox
      )
      noteStore = client.getNoteStore()

      f = new Future()
      noteStore.listNotebooks((err, notebooks) ->
        if err
          console.log("Error: " + JSON.stringify(err))
        else
          f.return(notebooks)
      )
      return f.wait()

    'startOAuth': () ->
      client = new Evernote.Client(
        consumerKey: Meteor.settings.apiConsumerKey,
        consumerSecret: Meteor.settings.apiConsumerSecret,
        sandbox: Meteor.settings.sandbox
      )

      f = new Future()
      setTimeout(() ->
        client.getRequestToken(Meteor.settings.callbackUrl,
          (error, oauthToken, oauthTokenSecret, results) ->
            if error
              console.log("Error: " + JSON.stringify(error))
            else
              f.return(
                'oauthToken': oauthToken,
                'oauthTokenSecret': oauthTokenSecret,
                'authorizeUrl': client.getAuthorizeUrl(oauthToken)
              )
        )
      , 3 * 1000)

      return f.wait()

    'handleCallback': (oauthToken, oauthTokenSecret, verifier) ->
      client = new Evernote.Client(
        consumerKey: Meteor.settings.apiConsumerKey,
        consumerSecret: Meteor.settings.apiConsumerSecret,
        sandbox: Meteor.settings.sandbox
      )

      f = new Future()
      setTimeout(() ->
        client.getAccessToken(oauthToken, oauthTokenSecret, verifier,
          (error, oauthAccessToken, oauthAccessTokenSecret, results) ->
            if error
              console.log("Error: " + JSON.stringify(error))
            else
              f.return(
                'oauthAccessToken': oauthAccessToken,
                'oauthAccessTokenSecret': oauthAccessTokenSecret,
                'edamShard': results.edam_shard,
                'edamUserId': results.edam_userId,
                'edamExpires': results.edam_expires,
                'edamNoteStoreUrl': results.edam_noteStoreUrl,
                'edamWebApiUrlPrefix': results.edam_webApiUrlPrefix
              )
        )
      , 3 * 1000)

      return f.wait()
  )
)
