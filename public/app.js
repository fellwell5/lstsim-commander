$(function () {
    let socket = io();
    
    let AppToken = Cookies.get('AppToken');
    if(AppToken == undefined){
        AppToken = Math.random().toString(36).substr(2);
        Cookies.set('AppToken', AppToken);
    }

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
                    AppCont.append($("<div>", {
                        class: classes.join(" "),
                        id: row_key,
                        height: ((row.height != undefined) ? row.height : '')
                    }));
                    for (var col_key of Object.keys(row.col)) {
                        let col = row.col[col_key];
                        col_key = row_key + "-" + col_key;

                        let classes = ((Array.isArray(col.class)) ? col.class : []);
                        console.log(col, (col.colspan != undefined) ? "col-"+col.colspan : "col");
                        if(!classes.includes("col")) classes.push((col.colspan != undefined) ? "col-"+col.colspan : "col");

                        $("#" + row_key).append($("<div>", {class: classes.join(" "), id: col_key}));
                        console.log(col);
                        if(col.element != undefined){
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
                                        console.log(widget);
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
                                        }
                                    }else{
                                    }
                                break;
                                default:
                                continue;
                            }
                        }
                    }
                }
            }
        }, "json" );
    }, "json" );

    $(AppCont).on("click", "button.widget-btn", function(){
        $(this).blur();
        let widgetid = $(this).data("widgetid");
        if(widgetid == undefined) return;
        if(widgets[widgetid] === undefined) return;
        let widget = widgets[widgetid];

        console.log(widget);
        socket.emit('widget-called', widgetid);
    });

    $.get( "/stats", function( data ) {
        $("#footerText")
            .html("")
            .append( "<span title=\"Version\"><i class=\"fas fa-code-branch\"></i> " + data.version + "</span>")
            .append( "<span title=\"Verbundene Benutzer\" class=\"ml-3\" style=\"cursor: pointer;\" id=\"footer-connected-users\"><i class=\"far fa-eye\"></i> " + data.connected_users + "</span>");
    }, "json" );

    socket.on('connected_users', function(connected_users){
        $("#footer-connected-users").html("<i class=\"far fa-eye\"></i> " + connected_users);
        if($(".modal-title").html() == "Verbundene Benutzer"){
            let modal = $(".modal.show");
            $(modal).modal('hide');
            $("#footer-connected-users").trigger("click");
        }
    });

    socket.on('client_reload', function(connected_users){
        $.loadingBlockShow({
            imgPath: '/img/loading.gif',
            text: '<strong>Verbindung zum Server wird neu aufgebaut!</strong><br>warten...'
        });
        setInterval(function(){
            location.reload();
        }, 1500);
    });

    socket.on('connect', () => {
        $.loadingBlockHide();
    });
    //preload disconnected-animation
    $('<img/>')[0].src = '/img/disconnected-animation.gif';
    socket.on('disconnect', () => {
        $.loadingBlockShow({
            imgPath: '/img/disconnected-animation.gif',
            text: '<strong>Verbindung zum Server getrennt!</strong><br>wiederverbinden...',
            style: {
                color: '#eee',
                position: 'fixed',
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, .8)',
                left: 0,
                top: 0,
                zIndex: 10000
            }
        });
    });
    
    $("#footerText").on("click", "#footer-connected-users", function(){
        $.get( "/connected_users", function( data ) {
            let clients = "";
            for (var key of Object.keys(data)) {
                date = moment(data[key]["connected"]).format('DD.MM.Y H:m:s');
                clients += "<li>"+data[key]["clientIp"]+" verbunden um: "+date+" <small>"+data[key]["socketId"]+"</small></li>";
            }
            ModalA.newModal("Verbundene Benutzer", "<p>Folgende Benutzer sind verbunden:</p><ul>"+clients+"</ul>");
        }, "json" );
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
});