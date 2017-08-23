# PassPass

Pass Pass is a digital marketplace to allow ClassPass users to sell extra passes. 

Users can post:
* Number of passes they have available for sale 
* Price per pass
* Date range passes are valid
* Excluded studio locations, where they have already used their membership, as ClassPass restricts visits to the same studio per subscription month

Users can browse other user’s passes for sale, and filter by those same criteria; buyers can contact sellers by email to discuss the purchase.

## V1 Team

  - [Cody](https://github.com/cody-unger)
  - [Kelly](https://github.com/whithang)
  - [Martin](https://github.com/mkchang)
  - [Michael](https://github.com/mbntex)

## V2 Team

  - [Daniel](https://github.com/ddarrach314)
  - [Easak]()
  - [Ryan]()
  - [Andrew]()

## Table of Contents

1. [Usage](#usage)
    1. [App](#app)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Testing](#testing)
    1. [Roadmap](#roadmap)
1. [Contributing](#contributing)
1. [Deployment](#deployment)

## Usage

### App
  - [v1](https://hungryhippopasspass.herokuapp.com/)
  - [v2]()


## Requirements

- Node 6.11.x
- npm 3.10.x
- MySQL 5.7

## Development

### Installing Dependencies
Fork and clone the repo. From within the root directory:
https://github.com/TheRealHungryHippos/PassPass

```sh
npm install
```

### Email Authentication
Use a LocalStrategy to utilize email authentication and create sessions and cookies for your users. More information can be found in the Passport documentation [http://passportjs.org/docs/overview]

You will need to add a `session.config.js` file for session encryption key, use `session.example.config.js` as a template.

### Facebook Authentication - NOT CURRENTLY IMPLEMENTED BUT INFRASTRUCTURE IS THERE
In order to use Facebook authentication, you must first create an app at Facebook Developers [https://developers.facebook.com/]. When created, an app is assigned an App ID and App Secret. Your application must also implement a redirect URL, to which Facebook will redirect users after they have approved access for your application. Save the App ID and App Secret in a config file.

Add `facebook.config.js` file for facebook session keys, use `facebook.example.config.js` as a template.

Additional information about this can be found in the Passport documentation [http://passportjs.org/docs/facebook]

### Database and Other Setups
Install the database by running the `schema.sql` file with instructions at the top of that file

Launch webpack with `npm run react-dev`.
Launch the server with `npm run server-dev`.
Go to http://127.0.0.1:3000/ in your browser to run locally
If you need to change the port, do that in the server/index.js file at the bottom
Production ENV configuration variables are maintained on Heroku

### Testing

Tests are done with [Jest](https://facebook.github.io/jest) and [Enzyme](http://airbnb.io/enzyme/index.html). Other packages used:
- [supertest](https://www.npmjs.com/package/supertest)
- [React Test Utilities](https://facebook.github.io/react/docs/test-utils.html)

Run tests in repo root folder with
```sh
npm test
```

Test results will be output to the terminal window.

Tests are split into 3 folders: react-client, server, and database, to match the equivalent folders with JavaScript source code.

Checking test coverage is TBD.

### Roadmap

View the project roadmap on Trello [here](https://trello.com/b/Rsxkw459/passpass)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Deployment
To deploy on Heroku:

Add ClearDB's addon, use the free ignite database. This will automatically add a `CLEARDB_DATABASE_URL` config variable. This is in the format of: 

`mysql://<username>:<password>@<hostname>/<database name>?reconnect=true`

To add the schema to ClearDB, run the following command in your terminal:
```bash
mysql -h <hostname> -u <username> -p <database name> < schema.sql
```
it will then prompt you for your password. You can log in to your data base by running only `mysql -h <hostname> -u <username> -p <database name>`. You will have to `use <database name>` after logging in. **Note** this means your database name is different than you may be using in your `schema.sql` for local development.

Additional config variables to be set are:
- FB_CALLBACKURL
- FB_CLIENTID
- FB_CLIENTSECRET
- SESSION_SECRET

These replace the two config files used for local develpoment, `facebook.config.js` and `session.config.js`. 

Set config variables for both production and staging parts of your heroku pipeline. Review Apps will inherit config vars from your chosen app, but the `app.json` in your root folder must specify that these variables are to be inherited. To do so, mark those variables are required, but do not provide in `app.json`.