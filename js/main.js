$(function() {

  reDrawPlan();

  var key = "8ea1f58246d1e74d0f1668267a730189";
  var id = "2f8c1c0c";

  $(".show-advanced").on('click', function(){
    $('.advanced-search').toggleClass('show-flex');
  })

  var query = {};
  $(".recipe-search").on('submit', function(event){
    $('main').empty()
    event.preventDefault();

    var searchField = $('.search-field').val();
    if(searchField != "") query.q = [searchField];

    $('input:checked').each(function(item){
      if(query[this.name]){
        query[this.name].push(this.value);
      }else{
        query[this.name] = [this.value];
      }
    })

    $(this).find('.advanced-search').removeClass('show-flex');
    console.log(query);
    getRecipes();
  });


  $("main").on('click', '.recipe img, .more', function(event){
    var recipe = $(this).closest('.recipe')[0];
    var clickedRecipeShowing = $(recipe).hasClass('showing-recipe-info');
    var recipeId = $(recipe).data('recipe-id');


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

      updateOffset();
    }
  });

  $(window).on('resize', function(){
    updateOffset();
  });

  function updateOffset(){
    var recipe = $('.showing-recipe-info');
    var mainLeftOffset = $('main').offset().left;
    var recipeTopOffset = $(recipe).offset().top + $(recipe).outerHeight();

    $('.show-recipe-info').offset({top: recipeTopOffset, left: mainLeftOffset});
  }

  $('main').on('click', '.recipe .fa-calendar', function(event){
    var recipe = $(this).closest('.recipe');
    $(recipe).find('.day-box').slideToggle(200);
  })

  $('aside .fa-calendar').on('click', function(){
    var aside = $(this).closest('aside');
    $(aside).toggleClass('slideAside')
    $(aside).find('.weekly-plan').toggleClass('show-plan')
  })

// Click on day of the week
  $('main').on('click', '.day', function(){
    var recipe = $(this).closest('.recipe');
    var day = $(this).text();
    var toStore = {
      id: $(recipe).data('recipe-id'),
      imageUrl: $(recipe).find('img').attr('src'),
      title: $(recipe).find('h4').text()
    };
    MMStorage = localStorage.getItem('meal-magnet') ? JSON.parse(localStorage.getItem('meal-magnet')) : {};
    if(MMStorage[day]) {
      if(Object.keys(MMStorage[day]).length < 3){
        MMStorage[day][toStore.id] = {imageUrl: toStore.imageUrl, title: toStore.title};
      }else{
        alert("You've already chosen 3 recipes for Monday. Please remove one to add another.");
      }
    }else{
      MMStorage[day] = {};
      MMStorage[day][toStore.id] = {imageUrl: toStore.imageUrl, title: toStore.title};
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
    if(Object.keys(MMStorage[day]).length === 0) delete MMStorage[day];
    localStorage.setItem('meal-magnet', JSON.stringify(MMStorage));

    reDrawPlan();
  });


  function reDrawPlan() {
    var weeklyPlan = $('.weekly-plan');
    var emptyMessage = "<h3 class='empty-text'>Choose some recipes!</h3>"
    var toSort = [];
    if(!localStorage.getItem('meal-magnet')) return $(weeklyPlan).html(emptyMessage);
    MMStorage = JSON.parse(localStorage.getItem('meal-magnet'));
    if(objectLength(MMStorage) === 0) return $(weeklyPlan).html(emptyMessage);

    $(weeklyPlan).html("");


    for (var day in MMStorage) {
      if (MMStorage.hasOwnProperty(day)) {
        var contents = "";
        var dayBucket = MMStorage[day];
        for (var recipeId in dayBucket) {
          if (dayBucket.hasOwnProperty(recipeId)) {
            var img = "<img height='60' width='60' src='"+dayBucket[recipeId].imageUrl+"' alt='recipe image'>";
            var title = "<p>"+dayBucket[recipeId].title+"</p>";
            var deleteButton = "<i class='fa fa-close' data-recipe-id='"+recipeId+"'></i>"

            contents += "<div class='recipe'>"+deleteButton+img+title+"</div>";
          }
        }
        var dayTitle = '<h3>'+day+'<h3>';
        toSort.push("<div class='day' data-day='"+day+"'>"+dayTitle+contents+"</div>");
      }
    }

    $(weeklyPlan).html(sortStringsByDayNames(toSort).join(""));

  }

  function sortStringsByDayNames(elements){
    var order = {Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6}
    var regex = /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/;
    elements.sort(function(a, b){
      return order[a.match(regex)[0]] - order[b.match(regex)[0]]
    })
    return elements;
  }

  var ajaxRecipeSearch = {
    notFired: true,
    startAt: 0
  }

  $(window).scroll(function() {
    var docHeight = $(document).height();
    var atHeight = $(window).scrollTop();

    if(atHeight > docHeight*0.7 && ajaxRecipeSearch.notFired) {
      ajaxRecipeSearch.notFired = false;
      ajaxRecipeSearch.startAt += 100;
      getRecipes();
      console.log('fire api');
    }
  });


  function getRecipes() {
    var baseUrl = "https://api.yummly.com/v1/api/recipes?_app_id="+id+"&_app_key="+key+"&requirePictures=true&maxResult=100&start="+ajaxRecipeSearch.startAt+"&"

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
    }).then(function(data){
      renderRecipeSearch(data);
      ajaxRecipeSearch.notFired = true;
    })
  }


  function renderRecipeSearch(data){
    console.log(data);
    var dayBox = "<div class='day-box'><div class='day'>Monday</div><div class='day'>Tuesday</div><div class='day'>Wednesday</div><div class='day'>Thursday</div><div class='day'>Friday</div><div class='day'>Saturday</div><div class='day'>Sunday</div></div>";
    data.matches.forEach(function(recipe){
      $('main').append("<article class='recipe' data-recipe-id='"+recipe.id+"'><div class='image-crop'><img height='400' src='"+recipe.imageUrlsBySize[90].replace(/=s90/, '=s350')+"'><i class='fa fa-plus-circle more'></i><span class='floating-icons'><i class='fa fa-calendar'></i><i class='fa fa-star'></i>"+"</span>"+dayBox+"</div><h4>"+recipe.recipeName+"</h4></article>")
    });
  }



  function getRecipeDetails(recipeId, element){
    var recipe = {};
    $.ajax({
      url: "https://api.yummly.com/v1/api/recipe/"+recipeId+"?_app_id="+id+"&_app_key="+key,
      method: 'GET',
      dataType: 'jsonp'
    }).then(function(data) {
      console.log(data);

      var nutritionalAttributes = ["ENERC_KCAL", "FAT", "CHOCDF", "FIBTG", "SUGAR", "PROCNT", "CA"];


      var name = data.name ? '<h2 class="title">' + data.name + '</h2>' : "";
      var rating = data.rating ? '<span class="rating">' + data.rating + '/5 <i class="fa fa-star"></i></span>' : "";
      var attribution = data.attribution.url ? '<a class="attribution" href="'+data.attribution.url+'">Powered by Yummly.com</a>' : "";
      var image = data.images[0].hostedLargeUrl ? '<img class="recipe-image" src="'+data.images[0].hostedLargeUrl+'">' : "";
      var cooktime = data.totalTime ? '<p class="cooktime">Cooktime: '+data.totalTime+'</p>' : "";
      var servings = data.yield ? '<p class="servings">Serves: '+data.yield+'</p>' : "";
      var fullRecipe = data.source.sourceRecipeUrl ? "<a class='full-recipe' target=_blank href='"+data.source.sourceRecipeUrl+"'>See full recipe <i class='fa fa-arrow-right'></i></a>" : "";

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
      var column2 = "<div class='column ingredients'><h3>Ingredients </h3>"+ingredients+"</div>";
      var column3 = "<div class='column nutrition'><h3>Nutrition</h3>"+nutrition+"</div>";
      $(element).html("<div class='contents'>"+top+"<div class='row'>"+column1+column2+column3+"</div></div>");
    })
  }

  //getRecipe();
});


function objectLength(object) {
  return Object.keys(object).length;
}
