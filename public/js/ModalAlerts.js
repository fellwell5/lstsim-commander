/*  ModalAlerts
 *
 *  Generates a bootstrap modal which is removed from body after beeing closed.
 *  Usage: ModalA.newModal("Title", "Description", function(){ alert("This is a callback function.") });
 *  Usage: ModalA.newModal("Title", "<p>I can use <strong>HTML</strong> here!</p>", function(id){ alert("Modal with ID "+id+" closed.") });
 *
 *  @author Matthias Schaffer @fellwell5
 *
 */
var ModalA = class ModalAlerts {
    static idGenerator() {
      var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      };
      return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    static isHTML(string) {
      return /^<.*?>$/.test(string) && !!$(string)[0];
    }
    static newModal(title, text, callback = null){
      var id = this.idGenerator();
      if(!this.isHTML(text)){ text = "<p>"+text+"</p>"; }
      let template = '<div id="'+id+'" class="modal" tabindex="-1" role="dialog">'+
        '<div class="modal-dialog" role="document">'+
          '<div class="modal-content">'+
            '<div class="modal-header">'+
              '<h5 class="modal-title">'+title+'</h5>'+
              '<button type="button" class="close" data-dismiss="modal" aria-label="Schließen">'+
                '<span aria-hidden="true">&times;</span>'+
              '</button>'+
            '</div>'+
            '<div class="modal-body">'+
              text+
            '</div>'+
            '<div class="modal-footer">'+
              '<button type="button" class="btn btn-secondary" data-dismiss="modal">Schließen</button>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>';
      $("body").append(template);
      $("#"+id).modal("show");
      $("#"+id).on("hidden.bs.modal", function (e) {
        if(callback !== null){ callback(id); }
        $("#"+id).off().remove();
      });
      return id;
    }
  }