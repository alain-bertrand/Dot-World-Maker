# Dot World Maker
Online web role playing game (RPG) engine let you build your own game directly from your browser. This is a complete and fully running engine, allowing to directly create a multi-player game running on any HTML5 browser (even mobile phones).

This is also the same base engine used on https://www.dotworldmaker.com

## Requirements
* Your server must have MySQL or MariaDB installed. Tp download it: https://downloads.mariadb.org/
* Node.JS installed (we tested it with v6.11). To download it: https://nodejs.org/en/download/

# Installation

## Quick start for Windows:
* Install node and MariaDb on your computer
* Clone or download the repository
* Run the "start_server.cmd" file and your engine should start (make sure you fulfill the requirements).

Later on you may still use "start_server.cmd" to run the engine

## Installation (manual installation)

### Setup
* Clone or download the repository
* Create a database on your MySQL or MariaDB and create a DB user for the engine
* delete the file must_install.txt
* Import the SQL statements from tables.txt into your database
* Edit the package.json file (config section)
* Using a command prompt install the needed packages: "npm install ." (this must be run within the directory where the package.json is)

### Running it
* Using a command prompt start the server: "node server.js"
* Using your browser connect to http://127.0.0.1:1337 or the port specified in the package.json

**Default user: admin password: admin**

# Changing the source code

## To edit the client or the server Code
* Edit the *.ts* files never the resulting *.js* as they will be overwitten when you compile the engine
* Use gulp with the task compile to compile once or the default task will watch the changes and compile when needed

## How to start developing
 * Install gulp-cli: npm install --global gulp-cli
 * Edit the needed TS files
 * Compile to JS: gulp compile:client compile:server

You may keep gulp monitoring the changes and compile as needed by just running "gulp default"

# Start working on your game

## How to create your grame
[Online documentation](https://www.dotworldmaker.com/Help/welcome.html)

## Demo game
[Try the demo](https://www.dotworldmaker.com/play.html?game=Demo&demo=true)

## Tutorials
* [Complete tutorial](https://www.dotworldmaker.com/Help/create_a_simple_game.html)
* [Get started (video)](https://youtu.be/nFm6rc4WsT8)
* [Code editor (video)](https://youtu.be/2sz4LMLjQAs)
* [Upload your own map art (video)](https://youtu.be/MCDd7sRQddQ)
