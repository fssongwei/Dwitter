## Introduction

Dwitter is a Twitter-like social media web app written in Javascript. The name "Dwitter" stands for "David's Twitter". Users can post their thoughs, follow other user, comment and like other user's posts.

[Live Demo](http://app.david916.com:3000)  
[Source Code](https://github.com/fssongwei/Dwitter)

<img src="https://i.loli.net/2020/07/19/t6rFGl1UMuzXiDE.png" alt="MainPage.png" style="height: 300px;" /><img src="https://i.loli.net/2020/07/19/92B5iIvxoyrCZtP.png" alt="profilePage.png" style="height: 300px;" />
<img src="https://i.loli.net/2020/07/19/TPX9Dju47AUfFdc.png" alt="followingPage.png" style="height: 300px;" /><img src="https://i.loli.net/2020/07/19/34NcB6xySXZwfdi.png" alt="loginPage.png" style="height: 300px;" />



The app is built on Node.js with Express. Other technologies and library using in this project are listing below: 

**UI Library**: MDUI

**Database**: MongoDB, Mongoose

**Authentication**: passport.js, bcrypt, express-session, express-flash



## Updates

##### 2020.7.16 Version 1.0

(The app is officially for public testing)

1. Improve UI with MDUI (Material Design UI)
2. Add following & unfollowing features
3. Add like & unlike features
4. Implement express-flash to show flash message



##### 2020.7.15

1. Authentication with passport.js
2. Refactor the code



##### 2020.7.14

1. Initialize the project by setting up the routers and database models
2. Add Basic UI with HTML & CSS
3. Add posts & comments create and delete features



##### To-do List

Other features comming. If you have any idea, send email to ws446@cornell.edu

1. Implement photo library for user to upload their photos
2. Display the number of favorite for each post
3. Implement google / facebook login
4. User can change their own avatars
5. Routers refactor
