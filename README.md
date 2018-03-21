[![Build Status](https://travis-ci.org/izir-fr/www.svg?branch=master)](https://travis-ci.org/izir-fr/www)

# Event Izir App

This app use Node.js, Express, Passport and Mongoose.

### Version
1.1.0

### Installation

app requires [Node.js](https://nodejs.org/) v4+ to run.

```sh
$ npm install
```

```sh
$ npm start
```

### Utilisation

launch server
```sh
$ node app
```

### Publication

Install the Heroku CLI

```sh
$ heroku login
```

Clone the repository

```sh
$ heroku git:clone -a eventizir
$ cd eventizir
```


Deploy changes

```sh
$ git add .
$ git commit -am "make it better"
$ git push heroku master
```
