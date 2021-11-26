$(function () {
    var funkspruch = new Howl({
        src: ['/sounds/funkspruch.ogg'],
        html5: true
    });
    var sprechwunsch = new Howl({
        src: ['/sounds/sprechwunsch.ogg'],
        html5: true
    });
    var telefon = new Howl({
        src: ['/sounds/telefon.ogg'],
        html5: true
    });

    let socket = io({
        query: {
            application: "commander"
        }
    });

    let lstsim_connected = null;
    let calls = {};
    let count_calls = 0;
    
    let AppToken = Cookies.get('AppToken');
    if(AppToken == undefined){
        AppToken = Math.random().toString(36).substr(2);
        Cookies.set('AppToken', AppToken);
    }
    let NotificationsEnabled = Cookies.get('NotificationsEnabled');
    if(Cookies.get('NotificationsEnabled') == undefined){
        NotificationsEnabled = false;
        Cookies.set('NotificationsEnabled', false);
    }
    if (NotificationsEnabled == "true") {
        $("#notificationClientToggle").addClass("fa-bell-slash").attr("title", "Auf diesem Gerät sind Benachrichtigungen aktiviert");
    } else {
        $("#notificationClientToggle").addClass("fa-bell").attr("title", "Auf diesem Gerät sind Benachrichtigungen deaktiviert");
    }
    socket.on('send-notification', function(data){
        console.log(data);
        if (NotificationsEnabled == "true") {
            switch (data.call_type) {
                case "T":
                    telefon.play();
                    break;
                case "J":
                    sprechwunsch.play();
                    break;
                case "K":
                    funkspruch.play();
                    break;
            }
        }
    });

    const AppCont = $("#ApplicationContainer");
    let widgets = undefined;
    let layout = undefined;
    
    AppCont.html("");
    $.get( "/config/widgets", function( data ) {
        widgets = data;
        $.get( "/config/layout", function( data ) {
            layout = data;
            for (var row_key of Object.keys(layout.rows)) {
                let row = layout.rows[row_key].row;
                row_key = "row-" + row_key;
                let classes = ((Array.isArray(row.class)) ? row.class : []);
                if(!classes.includes("row")) classes.push("row");

                if(row.col.length > 0){
                    AppCont.append($("<div>", {class: classes.join(" "), id: row_key}));
                    for (var col_key of Object.keys(row.col)) {
                        let col = row.col[col_key];
                        col_key = row_key + "-" + col_key;

                        let classes = ((Array.isArray(col.class)) ? col.class : []);
                        if(!classes.includes("col")) (col.colspan != undefined) ? "col-"+col.colspan : "col";

                        $("#" + row_key).append($("<div>", {class: classes.join(" "), id: col_key}));
                        if(col.element.type == undefined) continue;
                        switch (col.element.type) {
                            case "label":
                                let classes = ((Array.isArray(col.element.class)) ? col.element.class : []);
                                $("#" + col_key).html(
                                    $("<h3>", {class: classes.join(" ")})
                                    .html(col.element.text)
                                );
                              break;
                            case "widget":
                                if(widgets[col.element.id] != undefined){
                                    let widget = widgets[col.element.id];
                                    switch (widget.type) {
                                        case "btn":
                                            let classes = ((Array.isArray(col.element.class)) ? col.element.class : []);
                                            if(Array.isArray(widget.class)) classes.concat(widget.class);
                                            if(!classes.includes("btn")) classes.push("btn");
                                            if(!classes.includes("widget-btn")) classes.push("widget-btn");

                                            $("#" + col_key).html(
                                                $("<button>", {
                                                    type: "button",
                                                    class: classes.join(" "),
                                                    title: widget.description,
                                                    "data-type": "widget",
                                                    "data-widgetid": col.element.id
                                                })
                                                .html(widget.name)
                                            );
                                        default:
                                            continue;
                                    }
                                }else{
                                    continue;
                                }
                              break;
                            default:
                              continue;
                          }
                    }
                }
            }
        }, "json" );
    }, "json" );

    $(AppCont).on("click", "button.widget-btn", function(){
        let widgetid = $(this).data("widgetid");
        if(widgetid == undefined) return;
        if(widgets[widgetid] === undefined) return;
        let widget = widgets[widgetid];

        socket.emit('widget-called', widgetid);
    });

    $.get( "/stats", function( data ) {
        $("#footerText")
            .html("")
            .append( "<span title=\"Version\"><i class=\"fas fa-code-branch\"></i> " + data.version + "</span>")
            .append( "<span title=\"Verbundene Clients\" class=\"ml-3 cursor-pointer\" id=\"footer-connected-clients\"><i class=\"far fa-eye\"></i> " + data.connected_clients + "</span>");
        if (data.lstsim_socket == null) {
            lstsim_connected = false;
        } else {
            lstsim_connected = true;
        }

        if (lstsim_connected) {
            let count_calls = data.calls.T + data.calls.J + data.calls.K;
            $("#footerText").append( "<span title=\"Anrufe\" class=\"float-right cursor-pointer\" id=\"footer-phone-calls\"><i class=\"fas fa-phone\"></i> "+(count_calls)+"</span>");
        } else {
            $("#footerText").append( "<span title=\"Nicht verbunden\" class=\"float-right cursor-pointer\" id=\"footer-phone-calls\"><i class=\"fas fa-phone-slash\"></i></span>");
        }

        if (data.notifications_enabled) {
            $("#notificationToggle").addClass("far fa-flag").attr("title", "Benachrichtigungen sind aktiviert");
        } else {
            $("#notificationToggle").addClass("fas fa-flag").attr("title", "Benachrichtigungen sind deaktiviert");
        }

        if (data.game_paused) {
            $("body").append('<div id="pause_layer"><div class="background"></div><h1>Spiel pausiert</h1><h3>Setze das Spiel im Browser fort</h3></div>');
        }
    }, "json" );

    socket.on('connected_clients', function(connected_clients){
        $("#footer-connected-clients").html("<i class=\"far fa-eye\"></i> " + connected_clients);
        if ($(".modal-title").html() == "Verbundene Clients") {
            let modal = $(".modal.show");
            $(modal).modal('hide');
            $("#footer-connected-clients").trigger("click");
        }
    });
    
    $("#footerText").on("click", "#footer-connected-clients", function(){
        $.get( "/connected_clients", function( data ) {
            let clients = "";
            for (var key of Object.keys(data)) {
                date = moment(data[key]["connected"]).format('DD.MM.YYYY HH:mm:ss');
                clients += "<li><strong>"+data[key]["clientIp"]+"</strong> ("+data[key]["application"]+") verbunden um: "+date+" <small>"+data[key]["socketId"]+"</small></li>";
            }
            ModalA.newModal("Verbundene Clients", "<p>Folgende Clients sind verbunden:</p><ul>"+clients+"</ul>");
        }, "json" );
    });

    let phone_call_dialog = null;
    $("#footerText").on("click", "#footer-phone-calls", function(){
        phone_call_dialog = ModalA.newModal(
            "Anrufe in Wartestellung",
            "<p>Daten werden geladen...</p>",
            function(){
                phone_call_dialog = null;
            }
        );
        $("div.modal-footer").prepend('<button type="button" class="btn btn-primary" id="reset-calls-btn";>Anrufe zurücksetzen?</button>');
        $("#reset-calls-btn").click(function(){
            if(confirm('Telefonanrufe zurücksetzen?')) {
                socket.emit('reset-calls');
            }
        });
    });

    socket.on('lstsim-connected', function(data){
        lstsim_connected = true;
        $("#footer-phone-calls").html("<i class=\"fas fa-phone\"></i> ");
    });
    socket.on('lstsim-disconnected', function(data){
        lstsim_connected = false;
        $("#footer-phone-calls").html("<i class=\"fas fa-phone-slash\"></i> ");
    });

    socket.on('waiting-calls', function(data){
        calls = data;
        count_calls = data.T + data.J + data.K;
        if (lstsim_connected) {
            $("#footer-phone-calls").html("<i class=\"fas fa-phone\"></i> " + count_calls);
        }
    });

    socket.on('game-paused', function(paused){
        if (paused) {
            if (!$("#pause_layer").length) {
                $("body").append('<div id="pause_layer"><div class="background"></div><h1>Spiel pausiert</h1><h3>Setze das Spiel im Browser fort</h3></div>');
            }
        } else {
            if ($("#pause_layer").length) {
                $("#pause_layer").remove();
            }
        }
    });

    $("#notificationToggle").click(function(){
        socket.emit('toggle-notifications');
    });
    socket.on('notifications', function(notifications_enabled){
        if (notifications_enabled) {
            $("#notificationToggle").removeClass("fas").addClass("far fa-flag").attr("title", "Benachrichtigungen sind aktiviert");
        } else {
            $("#notificationToggle").removeClass("far").addClass("fas fa-flag").attr("title", "Benachrichtigungen sind deaktiviert");
        }
    });

    $("#notificationClientToggle").click(function(){
        if (NotificationsEnabled == "true") {
            $("#notificationClientToggle").removeClass("fa-bell-slash").addClass("fa-bell").attr("title", "Auf diesem Gerät sind Benachrichtigungen deaktiviert");
            NotificationsEnabled = "false";
        } else {
            $("#notificationClientToggle").removeClass("fa-bell").addClass("fa-bell-slash").attr("title", "Auf diesem Gerät sind Benachrichtigungen aktiviert");
            NotificationsEnabled = "true";
        }
        Cookies.set("NotificationsEnabled", NotificationsEnabled);
    });

    if (screenfull.isEnabled) {
        //screenfull.request();
        $("#fullscreenToggle").click(function(){
            if(screenfull.isFullscreen){
                screenfull.exit();
                $(this).removeClass("fa-compress").addClass("fa-compress-arrows-alt");
            }else{
                screenfull.request();
                $(this).removeClass("fa-compress-arrows-alt").addClass("fa-compress");
            }
        });

        $(document).bind("fullscreenchange", function() {
            if(screenfull.isFullscreen){
                $("#fullscreenToggle").removeClass("fa-compress").addClass("fa-compress-arrows-alt");
            }else{
                $("#fullscreenToggle").removeClass("fa-compress-arrows-alt").addClass("fa-compress");
            }
        });
    }else{
        $("#fullscreenToggle").hide();
    }

    setInterval(function(){
        if (calls != {}) {
            if (calls.T > 0) {
                html = widgets["anrufannehmen"]["name"]+' <span class="badge badge-light">'+calls.T+'</span>';
                if ($("button[data-widgetid=anrufannehmen]").html() != html) {
                    $("button[data-widgetid=anrufannehmen]").addClass("glowing").html(html);
                }
            } else {
                if ($("button[data-widgetid=anrufannehmen]").hasClass("glowing")) {
                    $("button[data-widgetid=anrufannehmen]").removeClass("glowing").html(widgets["anrufannehmen"]["name"]);
                }
            }

            if (calls.J > 0) {
                html = widgets["sprechaufforderung"]["name"]+' <span class="badge badge-light">'+calls.J+'</span>';
                if ($("button[data-widgetid=sprechaufforderung]").html() != html) {
                    $("button[data-widgetid=sprechaufforderung]").addClass("glowing").html(html);
                }
            } else {
                if ($("button[data-widgetid=sprechaufforderung]").hasClass("glowing")) {
                    $("button[data-widgetid=sprechaufforderung]").removeClass("glowing").html(widgets["sprechaufforderung"]["name"]);
                }
            }

            if (calls.K > 0) {
                html = widgets["kommen"]["name"]+' <span class="badge badge-light">'+calls.K+'</span>';
                if ($("button[data-widgetid=kommen]").html() != html) {
                    $("button[data-widgetid=kommen]").addClass("glowing").html(html);
                }
            } else {
                if ($("button[data-widgetid=kommen]").hasClass("glowing")) {
                    $("button[data-widgetid=kommen]").removeClass("glowing").html(widgets["kommen"]["name"]);
                }
            }
        }

        if (phone_call_dialog != null) {
            $.get( "/calls", function( data ) {
                let calls = "";
                Object.entries(data.calls).forEach(([id, call]) => {
                    date = moment(call["connected"]).format('HH:mm:ss');
                    //calls += "<li><strong>"+call.type_long+"</strong> gestartet um: "+date+" <small>"+call.wait_seconds+" Sekunden</small></li>";
                    calls += "<p><small class='text-muted'>"+date+"</small> <strong>"+call.type_long+"</strong> <small> wartet seit "+call.wait_seconds+" Sekunden</small></p>";
                });
                if (calls == "") {
                    calls = "<p>Keine Anrufe in Wartestellung.</p>";
                }
                $("div.modal-body").html(calls);
            }, "json" );
        }
    }, 1000);
});