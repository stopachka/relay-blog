import express from 'express';
import fs from 'fs';
import graphqlHTTP from 'express-graphql';
import path from 'path';
import React from 'react';
import Schema from './data';

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: Schema,
  graphiql: true,
  formatError({message, locations, stack}) {
    return {message, locations, stack};
  },
}));

// ------------------------------------------------------------
// Static

app.get('/client.js', (req, res) => {
  res.sendFile('client.js', {root: 'build'});
});

app.get('/favicon.ico', (req, res) => {
  res.status(500).send('uh oh');
});

app.get('/:params?*', function(req, res) {
  res.status(200).send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script tpye="text/javascript">
          window.MTIConfig = {EnableCustomFOUTHandler: true};
        </script>
        <script
          type="text/javascript"
          src="http://fast.fonts.net/jsapi/15046032-4cb8-4f35-b794-7d6caf755c60.js">
        </script>
      </head>
      <body>
        <div id="react-root"></div>
        <script
          src="${
            // stopachka(TODO) ahh need a cfg, or inital state
            process.env.NODE_ENV === 'production'
              ? '../../client.js'
              : 'http://localhost:3000/build/client.js'
          }">
        </script>
      </body>
    </html>
  `);
});

console.log('listening!');
app.listen(process.env.PORT || 5000);
