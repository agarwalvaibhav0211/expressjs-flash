# ExpressJS-Flash

The flash is a special area of the session used for storing messages.  Messages are written to the flash and cleared after being displayed to the user.  The flash is typically used in combination with redirects, ensuring that the message is available to the next page that is to be rendered.

This is inspired by connect-flash module used for ExpressJS>=3.x.

But I felt that the connect-flash was too basic. I made a new module to include some more features that I felt were sorely needed for many workflows.

## Install

    $ npm install connect-flash

## Usage

#### Express

Flash messages are stored in the session.  First, setup sessions as usual by enabling `cookieParser` and `session` middleware. Then, use `flash` middleware provided by connect-flash.

```javascript
var flash = require('connect-flash');
var app = express();

app.configure(function() {
  app.use(express.session({ 
    secret: 'keyboard cat',
    cookie: { maxAge: 60000 }
  }));
  app.use(flash());
});
```
## Options for Middleware

You can pass options to the middleware.

```javascript
  app.use(flash({
    passToView : true  //This enables you to use the getFlash() and setFlash() in the view directly, Default: true
  }));
});
```

With the `flash` middleware in place, all requests will have a `req.getFlash()` and a `req.getFlash()` function that can be used for flash messages.

```javascript
app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.setFlash('info', 'Flash is here!');
  res.redirect('/');
});

app.get('/', function(req, res){
  messages=req.getFlash('info');
  res.render('index', { messages: req.getFlash('info') });
});
```
## Options for the functions

You can pass options to the get and set functions

```javascript
app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.setFlash('info', 'Flash is back!',{
    maxReads: 4,   //The number of times this message can be read, default: 1
    reqCount: 8    //The number of requests through which this message persists, default: null, This means that the middleware does not keep track of this. Note: a redirect counts as a request and decreases this counter
  });
  res.redirect('/');
});

app.get('/', function(req, res){
  messages=req.getFlash('info',{
    reflash: true, //This stops it being counted as a read, Useful when needing to read in a middleware
  });
  res.render('index', { messages: req.getFlash('info') });
});
```

## Examples

For an example using connect-flash in an Express app, refer to the [express3](https://github.com/agarwalvaibhav0211/expressjs-flash/tree/master/examples) example.

## Tests

    $ npm install --dev
    $ make test

## Credits

  - [Vaibhav Agarwal](https://github.com/agarwalvaibhav0211)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Vaibhav Agarwal
