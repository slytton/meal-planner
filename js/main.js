$(function() {
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


  function getRecipes(query) {

    var baseUrl = "http://api.yummly.com/v1/api/recipes?_app_id="+id+"&_app_key="+key+"&requirePictures=true&maxResult=100&start=0&"

    for (var i in query) {
      baseUrl += i + '=';
      if (query.hasOwnProperty(i)) {
        query[i].forEach(function(item, index, array){
          baseUrl += item;
          if(index < array.length - 1) baseUrl += ",";
        });
      }
      baseUrl += '&';
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

      data.matches.forEach(function(recipe){
        $('main').append("<article class='recipe' data-recipe-id='"+recipe.id+"'><div><img height='400' src='"+recipe.imageUrlsBySize[90].replace(/=s90/, '=s350')+"'><i class='fa fa-plus-circle more'></i><span class='add'><i class=''</span></div><h4>"+recipe.recipeName+"</h4></article>")
      });
    })
  }

  function getRecipeDetails(recipeId, element){
    $(element).html("<div class='contents'>Hello World</div>");
    var recipe = {};
    $.ajax({
      url: "http://api.yummly.com/v1/api/recipe/"+recipeId+"?_app_id="+id+"&_app_key="+key,
      method: 'GET',
      dataType: 'jsonp'
    }).then(function(data) {
      var name = data.name;
      var attribution = data.attribution;
      var ingredients = data.ingredientLines;
      var nutritionCalories = [data.nutritionEstimates[0],
                               data.nutritionEstimates[1],
                               data.nutritionEstimates[7],
                               data.nutritionEstimates[8],
                               data.nutritionEstimates[9],
                               data.nutritionEstimates[12]];
      var name = data.name;
      var servings = data.yeild;
      var cookTime = data.totalTime;
      var rating = data.rating;
      var fullRecipe = data.sourceRecipeUrl;

      var name = '<h3 class="title">' + data.name + '</h3>'
      var attribution = '<h6 class="attribution"><a href="'+data.attribution.url+'"Powered by Yummly.com</a></h6>';
      var ingredients = data.ingredientLines.reduce(function(prev, item){
        return prev + "<li>"+item+"</li>"
      }, "<ul class='ingredients'>") + "</ul>";
      
      $(element).html();
    })
  }
    // Get a recipe summary
    // https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/{id}/summary

    // Get detailed recipe information
    //https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/{id}/information


  //getRecipe();


});
