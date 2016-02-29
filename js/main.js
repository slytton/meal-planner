$(function() {

  $.ajaxSetup({
    headers: {
      'X-Mashape-Key': 'tbpoMCrW7rmsh2PcZ4JaEfzmgz8wp17qvz9jsnrkH1VtZ2FTCD'
    }
  });

  $(".show-advanced").on('click', function(){
    $('.advanced-search').toggleClass('show-flex');
  })

  $(".recipe-search").on('submit', function(event){
    event.preventDefault();

    var query = {};
    var searchField = $('.search-field').val();
    if(searchField != "") query.query = [searchField];

    $('input:checked').each(function(item){
      if(query[this.name]){
        query[this.name].push(this.value);
      }else{
        query[this.name] = [this.value];
      }
    })

    console.log(query);
    getRecipes(query);
  })

  $("main").on('click', '.recipe .more', function(event){
    var article = $(this).closest('.recipe')[0];
    console.log(article.image.match(/\d+/)[0]);
    var id = article.id || article.image.match(/\d+/)[0]
    //getRecipeDetails(id);
  })


  function getRecipes(query) {

    var baseUrl = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/searchComplex?includeIngredients=%2C&number=100&minCalories=1&ranking=1&limitLicense=true&"

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
      method: 'GET'
    }).then(function(data) {
      $('main').html("");
      console.log(data)
      data.baseUri
      data.results.forEach(function(recipe){
        $('main').append("<article class='recipe' id='"+recipe.id+"'><div><img height='400' src='"+recipe.image+"'><i class='fa fa-plus-circle more'></i></div><h4>"+recipe.title+"</h4></article>")
      });
    })
  }

  function getRecipeDetails(recipeId){
    var recipe = {};
    $.ajax({
      url: "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/"+recipeId+"/information",
      method: 'GET'
    }).then(function(data) {
      console.log(data)
    })
  }
    // Get a recipe summary
    //https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/{id}/summary

    // Get detailed recipe information
    //https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/{id}/information


  //getRecipe();


});
