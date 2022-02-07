// ==UserScript==
// @name         Lstsim Commander
// @namespace    https://github.com/fellwell5/lstsim-commander
// @version      0.2
// @description  Leitstellenexperience für deinen lstsim
// @author       Matthias Schaffer
// @match        https://lstsim.de/
// @grant        none
// @require      http://localhost:3000/socket.io/socket.io.js
// ==/UserScript==

(function() {
    'use strict';

    $(function() {
        function uuidv4() {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
        }

        if(typeof username !== 'undefined'){
            let socket = io("http://localhost:3000", {
                transports: ['websocket'],
                query: {
                    application: "lstsim",
                    username: username
                }
            });

            let paused = undefined;
            let clock = undefined;

            console.log("Welcome @ the Push-Plugin, "+username+"!");
            setInterval(function(){
                let now = $("#clock").html();
                if (now != clock) {
                    clock = now;
                    socket.emit('clock', now);
                }
                if ($("#pause_layer").length) {
                    if (paused !== true) {
                        paused = true;
                        socket.emit('game-paused', true);
                    }
                } else {
                    if (paused !== false) {
                        paused = false;
                        socket.emit('game-paused', false);
                    }
                }
                $('button').each(function(i, obj) {
                    if($(obj).attr("action") === undefined){
                        if($(obj).attr("car") !== undefined) return false;
                        let shortcut = $(obj).attr("shortcut");
                        if(shortcut === "T" || shortcut === "J" || shortcut === "K"){
                            //console.log(obj);
                            if($(obj).attr("callid") === undefined){
                                let callid = uuidv4();
                                $(obj).attr("callid", callid);

                                console.log("New "+ shortcut +" ("+callid+")");
                                socket.emit('new-call', {type: shortcut, callid: callid});

                                $("button[callid="+callid+"]").click(function(){
                                    console.log("Button "+$(this).attr("callid")+" clicked!");
                                    socket.emit('closed-call', {callid: $(this).attr("callid")});
                                });
                            }
                        }
                    }
                });
            }, 1000);
        }
    });
})();