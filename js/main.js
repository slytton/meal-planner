$(function() {



  function getRecipe(search) {

    // Get a recipe summary
    https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/{id}/summary

    // Get detailed recipe information
    https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/{id}/information

    $.ajaxSetup({
      headers: {
        'X-Mashape-Key': 'tbpoMCrW7rmsh2PcZ4JaEfzmgz8wp17qvz9jsnrkH1VtZ2FTCD'
      }
    });

    $.ajax({
      url:"https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=italian&diet=vegetarian",
      method: 'GET'
    }).then(function(data) {
      console.log(data);
    })
  }

  getRecipe();


});
