# ut-front

## Props

- `UtFront.environment` - based on this prop module will toggle react DevTools
  (production: hidden, all other: vissible)
- `UtFront.reducers` - this property should be of type object that holds app reducers.
- `UtFront.middlewares` - this property should be of type array that holds middlewares.
- `UtFront.utBus` - is used to pass ut-bus instance to all child elements.. it
  can be obtained in the following manner [Official documentation](https://facebook.github.io/react/docs/context.html#passing-info-automatically-through-a-tree)

### Default middleware

  There is few default middlewares that makes our life easy
- `method` middleware(work in progress, still alpha): will watch for parameters
  `method` - string and `params` - object, method should be utBus method name to
  be called and params will be message data, lets say we need to do a login
  request, what should we dispatch in order to make request to utbus? The object
  should be as follows:

```javascript
{
    type: 'LOGIN',
    method: 'user.user.login',
    params: {
        'username': '...',
        'password': '...'
    }
}
```

this will be cought by method middleware, it will send the request, return
promise and will pass following object to redux store:

```javascript
{
    type: 'LOGIN',
    methodRequestState: 'requested'
    // ..... if there is some extra data it will reside here, but field data and
    // method will be removed or altered!!!
}
```

after we receive the response action following object will be resolved in
promise and dispached to redux store:

```javascript
{
    type: 'LOGIN',
    methodRequestState: 'finished',
    result: 'result object',
    error: 'error object'
}
```

- `log` middleware(work in progress, still alpha): will watch for
  `{type: 'UT_LOG', text: '<text to log>'}` and dispatched message will not
  reach redux storage

## Permission check

- add permission array with `permissionsSet` imported from ut-front/react
- wrap the current element within `PermissionCheck` imported from ut-front/react
  like this:

```javascript
<PermissionCheck utAction='abc'><button>Button</button></PermissionCheck>
```

## Using Redux DevTools

Redux DevTools component was removed and replaced by browser extension.
More info here: [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)

## Submitting data to the server on edit

The front-end have to send only the changed data plus the primary key back to
the server when editing some item. We introduce the versionId that will indicate
version of the objects. It will be submitted to the server when editing items.
If there is a difference between the sent versionId and that in the database the
update will be canceled and appropriate error will be returned in response.
