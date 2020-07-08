/*  <!-- Plug-in Sortable -->
  <script>*/

      // INITIALIZATION

      // Checkboxes
      CHECK = 'https://mima.f15.dev/static/mima/img/todo-checked.png'
      UNCHECK = 'https://mima.f15.dev/static/mima/img/todo-unchecked.png'

      // TASKS DESCRIPTION EDITABILITY

      // Enter tasks description edit mode on double click
      $('.editable').dblclick(function () {
          $(this).prop("contenteditable", true).focus();
      });

      // Enter tasks description edit mode on double tap (mobile)
      $('.editable').on('doubletap', function () {
          $(this).prop("contenteditable", true).focus();
      });

      // Tur off tasks description edit mode on mouse leave
      $('.editable').mouseleave(function () {
          $(this).prop("contenteditable", false).focus();
      });

      // Tur off tasks description edit mode on "Enter" press
      $('.editable').keypress(function (event) {
          var keycode = (event.keyCode ? event.keyCode : event.which);
          if(keycode == '13') $(this).prop("contenteditable", false).focus();
      });

      // TASKS CHECK BOXES CLICKS (CHECK / UNCHECK)

      // Once checkbox is clicked
      $('.todocheckbox').click(function () {
          // replace one icon with an other (CHECK <=> UNCHECK) and reverse
          $(this)[0].src = ($(this)[0].src == CHECK ? UNCHECK : CHECK);
      });

      // COLUMNS RESIZE & SCROLL

      /* Both:

      - projects imported tasks
      - activities tasks lists

      are to be scrollable independently from each other. To do that,
      we put each into a separate DIV that ends at the screen bottom
      and has its own independent scroll */

      // Update columns heights right after the page rendering is finished
      $(document).ready(function(){
          $('.scrollingcolumns').css('max-height', window.innerHeight-80);
      });

      // Update columns heights right if page was resized
      $(window).resize(function(){
          $('.scrollingcolumns').css('max-height', window.innerHeight-80);
      });

/*  </script>*/