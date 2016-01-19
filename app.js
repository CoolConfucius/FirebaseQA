'use strict';

var ref = new Firebase('https://qa2016.firebaseio.com/'); 
var qaRef = ref.child('qa'); 
var $newTitle, $newContent, $newTag, $body;
var editingQuestion = false; 
var editObj = {}; 
var isAdmin = false; 

$(document).ready(function(){
  $newTitle = $('#newTitle'); 
  $newContent = $('#newContent'); 
  $newTag = $('#newTag'); 
  $body = $('#body'); 
  $('#addQuestion').click(addQuestion); 
  $body.on('click', '.title', view);
  $body.on('click', '.addComment', addComment);

  $('#adminMode').click(adminMode);
  $body.on('click', '.editConfirm', confirm);

});





function addQuestion(){  
  console.log('begin add');
  var title = $newTitle.val();
  var content = $newContent.val();
  var tag = $newTag.val();
  var now = moment().format('DD-MM-YYYY'); 
  var comments = []; 
  console.log(now);
  $newTitle.val('');
  $newContent.val('');
  $newTag.val('');
  
  qaRef.push({
    title: title, 
    content: content, 
    date: now, 
    tag: tag, 
    comments: comments
  }); 
}

qaRef.on('value', function(snapshot) {
console.log('on vlau');
  var qaObject = snapshot.val(); 
  $body.empty(); 
  for (var key in qaObject) {

    if (qaObject.hasOwnProperty(key)) {
      var title = qaObject[key].title; 
      var content = qaObject[key].content; 
      var date = qaObject[key].date; 
      var tag = qaObject[key].tag; 
      var comments = qaObject[key].comments; 
      console.log("comments", comments);

      // visible: 
      var $item = $('<div>').addClass('item row').data('fbid', key);
      var $visible = $('<div>').addClass('visible row');
      var $title = $('<span>').addClass('title col-sm-7 btn btn-default').text(title); 
      var $date = $('<span>').addClass('date col-sm-3').text(date); 
      $visible.append($title, $date); 

      // view: 
      var $view = $('<div>').addClass('view row').hide();
      var $content = $('<div>').addClass('content').text(content); 
      $view.append($content);
      var $comments = $('<ul>').addClass('comments'); 
      for (var key in comments) {
        if (comments.hasOwnProperty(key)) {
          var entry = comments[key]; 
          var $comment = $('<li>').addClass('comment row').text(entry); 
          $comments.append($comment); 
        }
      }
      $view.append($comments); 
      
      var $inputComment = $('<input>').addClass('inputComment'); 
      var $addComment = $('<button>').addClass('addComment btn btn-success').text('Add Comment'); 
      $view.append($inputComment, $addComment);

      // admin 
      var $admin = $('<div>').addClass('admin row').hide();
      var $remove = $('<button>').addClass('btn btn-danger col-sm-2 remove').text('Remove').click(remove); 
      var $edit = $('<button>').addClass('btn btn-primary col-sm-2 edit').text('Edit').click(edit); 
      $admin.append($remove, $edit); 

      $item.append($visible, $admin, $view);
      $body.append($item); 
    };
  };

});

function view(){
  var $this = $(this); 
  var $parent = $this.closest('.item'); 
  if ($parent.hasClass('viewing')) {
    $parent.children('.view').hide(); 
    $parent.removeClass('viewing'); 
  } else {
    $parent.addClass('viewing'); 
    $parent.children('.view').show(); 
    
  }
}

function addComment(){
  var $this = $(this); 
  var $view = $this.parent(); 
  var $id = $view.parent().data('fbid'); 
  var $input = $view.children('.inputComment').val(); 
  // $parent.append($input);
  console.log(qaRef.child($id).child('title'), "dfjdkls" );
  console.log(qaRef.child($id).child('comments') );
  // if (!qaRef.child($id).comments) { qaRef.child($id).update({ comments: '' })};
  qaRef.child($id).child('comments').push( $input ); 
    // contactListRef.child($id).comments.push($input)

  
  // contactListRef.child($id).


}





function remove(){
  var $this = $(this); 
  var $id = $this.closest('.item').data('fbid'); 
  qaRef.child($id).remove(); 
}


function adminMode(){
  isAdmin = !isAdmin; 
  if (isAdmin) {
    $body.find('.admin').show(); 
  } else {
    $body.find('.admin').hide(); 
  }
}




function closeEditForm(){
  var $item = $(this).closest('item'); 
  $item.removeClass('isEditing');
  $item.find("#editForm").remove();
  $item.find("#editForm2").remove();
};

function confirm(){
  var $this = $(this); 
  var $item = $this.closest('.item'); 
  var $id = $item.data('fbid'); 
  var editObj = {};
  editObj.title = $item.find('.editTitle').val(),
  editObj.content = $item.find('.editContent').val(),
  editObj.tag = $item.find('.editTag').val()
  
  
  console.log("debugger", editObj);
  console.log("debugger", qaRef);
  console.log("debugger", qaRef.child(editObj.id));
  qaRef.child($id).update({
    title: editObj.title,
    content: editObj.content,
    tag: editObj.tag
  });   
  closeEditForm(); 
  
};






function edit(){
  var $this = $(this); 
  var $item = $this.closest('.item'); 
  var $id = $item.data('fbid'); 

  if ($item.hasClass("isEditing")) {
    closeEditForm(); 
  } else if(!editingQuestion) {
    editingQuestion = true; 
    var editObj = {}; 
    editObj.id = $id; 
    $item.addClass("isEditing");
    
    editObj.title = $item.find(".title").text(); 
    editObj.content = $item.find(".content").text(); 
    editObj.tag = $item.find(".tag").text(); 

    var $editForm = $('<div>').addClass('row editing').attr("id", "editForm");
    $editForm.append($('<span>').addClass('col-sm-1').text('title:'));
    $editForm.append($('<input>').addClass('col-sm-4 editTitle').attr({type: "text", id: "edittitle", value: editObj.title} ) );
  
    $editForm.append($('<span>').addClass('col-sm-1').text('tags:'));
    $editForm.append($('<input>').addClass('col-sm-5 editTag').attr({type: "text", id: "edittag", value: editObj.tag} ) );
    
    var $editForm2 = $('<div>').addClass('row editing').attr("id", "editForm2");
    $editForm2.append($('<span>').addClass('col-sm-1').text('content:'));
    $editForm2.append($('<input>').addClass('col-sm-6 editContent').attr({type: "text", id: "editcontent", value: editObj.content} ) );

    $editForm2.append($('<div>').addClass('col-sm-1 btn btn-default editConfirm').text('Confirm').click(confirm) );
    $item.append($editForm, $editForm2);    
  }
}
