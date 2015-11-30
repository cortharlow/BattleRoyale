///// control flow between rooms, render chat, etc /////////////////////////////

// 'use strict'    //// why is this commented out?
console.log('script loaded');
///// listens and emits client-side - meat of socket in backend, just require in front end
var socket = io(),
    doc    = document,
    myUser;



$(function() {

   // mapping divs to variables for mass attaching/detaching
   var containerDiv  = $('.container'),
       landingPage   = $('#login-signup'),
       bgVideo       = $('#vid-div'),

       // navigation bars
       landingNav    = $('#login-links'),
       inGameNav     = $('#top-nav'),

       // chatting
       chatInput     = $('#text-input'),
       chatWindow    = $('#chat-window'),

       // mini-game
       gameContainer = $('#app'),
       lobby         = $('#lobby'),
       game          = $('.game');

	//these divs will be hidden at the start

   gameContainer.detach()
   lobby.detach()
   inGameNav.detach()

	$('#createuserpage').hide();
   $('#authenticate-page').hide(); /////
   $('.loginform').hide()


	$('.login-link').click(function() {
		// $('#loginpage').show(); ///// commented out to render authenticate login and test
      $('#authenticate-page').show();
      $('#authenticate-login-form').show(); ///// added to render authenticate login and test
      $('#createuserpage').hide();
   });

   // create new user - POST http://localhost:3000/user/signup
   $('.createuser-link').click(function() {
     $('#authenticate-page').hide();
     $('#createuserpage').show();
   });

   $('#create-user-submit-button').click(function() {
      var username = $('#login-new').val();
      var email = $('#email-new').val();
      var password = $('#password-new').val();
      var newUserData = {
         username: username,
         email: email,
         password: password
      }
      $.ajax({  ///// executes user_controller.js create function
         url: "/user/signup",
         method: "POST",
         data: newUserData
      }).done(goToLogin); //// show login page
   });


   var goToLogin = function() {
      $('#createuserpage').hide();
      $('#authenticate-page').show();
      $('#authenticate-login-form').show(); ///// add login submit button to index.html
   }

   //// authenticate - POST http://localhost:3000/user/authenticate ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   $('#authenticate-submit-button').click(function() {
      // console.log('clicked');
      var username = $('#authenticate-username-input').val();
      var password = $('#authenticate-password-input').val();
      var userLoginData = {
         username: username,
         password: password
      }
      // console.log(userLoginData);
      $.ajax({ ///// executes user_controller.js auth function
         url: "/user/authenticate",
         method: "POST",
         data: userLoginData
      }).done(goToLobby)

      // console.log(username + 'this should be username');
      myUser = username;
      socket.emit('add user', username);
      $('#authenticate-username-input').val('');
   }); // end of authenticate submit button jQuery call

	$('#compose').keypress(function(event) {
		if(event.keyCode === 13) {
			var message = $('#compose').val();

			socket.emit('send message', {name: myUser, message: message});
			$('#compose').val('');
         chatWindow.animate({scrollTop:$(chatWindow)[0].scrollHeight}, 1000);
		}
	});

   $('#send-message').click(function(event){
      var message = $('#compose').val();

      socket.emit('send message', {name: myUser, message: message});
      $('#compose').val('');
      chatWindow.animate({scrollTop:$(chatWindow)[0].scrollHeight}, 1000);
   })
   // CAN'T ASSIGN AN EVENT SO SOMETHING THAT'S DETACHED!
   // I WAS A DUM DUM -rachel :(
   chatInput.detach()
   chatWindow.detach()

// STARTING THE GAME ONCE WE ARE LOGGED IN =====================================

   var goToLobby = function() {
     landingPage.detach()
     landingNav.detach()
     pickAroom(getRoom())
   }

   var pickAroom = function(callback){
      console.log('queried database for a random room');
      var num = Math.ceil(Math.random()*7) // seven rooms that are not lobby
      $.ajax({ ///// executes user_controller.js auth function
         url: "/room/"+num,
         method: "POST",
         data: num
      }).done(function(){
         callback(result)
      })
   }

   var startGame = function(){
      inGameNav.appendTo(containerDiv)
      chatWindow.appendTo(containerDiv)
      gameContainer.appendTo(containerDiv)
      chatInput.appendTo(containerDiv)
      let data = {
         room: roomName,
      }
      socket.emit('send message', data);
   }



   // SOCKET EVENTS
   socket.on('user joined', function(users) {
   	var usersList = $('#usernames');
   	usersList.empty();
   	users.forEach(function(user) {
   		var userElement = $('<li>');
   		userElement.text(user.name);
   		usersList.append(userElement);
   	});
   });

   socket.on('send message', function(data) {
   	var chatList = $('#messages');
   	var message = $('<li>');
   	message.text(data.name + " : " + data.message);
   	chatList.append(message);
   });

   socket.on('start game', function(data) {
      // use data to populate divs
      // remove loading screen
      // setTimer()
   });
})
