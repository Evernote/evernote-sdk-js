# OAuth callback
callback = () ->
  pattern = new RegExp(/oauth_verifier=([^&=\?]+)/)
  verifier = this.querystring.match(pattern)[1]

  if verifier.length == 0
    console.log("Missing OAuth verifier.")
    console.log(JSON.stringify(err))
    return

  Meteor.call('handleCallback', localStorage.getItem('oauthToken'), localStorage.getItem('oauthTokenSecret'), verifier, (err, res) ->
    localStorage.removeItem('oauthToken')
    localStorage.removeItem('oauthTokenSecret')

    if err
      console.log(JSON.stringify(err))
      return

    unless res
      console.log("Couldn't get OAuth access token.")
      console.log(JSON.stringify(err))
      return

    Session.set('oauthAccessToken', res['oauthAccessToken'])
    Session.set('oauthAccessTokenSecret', res['oauthAccessTokenSecret'])
    Session.set('edamUserId', res['edamUserId'])
    Session.set('edamShard', res['edamShard'])
    Session.set('edamExpires', res['edamExpires'])
    Session.set('edamNoteStoreUrl', res['edamNoteStoreUrl'])
    Session.set('edamWebApiUrlPrefix', res['edamWebApiUrlPrefix'])
    Meteor.Router.to('/')

    Meteor.call("listNotebooks", Session.get('oauthAccessToken'), (err, res) ->
      if err
        console.log(JSON.stringify(err))
        return
      Session.set('notebooks', res)
    )
  )

# logout
logout = () ->
  Session.set('oauthAccessToken', undefined)
  Session.set('oauthAccessTokenSecret', undefined)
  Session.set('edamUserId', undefined)
  Session.set('edamShard', undefined)
  Session.set('edamExpires', undefined)
  Session.set('edamNoteStoreUrl', undefined)
  Session.set('edamWebApiUrlPrefix', undefined)
  Session.set('notebooks', undefined)
  Meteor.Router.to('/')

Meteor.Router.add(
  '/': 'home',
  '/callback': callback,
  '/logout': logout,
)

Template.home.helpers(
  'loggedIn': () ->
    Session.get('oauthAccessToken')
  'notebooks': () ->
    Session.get('notebooks')
  'oauthAccessToken': () ->
    Session.get('oauthAccessToken')
  'oauthAccessTokenSecret': () ->
    Session.get('oauthAccessTokenSecret')
  'edamNoteStoreUrl': () ->
    Session.get('edamNoteStoreUrl')
  'edamWebApiUrlPrefix': () ->
    Session.get('edamWebApiUrlPrefix')
  'edamUserId': () ->
    Session.get('edamUserId')
  'edamExpires': () ->
    Session.get('edamExpires')
)

Template.home.events(
  'click .login' : (evt) ->
    evt.preventDefault()
    Meteor.call("startOAuth", (err, res) ->
      if err
        console.log(JSON.stringify(err))
        return
      localStorage.setItem('oauthToken', res['oauthToken'])
      localStorage.setItem('oauthTokenSecret', res['oauthTokenSecret'])
      window.location = res['authorizeUrl']
    )
    false
  'click .logout' : (evt) ->
    evt.preventDefault()
    logout()
    false
)
