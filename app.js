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
  $body.on('click', '.addAnswer', addAnswer);

  $('#adminMode').click(adminMode);
  $('#help').click(function(){alert("Enter a title and content for your question and hit submit. Give a tag to help users now what your question is about. To view the content of a question and answer it, click on its title.")});

});



function addQuestion(){  
  if (!$newTitle.val()) { alert("Enter a title for your question."); return; };
  if (!$newContent.val()) { alert("Enter content for your question."); return; };
  var title = $newTitle.val();
  var content = $newContent.val();
  var tag = $newTag.val();
  var now = moment().format('DD-MM-YYYY'); 
  var answers = []; 
  console.log(now);
  $newTitle.val('');
  $newContent.val('');
  $newTag.val('');
  
  qaRef.push({
    title: title, 
    content: content, 
    date: now, 
    tag: tag, 
    answers: answers
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
      var answers = qaObject[key].answers; 

      // visible: 
      var $item = $('<div>').addClass('item row').data('fbid', key);
      var $visible = $('<div>').addClass('visible row');
      var $title = $('<span>').addClass('title col-sm-6 btn btn-primary').text(title); 
      var $date = $('<span>').addClass('date col-sm-3').text(date); 
      var $tag = $('<span>').addClass('tag col-sm-3').text(tag)
      $visible.append($title, $date, $tag); 

      // view: 
      var $view = $('<div>').addClass('view row').hide();
      var $content = $('<div>').addClass('content').text('Q: ', content); 
      $view.append($content);
      var $answers = $('<ul>').addClass('answers').text('answers:'); 
      for (var key in answers) {
        if (answers.hasOwnProperty(key)) {
          var entry = answers[key]; 
          var $answer = $('<li>').addClass('answer row').text(entry); 
          $answers.append($answer); 
        }
      }
      $view.append($answers); 
      
      var $inputAnswer = $('<input>').addClass('inputAnswer col-sm-offset-1'); 
      var $addAnswer = $('<button>').addClass('addAnswer btn btn-success col-sm-offset-1').text('Add answer'); 
      $view.append($inputAnswer, $addAnswer);

      // admin 
      var $admin = $('<div>').addClass('admin row').hide();
      var $remove = $('<button>').addClass('btn btn-danger col-sm-2 remove').text('Remove').click(remove); 
      $admin.append($remove); 

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

function addAnswer(){
  var $this = $(this); 
  var $view = $this.parent(); 
  var $id = $view.parent().data('fbid'); 
  var $input = $view.children('.inputAnswer').val(); 
  
  qaRef.child($id).child('answers').push( $input ); 
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