# glance

DESCRIPTION:

glance is a small WIP project that I'm working on to gain more familiarity with working on express applications.
This project uses the PERN stack, although the react will have to come in the future as I still have a lot to learn.

TO BE DONE/ADDED:

- Move request handlers to routers
- Change API to be more RESTful
- Update site UI to be more original/creative
- Make own seed data
- Update site to reflect AJAX capabilities

* Profile page
* Login page
* Password encryption
* Share button?
* Ability to edit and delete posts/comments
* Images in posts and profile?

INSTALL:

- To use the project for yourself you will need PostgreSQL and Node.js installed prior.

1. Use npm install from the project folder to install the necessary packages.
2. Navigate to the lib folder to create the database.

- With PSQL installed, use "createdb glance" in the terminal to create the database called glance.
- Next, use the following three commands in order:
  - "psql glance < schema.sql"
  - "psql glance < users.sql"
  - "psql glance < seed-data.sql"

3. Finally run the program from app.js and you can access the site from "localhost:5500".
