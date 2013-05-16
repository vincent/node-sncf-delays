# SNCF-delays is a NodeJS tool to check french railways delays.

# Install
```bash
$ npm install sncf-delays
```

# Use
```javascript
var SNCF = require('sncf-delays');

SNCF.departuresDelaysAt("Orléans", function(err, delays) {
  var delay = delays[0];

  console.log("Toum Toum Tiïïiuuoummm ! " +
    "Le train numéro %s à destination de %s, prévu à %s quai %, aura un retard d'environ %s",
    delay.train_id,
    delay.to,
    delay.train_time,
    delay.train_deck,
    delay.delay_text);
});
```

# Run tests
```bash
$ npm test
```

# Run Grunt (jslint, docs)
```bash
$ grunt
```

# Documentation
API documentation is built by ```grunt``` and stored in the ```public/docs``` directory

# License
BSD

# Contribute
All comments, patchs and pull requests are welcome, but please ensure you ran ```grunt``` without warnings before creating a pull request.
