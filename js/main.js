$(function() {

  reDrawPlan();

  var key = "8ea1f58246d1e74d0f1668267a730189";
  var id = "2f8c1c0c";

  $(".show-advanced").on('click', function(){
    $('.advanced-search').toggleClass('show-flex');
  })

  $(".recipe-search").on('submit', function(event){
    event.preventDefault();

    var query = {};
    var searchField = $('.search-field').val();
    if(searchField != "") query.q = [searchField];

    $('input:checked').each(function(item){
      if(query[this.name]){
        query[this.name].push(this.value);
      }else{
        query[this.name] = [this.value];
      }
    })

    console.log(query);
    getRecipes(query);
  });


  $("main").on('click', '.more', function(event){
    var recipe = $(this).closest('.recipe')[0];
    var clickedRecipeShowing = $(recipe).hasClass('showing-recipe-info');
    var recipeId = $(recipe).data('recipe-id');
    var mainLeftOffset = $('main').offset().left;

    $('.recipe').removeClass('showing-recipe-info');
    $('.show-recipe-info').removeClass('show-recipe-info');

    if(!clickedRecipeShowing){
      if($(recipe).next().hasClass('recipe-info')){
        $(recipe).next().addClass('show-recipe-info');
      }else{
        $(recipe).after("<div class='recipe-info show-recipe-info' data-recipe-id='"+recipeId+"'></div>");
        getRecipeDetails(recipeId, $(recipe).next());
      }
      $(recipe).addClass('showing-recipe-info');

      var recipeTopOffset = $(recipe).offset().top + $(recipe).outerHeight();

      $('.show-recipe-info').offset({top: recipeTopOffset, left: mainLeftOffset});
    }
  });

  $('main').on('click', '.recipe .fa-calendar', function(){
    var recipe = $(this).closest('.recipe');
    $(recipe).find('.day-box').slideToggle(200);
  })

  $('aside .fa-calendar').on('click', function(){
    $(this).closest('aside').toggleClass('slideAside');
  })

// Click on day of the week
  $('main').on('click', '.day', function(){
    var recipe = $(this).closest('.recipe');
    var toStore = {
      id: $(recipe).data('recipe-id'),
      imageUrl: $(recipe).find('img').attr('src'),
      title: $(recipe).find('h4').text()
    };
    MMStorage = localStorage.getItem('meal-magnet') ? JSON.parse(localStorage.getItem('meal-magnet')) : {};
    if(MMStorage[$(this).text()]) {
      if(Object.keys(MMStorage[$(this).text()]).length < 3){
        MMStorage[$(this).text()][toStore.id] = {imageUrl: toStore.imageUrl, title: toStore.title};
      }else{
        alert("You've already chosen 3 recipes for Monday. Please remove one to add another.");
      }
    }else{
      MMStorage[$(this).text()] = {};
      MMStorage[$(this).text()][toStore.id] = {imageUrl: toStore.imageUrl, title: toStore.title};
    }
    localStorage.setItem('meal-magnet', JSON.stringify(MMStorage));
    $(this).closest('.day-box').slideToggle();

    reDrawPlan();
  });

// Click on delete recipe from plan
  $('aside').on('click', 'i.fa-close', function(){
    var recipeId = $(this).data('recipe-id');
    var day = $(this).closest('.day').data('day');
    var MMStorage = JSON.parse(localStorage.getItem('meal-magnet'))
    delete MMStorage[day][recipeId];
    localStorage.setItem('meal-magnet', JSON.stringify(MMStorage));

    reDrawPlan();
  });

  function reDrawPlan() {

    if(!localStorage.getItem('meal-magnet')) return;

    var weeklyPlan = $('.weekly-plan');
    $(weeklyPlan).html("");

    MMStorage = JSON.parse(localStorage.getItem('meal-magnet'));

    for (var day in MMStorage) {
      if (MMStorage.hasOwnProperty(day)) {
        var contents = "";
        var dayBucket = MMStorage[day];
        for (var recipeId in dayBucket) {
          if (dayBucket.hasOwnProperty(recipeId)) {
            var img = "<img height='50' width='50' src='"+dayBucket[recipeId].imageUrl+"' alt='recipe image'>";
            var title = "<h5>"+dayBucket[recipeId].title+"</h5>";
            var deleteButton = "<i class='fa fa-close' data-recipe-id='"+recipeId+"'></i>"

            contents += "<div class='recipe'>"+img+title+deleteButton+"</div>";
          }
        }
        $(weeklyPlan).append("<div class='day' data-day='"+day+"'>"+contents+"</div>");
      }
    }
  }

  function getRecipes(query) {

    var baseUrl = "http://api.yummly.com/v1/api/recipes?_app_id="+id+"&_app_key="+key+"&requirePictures=true&maxResult=100&start=0&"

    for (var i in query) {
      if (query.hasOwnProperty(i)) {
        query[i].forEach(function(item, index, array){
          baseUrl += i + '=' + item + '&';
        });
      }
    }
    baseUrl = baseUrl.replace(/&$/, "");
    console.log(baseUrl)
    var recipe = {};
    $.ajax({
      url:baseUrl,
      method: 'GET',
      dataType: "jsonp"
    }).then(function(data) {
      $('main').html("");
      console.log(data);

      var dayBox = "<div class='day-box'><div class='day'>Monday</div><div class='day'>Tuesday</div><div class='day'>Wednesday</div><div class='day'>Thursday</div><div class='day'>Friday</div><div class='day'>Saturday</div><div class='day'>Sunday</div></div>";
      data.matches.forEach(function(recipe){
        $('main').append("<article class='recipe' data-recipe-id='"+recipe.id+"'><div class='image-crop'><img height='400' src='"+recipe.imageUrlsBySize[90].replace(/=s90/, '=s350')+"'><i class='fa fa-plus-circle more'></i><span class='floating-icons'><i class='fa fa-calendar'></i><i class='fa fa-star'></i>"+"</span>"+dayBox+"</div><h4>"+recipe.recipeName+"</h4></article>")
      });
    })
  }



  function getRecipeDetails(recipeId, element){
    var recipe = {};
    $.ajax({
      url: "http://api.yummly.com/v1/api/recipe/"+recipeId+"?_app_id="+id+"&_app_key="+key,
      method: 'GET',
      dataType: 'jsonp'
    }).then(function(data) {
      console.log(data);

      var nutritionalAttributes = ["ENERC_KCAL", "FAT", "CHOCDF", "FIBTG", "SUGAR", "PROCNT", "CA"];


      var name = data.name ? '<h2 class="title">' + data.name + '</h2>' : "";
      var rating = data.rating ? '<span class="rating">' + data.rating + '/5 <i class="fa fa-star"></i></span>' : "";
      var attribution = data.attribution.url ? '<a class="attribution" href="'+data.attribution.url+'">Powered by Yummly.com</a>' : "";
      var image = data.images[0].hostedLargeUrl ? '<img class="recipe-image" src="'+data.images[0].hostedLargeUrl+'">' : "";
      var cooktime = data.totalTime ? '<p class="cooktime">'+data.totalTime+'</p>' : "";
      var servings = data.yeild ? '<p class="servings">Serves: '+data.yeild+'</p>' : "";
      var fullRecipe = data.sourceRecipeUrl ? "<a class='full-recipe' target=_blank href='"+data.sourceRecipeUrl+"'>See full recipe</a>" : "";

      var ingredients = data.ingredientLines ? data.ingredientLines.reduce(function(prev, item){
        return prev + "<li>"+item+"</li>"
      }, "<ul class='ingredients'>") + "</ul>" : "";

      var nutrition = data.nutritionEstimates ? data.nutritionEstimates.reduce(function(prev, item){
        if(nutritionalAttributes.includes(item.attribute)){
          if(!item.description) item.description = "";
          return prev + "<li>"+item.description.replace(/,[a-z]/i, "")+": "+item.value+" "+item.unit.plural+"</li>"
        }
        return prev;
      }, "<ul class='nutrition'>") + "</ul>" : "";


      var top = "<div class='row header'>"+name+rating+attribution+"</div>"
      var column1 = "<div class='column'>"+image+"<div>"+cooktime+servings+fullRecipe+"</div></div>";
      var column2 = "<div class='column ingredients'><h3>Ingredients: </h3>"+ingredients+"</div>";
      var column3 = "<div class='column nutrition'><h3>Nutrition</h3>"+nutrition+"</div>";
      $(element).html("<div class='contents'>"+top+"<div class='row'>"+column1+column2+column3+"</div></div>");
    })
  }

  //getRecipe();
});
