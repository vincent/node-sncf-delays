h1. SNCF-delays is a NodeJS tool to check french railways delays.

```javascript
var SNCF = require('sncf-delays');

SNCF.departuresDelaysAt("Orléans", function(err, delays) {
  var delay = delays[0];

  console.log("Toum Toum Tiïïiuuoummm ! " +
    "Le train numéro %s à detination de %s, prévu à %s quai %, aura un retard d'environ %s",
    delay.train_id,
    delay.to,
    delay.train_time,
    delay.train_deck,
    delay.delay_text);
});

```
